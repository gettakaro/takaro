import { Client } from '@takaro/apiclient';

let cachedClient: Client | null = null;

declare global {
  interface Window {
    __env__: Record<string, string>;
  }
}

export const useApiClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  const apiUrl = window.__env__.REACT_APP_API || process.env.REACT_APP_API;

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
