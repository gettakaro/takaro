import { MetaApi } from '../generated';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore doing a workaround here specifically for package json
import { version } from '../../package.json';
export interface IApiClientConfig {
  url: string;
  log?: Logger;
  auth: {
    token?: string;
    username?: string;
    password?: string;
    adminSecret?: string;
  };
}

interface Logger {
  info: (msg: string, meta?: unknown) => void;
  warn: (msg: string, meta?: unknown) => void;
  error: (msg: string, meta?: unknown) => void;
  debug: (msg: string, meta?: unknown) => void;
}

export class BaseApiClient {
  protected axios: AxiosInstance;
  protected log: Logger = {
    error: console.error,
    info: console.log,
    warn: console.warn,
    debug: console.log,
  };

  constructor(protected readonly config: IApiClientConfig) {
    const axiosConfig: AxiosRequestConfig = {
      baseURL: this.config.url,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `Takaro-API-Client@${version}`,
      },
      withCredentials: true,
    };
    this.axios = this.addAuthHeaders(
      this.addLoggers(axios.create(axiosConfig))
    );

    if (this.config.log) this.log = this.config.log;
  }

  isJsonMime(mime: string) {
    return mime === 'application/json';
  }

  private addAuthHeaders(axios: AxiosInstance): AxiosInstance {
    if (this.config.auth.token) {
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${this.config.auth.token}`;
    } else if (this.config.auth.adminSecret) {
      axios.defaults.auth = {
        username: 'admin',
        password: this.config.auth.adminSecret,
      };
    }

    return axios;
  }

  private addLoggers(axios: AxiosInstance): AxiosInstance {
    axios.interceptors.request.use((request) => {
      this.log.info(`➡️ ${request.method?.toUpperCase()} ${request.url}`, {
        method: request.method,
        url: request.url,
      });
      return request;
    });

    axios.interceptors.response.use(
      (response) => {
        this.log.info(
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
          details = JSON.stringify(data.meta);
        }

        this.log.error(`☠️ Request errored: ${error.message}`, {
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

    return axios;
  }

  /**
   * Wait until the API reports that it is healthy
   * @param timeout in milliseconds
   */
  async waitUntilHealthy(timeout = 600000) {
    const start = Date.now();
    while (true) {
      try {
        const { data } = await this.meta.metaGetHealth();
        if (data.healthy) {
          return;
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
      this.axios
    );
  }
}
