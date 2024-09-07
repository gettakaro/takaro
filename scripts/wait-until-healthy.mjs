import { Client, AdminClient } from '@takaro/apiclient';
const takaroHost = process.env.TAKARO_HOST;

const adminClient = new AdminClient({
  url: takaroHost,
  auth: {
    clientSecret: 'empty', // We'll only call the health check, so we don't need a real secret
  },
});

try {
  await adminClient.waitUntilHealthy();
} catch (error) {
  console.error('Could not connect to Takaro API, is your config correct?');
  process.exit(1);
}
