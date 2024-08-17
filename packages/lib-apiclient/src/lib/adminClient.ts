import { DomainApi } from '../generated/index.js';
import { BaseApiClient, IBaseApiClientConfig } from './baseClient.js';
import { AxiosInstance } from 'axios';

export interface IAdminApiClientConfig extends IBaseApiClientConfig {
  auth: {
    clientSecret: string;
  };
}

export class AdminClient extends BaseApiClient<IAdminApiClientConfig> {
  constructor(config: IAdminApiClientConfig) {
    super(config);
    this.addAuthInterceptor(config.auth.clientSecret, this.axios);
  }

  private addAuthInterceptor(token: string, axios: AxiosInstance): AxiosInstance {
    axios.interceptors.request.use(async (request) => {
      if (request.url?.includes('health')) return request;

      request.headers['X-Takaro-Admin-Token'] = token;
      return request;
    });

    return axios;
  }

  get domain() {
    return new DomainApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios,
    );
  }
}
