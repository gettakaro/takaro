import { Client } from '@takaro/apiclient';
import ms from 'ms';
import { integrationConfig } from './test/integrationConfig';
import { logger } from '@takaro/logger';

const log = logger('tests');

before(async () => {
  if (process.env.LOGGING_LEVEL === 'none') {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.log = () => {};
  }

  const client = new Client({
    url: integrationConfig.get('host'),
    auth: {},
  });

  log.info('Waiting for app to be healthy');

  await client.waitUntilHealthy(ms('10 minutes'));
});
