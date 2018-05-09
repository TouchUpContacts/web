const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');

const extractSourceFromArgv = require('./extract-source-from-argv');

const processTemplates = async () => {
  try {
    const src = extractSourceFromArgv(process.argv);
    const files = await util.promisify(fs.readdir)(path.join(process.env.PWD, src));

    const tmpContent = await util.promisify(fs.readdir)(path.join(process.env.PWD, 'tmp'));
    let [ jsFile ] = tmpContent.filter((file) => {
      return /app-[0-9]+.min.js$/.test(file);
    });

    let [ cssFile ] = tmpContent.filter((file) => {
      return /app-[0-9]+.min.css$/.test(file);
    });

    for (const file of files) {
      if(!/.html$/.test(file)) continue;
      if('redirect.html' === file) continue;

      const readStream = fs.createReadStream(path.join(process.env.PWD, src, file));
      const writeStream = fs.createWriteStream(path.join(process.env.PWD, 'tmp', 'with-resources', file));
      const injectJs = new stream.Transform({
        transform(chunk, encoding, callback) {
          this.push(
            chunk
              .toString()
              .replace('<!-- inject:js -->', jsFile)
              .replace('<!-- inject:css -->', cssFile));
          callback();
        }
      });

      readStream
        .pipe(injectJs)
        .pipe(writeStream)
    }
  } catch (e) {
    throw e;
  }
}

processTemplates()
  .then(() => {
    // process.exit(0);
  })
  .catch(e => {
    process.exit(1);
  })

