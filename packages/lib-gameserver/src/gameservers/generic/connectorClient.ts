import axios, { AxiosError, AxiosInstance } from 'axios';
import { config } from '../../config.js';

function getConnectorClient() {
  const connectorClient = axios.create({
    baseURL: config.get('connector.host'),
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Takaro',
    },
  });

  connectorClient.interceptors.request.use((request) => {
    console.log(`➡️ ${request.method?.toUpperCase()} ${request.url}`, {
      method: request.method,
      url: request.url,
    });
    return request;
  });

  connectorClient.interceptors.response.use(
    (response) => {
      console.log(
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

      console.error(`☠️ Request errored: [${error.response?.status}] ${details}`, {
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
    return this.client.post(`/gameserver/${id}/request`, { operation, data });
  }
}
