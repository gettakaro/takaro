import { Client } from '@takaro/apiclient';
import { config } from './config.js';

export async function getTakaro(): Promise<Client> {
  const takaro = new Client({
    url: config.get('apiClient.url'),
    auth: {
      token: config.get('apiClient.token'),
    },
  });

  return takaro;
}
