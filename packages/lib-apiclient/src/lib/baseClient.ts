import { MetaApi } from '../generated';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { logger } from '@takaro/logger';

export interface IApiClientConfig {
  url: string;
  auth: {
    token?: string;
    username?: string;
    password?: string;
    adminSecret?: string;
  };
}

export class BaseApiClient {
  protected axios: AxiosInstance;
  private log = logger('ApiClient');
  constructor(protected readonly config: IApiClientConfig) {
    const axiosConfig: AxiosRequestConfig = {
      baseURL: this.config.url,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    this.axios = this.addAuthHeaders(
      this.addLoggers(axios.create(axiosConfig))
    );
  }

  isJsonMime(mime: string) {
    return mime === 'application/json';
  }

  private addAuthHeaders(axios: AxiosInstance): AxiosInstance {
    if (this.config.auth.token) {
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${this.config.auth.token}`;
    } else {
      if (this.config.auth.adminSecret) {
        axios.defaults.auth = {
          username: 'admin',
          password: this.config.auth.adminSecret,
        };
      } else {
        if (!this.config.auth.username || !this.config.auth.password) {
          this.log.warn(
            'No authentication provided, any authenticated endpoint will fail!'
          );
        }
      }
    }

    return axios;
  }

  private addLoggers(axios: AxiosInstance): AxiosInstance {
    axios.interceptors.request.use((request) => {
      console.log('Starting Request');
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
          if (
            error.response.data instanceof Object &&
            'meta' in error.response.data
          ) {
            details = JSON.stringify(error.response.data['meta']);
          }
        }

        this.log.error(`☠️ Request errored: ${error.message}`, {
          error,
          details,
          status: error.response?.status,
          statusText: error.response?.statusText,
          method: error.config.method,
          url: error.config.url,
          headers: error.response?.headers,
          response: error.response?.data,
        });
        return Promise.reject(error);
      }
    );

    return axios;
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
