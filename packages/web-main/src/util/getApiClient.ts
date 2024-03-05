import { Client } from '@takaro/apiclient';
import { getConfigVar } from './getConfigVar';

let cachedClient: Client | null = null;

export const getApiClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = new Client({
    url: getConfigVar('apiUrl'),
    auth: {},
    log: {
      debug: () => {},
      info: () => {},
      warn: console.warn,
      error: console.error,
    },
  });

  return cachedClient;
};
