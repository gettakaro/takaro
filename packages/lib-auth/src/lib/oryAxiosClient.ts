import { AxiosError } from 'axios';
import { addCounterToAxios, errors, logger } from '@takaro/util';
import { createAxios } from '@takaro/apiclient';

export function createAxiosClient(baseURL: string) {
  const log = logger('ory:http');
  const client = createAxios(
    {
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Takaro-Agent',
      },
    },
    {
      logger: log,
    },
  );

  addCounterToAxios(client, {
    name: 'ory_api_requests_total',
    help: 'Total number of requests to the Ory API',
  });

  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 409) {
        return Promise.reject(new errors.ConflictError('User with this identifier already exists'));
      }
      return Promise.reject(error);
    },
  );

  return client;
}
