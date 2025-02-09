import { Client } from '@takaro/apiclient';
import ms from 'ms';
import { integrationConfig } from './test/integrationConfig.js';
import { logger } from '@takaro/util';
import { before } from 'node:test';

const log = logger('tests');

before(async () => {
  const client = new Client({
    url: integrationConfig.get('host'),
    auth: {},
  });

  log.info('Waiting for app to be healthy');

  await client.waitUntilHealthy(ms('5 minutes'));
});
