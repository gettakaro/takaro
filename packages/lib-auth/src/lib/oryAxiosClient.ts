import axios, { AxiosError } from 'axios';
import { addCounterToAxios, errors, logger } from '@takaro/util';

const log = logger('ory:http');

export function createAxiosClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Takaro-Agent',
    },
  });

  addCounterToAxios(client, {
    name: 'ory_api_requests_total',
    help: 'Total number of requests to the Ory API',
  });

  client.interceptors.request.use((request) => {
    log.silly(`➡️ ${request.method?.toUpperCase()} ${request.url}`, {
      method: request.method,
      url: request.url,
    });
    return request;
  });

  client.interceptors.response.use(
    (response) => {
      log.silly(
        `⬅️ ${response.request.method?.toUpperCase()} ${response.request.path} ${response.status} ${
          response.statusText
        }`,
        {
          status: response.status,
          method: response.request.method,
          url: response.request.url,
        },
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
        status: error.response?.status,
        statusText: error.response?.statusText,
        method: error.config?.method,
        url: error.config?.url,
        response: error.response?.data,
      });

      if (error.response?.status === 409) {
        return Promise.reject(new errors.ConflictError('User with this identifier already exists'));
      }

      return Promise.reject(error);
    },
  );

  return client;
}
