module.exports = {
  timeout: 30000,
  require: ['ts-node/register'],
  recursive: true,
  retries: process.env.CI ? 4 : 0,
};
