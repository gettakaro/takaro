import axios, { AxiosError, AxiosInstance, isAxiosError } from 'axios';
import { config } from '../../config.js';
import { errors, logger } from '@takaro/util';

function getConnectorClient() {
  const log = logger('client:connector');

  const connectorClient = axios.create({
    baseURL: config.get('connector.host'),
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Takaro',
    },
  });

  connectorClient.interceptors.request.use((request) => {
    log.debug(`➡️ ${request.method?.toUpperCase()} ${request.url}`, {
      method: request.method,
      url: request.url,
      operation: request.data?.operation,
    });
    return request;
  });

  connectorClient.interceptors.response.use(
    (response) => {
      log.debug(
        `⬅️ ${response.request.method?.toUpperCase()} ${response.request.path} ${response.status} ${
          response.statusText
        }`,
        {
          status: response.status,
          method: response.request.method,
          url: response.request.url,
          operation: response.config.data?.operation,
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

      log.warn(`☠️ Request errored: [${error.response?.status}] ${details}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        method: error.config?.method,
        url: error.config?.url,
        response: error.response?.data,
      });

      return Promise.reject(error);
    },
  );

  return connectorClient;
}

export class TakaroConnector {
  private client: AxiosInstance;
  constructor() {
    this.client = getConnectorClient();
  }

  async requestFromServer(id: string, operation: string, data: string): Promise<any> {
    try {
      const res = await this.client.post(`/gameserver/${id}/request`, { operation, data });
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.data.meta.error.code === 'ValidationError') {
          throw new errors.BadRequestError(
            'The gameserver responded with bad data, please verify that the mod is up to date.',
          );
        }

        if (error.response?.status) {
          if (error.response?.status >= 400 && error.response?.status < 500) {
            throw new errors.BadRequestError(error.response?.data.meta.error.message);
          }
        }
      }
      throw error;
    }
  }

  async resetConnection(id: string): Promise<any> {
    try {
      await this.client.post(`/gameserver/${id}/reset`);
      return;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.data.meta.error.code === 'ValidationError') {
          throw new errors.BadRequestError(
            'The gameserver responded with bad data, please verify that the mod is up to date.',
          );
        }
      }
      throw error;
    }
  }
}
