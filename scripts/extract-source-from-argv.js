const extractSourceFromArgv = (argv) => {
  const [,,sourceArg] = argv;
  return (sourceArg) ? sourceArg.replace('--source=', '') : 'src';
}

module.exports = extractSourceFromArgv;
