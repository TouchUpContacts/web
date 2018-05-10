const fs = require("fs");
const path = require("path");
const stream = require("stream");

const [,,type, name] = process.argv;

if (!name || !type) {
  console.error('You must give two arguments to this command');
  process.exit(1)
};

const processCreation = async (name) => {
  try {
    const readStream = fs.createReadStream(path.join(__dirname, '..', 'templates', `detail.html`));

    try {
      fs.statSync(path.join(__dirname, '..', 'src', `${type}s`))
    } catch (e) {
      fs.mkdirSync(path.join(__dirname, '..', 'src', `${type}s`));
    }

    const writeStream = fs.createWriteStream(path.join(__dirname, '..', 'src', `${type}s`, `${name}.html`));

    const injectNameAndType = new stream.Transform({
      transform(chunk, encoding, callback) {
        this.push(
          chunk
            .toString()
            .replace(new RegExp('<%= name =>', 'g'), name)
            .replace(new RegExp('<%= type =>', 'g'), type)
        );
        callback();
      }
    });

    readStream
      .pipe(injectNameAndType)
      .pipe(writeStream);

    return `Page ${name} successfully created and added to git.`;
  } catch (e) {
    throw e;
  }
};

processCreation(name)
  .then()
  .catch()
