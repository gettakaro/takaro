import { MetaApi } from '../generated/api.js';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

export interface IBaseApiClientConfig {
  url: string;
  log?: Logger | false;
}

interface Logger {
  info: (msg: string, meta?: unknown) => void;
  warn: (msg: string, meta?: unknown) => void;
  error: (msg: string, meta?: unknown) => void;
  debug: (msg: string, meta?: unknown) => void;
}

export class BaseApiClient<T extends IBaseApiClientConfig> {
  protected axios: AxiosInstance;
  protected log: Logger = {
    error: () => {},
    info: () => {},
    warn: () => {},
    debug: () => {},
  };

  constructor(protected readonly config: T) {
    const axiosConfig: AxiosRequestConfig = {
      baseURL: this.config.url,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Takaro-API-Client',
      },
      withCredentials: true,
    };
    this.axios = this.addLoggers(axios.create(axiosConfig));

    if (this.config.log) this.log = this.config.log;
  }

  setHeader(key: string, value: string) {
    this.axios.defaults.headers.common[key] = value;
  }

  get axiosInstance() {
    return this.axios;
  }

  isJsonMime(mime: string) {
    return mime === 'application/json';
  }

  private addLoggers(axios: AxiosInstance): AxiosInstance {
    if (this.config.log === false) {
      return axios;
    }

    axios.interceptors.request.use((request) => {
      let prettyBody = null;

      if (request.data) {
        try {
          prettyBody = JSON.parse(request.data);
        } catch {
          prettyBody = 'Could not parse body';
        }
      }

      this.log.info(`➡️ ${request.method?.toUpperCase()} ${request.url}`, {
        method: request.method,
        url: request.url,
        body: prettyBody ?? undefined,
      });
      return request;
    });

    axios.interceptors.response.use(
      (response) => {
        this.log.info(
          `⬅️ ${response.request.method?.toUpperCase()} ${response.request.path} ${response.status} ${
            response.statusText
          }`,
          {
            status: response.status,
            statusText: response.statusText,
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
          details = JSON.stringify(data.meta);
        }

        this.log.error('☠️ Request errored', {
          traceId: error.response?.headers['x-trace-id'],
          details,
          status: error.response?.status,
          statusText: error.response?.statusText,
          method: error.config?.method,
          url: error.config?.url,
          response: error.response?.data,
        });
        return Promise.reject(error);
      },
    );

    return axios;
  }

  /**
   * Wait until the API reports that it is healthy
   * @param timeout in milliseconds
   */
  async waitUntilHealthy(timeout = 600000) {
    const start = Date.now();
    let isHealthy = false;
    while (!isHealthy) {
      try {
        const { data } = await this.meta.metaGetHealth();
        if (data.healthy) {
          isHealthy = true;
        }
      } catch {
        // ignore
      }

      if (Date.now() - start > timeout) {
        throw new Error('API did not become healthy in time');
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  get meta() {
    return new MetaApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios,
    );
  }
}
