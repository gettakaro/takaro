import axios, { AxiosError } from 'axios';
import { logger } from '@takaro/util';

const log = logger('ory:http');

export function createAxiosClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Takaro-Agent',
    },
  });

  client.interceptors.request.use((request) => {
    log.info(`➡️ ${request.method?.toUpperCase()} ${request.url}`, {
      method: request.method,
      url: request.url,
    });
    return request;
  });

  client.interceptors.response.use(
    (response) => {
      log.info(
        `⬅️ ${response.request.method?.toUpperCase()} ${
          response.request.path
        } ${response.status} ${response.statusText}`,
        {
          status: response.status,
          statusText: response.statusText,
          method: response.request.method,
          url: response.request.url,
        }
      );

      return response;
    },
    (error: AxiosError) => {
      let details = {};

      if (error.response?.data) {
        const data = error.response.data as Record<string, unknown>;
        details = JSON.stringify(data.error_description);
      }

      log.error(`☠️ Request errored: [${error.response?.status}] ${details}`, {
        error,
        details,
        status: error.response?.status,
        statusText: error.response?.statusText,
        method: error.config?.method,
        url: error.config?.url,
        headers: error.response?.headers,
        response: error.response?.data,
      });
      return Promise.reject(error);
    }
  );

  return client;
}
