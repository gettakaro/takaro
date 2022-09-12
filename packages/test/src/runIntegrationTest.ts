import { upMany, logs, exec } from 'docker-compose';
import { Client } from '@takaro/apiclient';
import { integrationConfig } from './main';
import ms from 'ms';

const composeOpts = {
  log: true,
  composeOptions: ['-f', '../../docker-compose.yml'],
};

describe('Integration tests', () => {
  it('Runs docker-compose API tests', async function () {
    this.timeout(ms('30 minutes'));
    await composeApiTest();
  });
});

async function composeApiTest() {
  await upMany(['postgresql', 'redis', 'takaro'], composeOpts);

  const client = new Client({
    url: integrationConfig.get('host'),
    auth: {},
  });

  let failed = false;

  try {
    console.log('Waiting for app to be healthy');
    await client.waitUntilHealthy(600);
    await exec('takaro', 'npm test', composeOpts);
  } catch (error) {
    console.error('Tests failed');
    console.error(error);
    failed = true;
  }

  if (failed) {
    await logs(['postgresql', 'redis', 'takaro'], composeOpts);
    process.exit(1);
  }
}
