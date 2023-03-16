import { Client } from '@takaro/apiclient';
import { useConfig } from './useConfig';

let cachedClient: Client | null = null;

export const useApiClient = () => {
  const cfg = useConfig();

  if (cachedClient) {
    return cachedClient;
  }

  const apiUrl = cfg.apiUrl;

  if (!apiUrl) throw new Error('REACT_APP_API is not set');

  cachedClient = new Client({
    url: apiUrl,
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
