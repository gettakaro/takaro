import { Client } from '@takaro/apiclient';
import { EnvVars } from 'EnvVars';
import { useConfig } from './useConfig';

let cachedClient: Client | null = null;

export const useApiClient = () => {
  const cfg = useConfig();

  if (cachedClient) {
    return cachedClient;
  }

  const apiUrl = cfg.apiUrl;

  if (!apiUrl) throw new Error(`${EnvVars.VITE_API} is not defined`);

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
