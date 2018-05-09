const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');

const l10n = require('l10n-template/src/l10n');

const extractSourceFromArgv = require('./extract-source-from-argv');

const processTemplate = async () => {
  try {
    const src = extractSourceFromArgv(process.argv);
    const files = await util.promisify(fs.readdir)(path.join(process.env.PWD, src));

    const levelContent = await extract('level');
    const gameContent = await extract('game');

    for (const file of files) {
      if(!/.html$/.test(file)) continue;
      if('redirect.html' === file) continue;

      const readStream = fs.createReadStream(path.join(process.env.PWD, src, file));
      const writeStream = fs.createWriteStream(path.join(process.env.PWD, 'tmp', file));
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

      readStream
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
      cardTemplate = cardTemplate.replace(new RegExp(`<%= card.${key} =>`, 'g'), `{{ ${rootName}s.${card}.${key} }}`);
    }

    cardTemplates.push(cardTemplate);
  }

  return cardTemplates;
}

const extract = async (fragmentName) => {
  const cardFragmentTemplate = await util.promisify(fs.readFile)(
    path.join(
      process.env.PWD,
      'templates',
      '_fragments',
      `${fragmentName}-card.html`
    ),
    'utf8');
  const contentMap = l10n.lookup(path.join(process.env.PWD, 'l10n'));
  return generateCardFragments(
    cardFragmentTemplate,
    contentMap.get('fr.json')[`${fragmentName}s`], // key is plural in json
    fragmentName
  ).join('');
}

processTemplate()
  .then()
  .catch(() => {
    process.exit(1);
  })
