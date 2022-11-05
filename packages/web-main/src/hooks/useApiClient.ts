import { Client } from '@takaro/apiclient';

let cachedClient: Client | null = null;

export const useApiClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  if (!process.env.REACT_APP_API) throw new Error('REACT_APP_API is not set');

  cachedClient = new Client({
    url: process.env.REACT_APP_API,
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
