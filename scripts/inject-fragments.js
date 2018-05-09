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
    const cardFragmentTemplate = await util.promisify(fs.readFile)(path.join(process.env.PWD, 'templates', '_fragments', 'level-card.html'), 'utf8');
    const contentMap = l10n.lookup(path.join(process.env.PWD, 'l10n'));
    const { levels } = contentMap.get('fr.json');
    const cardFragmentWithL10nKeys = generateCardFragments(cardFragmentTemplate, levels).join('');

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
              .replace('<!-- inject:levels -->', cardFragmentWithL10nKeys)
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

const generateCardFragments = (template, levels) => {
  let cardTemplates = [];
  for (const level in levels) {
    if(typeof levels[level] === 'string') continue;
    let cardTemplate = template;
    const keyMap = l10n.buildMap(new Map(), levels[level]);
    for (const [key] of keyMap) {
      cardTemplate = cardTemplate.replace(new RegExp(`<%= card.${key} =>`, 'g'), `{{ levels.${level}.${key} }}`);
    }

    cardTemplates.push(cardTemplate);
  }

  return cardTemplates;
}

processTemplate()
  .then()
  .catch(() => {
    process.exit(1);
  })
