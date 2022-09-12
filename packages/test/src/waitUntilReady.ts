import { Client } from '@takaro/apiclient';
import ms from 'ms';
import { integrationConfig } from './test/integrationConfig';

before(async () => {
  const client = new Client({
    url: integrationConfig.get('host'),
    auth: {},
  });

  console.log('Waiting for app to be healthy');
  await client.waitUntilHealthy(ms('10 minutes'));
});
