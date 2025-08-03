import { AxiosInstance, isAxiosError } from 'axios';
import { config } from '../../config.js';
import { errors, logger, createAxios } from '@takaro/util';

function getConnectorClient() {
  const log = logger('client:connector');

  const connectorClient = createAxios(
    {
      baseURL: config.get('connector.host'),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Takaro',
      },
    },
    { logger: log },
  );

  // Add custom interceptor for operation logging
  connectorClient.interceptors.request.use((request) => {
    if (request.data?.operation) {
      log.debug(`Operation: ${request.data.operation}`);
    }
    return request;
  });

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
