const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');

const processTemplates = async () => {
  try {
    const files = await util.promisify(fs.readdir)(path.join(process.env.PWD, 'src'));

    for (const file of files) {
      if(!/.html$/.test(file)) continue;
      if('redirect.html' === file) continue;

      const readStream = fs.createReadStream(path.join(process.env.PWD, 'src', file));
      const writeStream = fs.createWriteStream(path.join(process.env.PWD, 'tmp', file));
      const injectJs = new stream.Transform({
        transform(chunk, encoding, callback) {
          this.push(
            chunk
              .toString()
              .replace('<!-- inject:js -->', `app-${process.env.APPREV}.min.js`)
              .replace('<!-- inject:css -->', `app-${process.env.APPREV}.min.css`));
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

