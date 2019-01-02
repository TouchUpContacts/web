const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');

const recursiveReadDir = require('recursive-readdir');
const fse = require('fs-extra');

const l10n = require('l10n-template/src/l10n');

const extractSourceFromArgv = require('./extract-source-from-argv');

const processTemplate = async () => {
  try {
    const src = extractSourceFromArgv(process.argv);
    const root = path.join(process.env.PWD, src);
    const files = await recursiveReadDir(root, ['*.scss', '*.js', 'redirect.html']);

    const levelContent = await extract('level', 'card', true);
    const gameContent = await extract('game', 'card', true);
    const footerContent = await extract('footer');

    for (const file of files) {
      const dirname = path.dirname(file).replace(root, '');
      const basename = path.basename(file);

      const readStream = fs.createReadStream(file);

      if(dirname !== '') {
        await fse.mkdirp(path.join(process.env.PWD, 'tmp', dirname));
      }

      const writeStream = fs.createWriteStream(path.join(process.env.PWD, 'tmp',  dirname, basename));
      const injectLevels = new stream.Transform({
        transform(chunk, encoding, callback) {
          this.push(
            chunk
              .toString()
              .replace('<!-- inject:levels -->', levelContent)
              .replace('<!-- inject:games -->', gameContent)
          );
          callback();
        }
      });

      const injectFooter = new stream.Transform({
        transform(chunk, encoding, callback) {
          this.push(
            chunk
              .toString()
              .replace('<!-- inject:footer -->', footerContent)
          );
          callback();
        }
      });

      readStream
        .pipe(injectFooter)
        .pipe(injectLevels)
        .pipe(writeStream)
    }
  } catch (e) {
    throw e;
  }
}

const generateCardFragments = (template, cards, rootName) => {
  let cardTemplates = [];
  for (const card in cards) {
    if(typeof cards[card] === 'string') continue;
    let cardTemplate = template;
    const keyMap = l10n.buildMap(new Map(), cards[card]);
    for (const [key] of keyMap) {
      cardTemplate = cardTemplate.replace(new RegExp(`<%= ${key} =>`, 'g'), `{{ ${rootName}.${card}.${key} }}`);
    }

    cardTemplates.push(cardTemplate);
  }

  return cardTemplates;
};

const generateFragment = (template, contentKeys, rootName) => {
  let fragment = template;
  for (const contentKey in contentKeys) {
    if (typeof contentKeys[contentKey] === 'string') continue;
    const keyMap = l10n.buildMap(new Map(), contentKeys[contentKey]);
    for (const [key] of keyMap) {
      fragment = fragment.replace(
        new RegExp(`<%= ${contentKey}.${key} =>`, 'g'),
        `{{ ${rootName}.${contentKey}.${key} }}`
      );
    }
  }

  return fragment;
};

const extract = async (fragmentName, suffix, pluralize = false) => {
  const fragmentTemplate = await util.promisify(fs.readFile)(
    path.join(
      process.env.PWD,
      'templates',
      '_fragments',
      `${fragmentName}${suffix ? `-${suffix}` : ''}.html`
    ),
    'utf8');
  const contentMap = l10n
      .lookup(path.join(process.env.PWD, 'l10n'))
      .get('fr.json')[`${fragmentName}${pluralize ? `s` : ''}`];

  let content;

  switch (suffix) {
    case 'card':
      content = generateCardFragments(
        fragmentTemplate,
        contentMap,
        pluralize ? `${fragmentName}s` : fragmentName
      ).join('');
      break;
    default:
      content = generateFragment(fragmentTemplate, contentMap, fragmentName);
  }
  return content;
};

processTemplate()
  .then()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
