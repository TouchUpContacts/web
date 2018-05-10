const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');

const recursiveReadDir = require('recursive-readdir');
const fse = require('fs-extra');

const extractSourceFromArgv = require('./extract-source-from-argv');

const processTemplates = async () => {
  try {
    const src = extractSourceFromArgv(process.argv);
    const files = await recursiveReadDir(path.join(process.env.PWD, src), ['*.scss', '*.js', 'redirect.html']);

    const tmpContent = await util.promisify(fs.readdir)(path.join(process.env.PWD, 'tmp'));
    let [ jsFile ] = tmpContent.filter((file) => {
      return /app-[0-9]+.min.js$/.test(file);
    });

    let [ cssFile ] = tmpContent.filter((file) => {
      return /app-[0-9]+.min.css$/.test(file);
    });

    for (const file of files) {
      const dirname = path.dirname(file).replace(path.join(process.env.PWD, src), '');
      const basename = path.basename(file);

      const readStream = fs.createReadStream(file);

      if(dirname !== '') {
        await fse.mkdirp(path.join(process.env.PWD, 'tmp', 'with-resources', dirname));
      }

      const writeStream = fs.createWriteStream(path.join(process.env.PWD, 'tmp', 'with-resources', dirname, basename));
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
  .then()
  .catch(e => {
    console.log(e);
    process.exit(1);
  })

