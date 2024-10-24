import { MetaApi } from '../generated/api.js';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { createAxios } from './baseAxios.js';

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
    error: console.error,
    info: console.log,
    warn: console.warn,
    debug: console.log,
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

    if (this.config.log) this.log = this.config.log;
    this.axios = createAxios(axiosConfig, { logger: this.log });
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
