module.exports = {
  timeout: 30000,
  require: ['ts-node/register'],
  recursive: true,
  ['reporter-option']: ['maxDiffSize=16000'],
};
