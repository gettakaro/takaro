import { DomainApi } from '../generated/index.js';
import { BaseApiClient, IBaseApiClientConfig } from './baseClient.js';
import type { Client as OpenIdClient, Issuer, TokenSet } from 'openid-client';
import { AxiosInstance } from 'axios';

export interface IAdminApiClientConfig extends IBaseApiClientConfig {
  auth: {
    clientId: string;
    clientSecret: string;
  };
  OAuth2URL: string;
}

export class AdminClient extends BaseApiClient<IAdminApiClientConfig> {
  private cachedIssuer: Issuer | null = null;
  private cachedClient: OpenIdClient;
  private token: TokenSet;

  constructor(config: IAdminApiClientConfig) {
    super(config);
    this.addAuthInterceptor(this.axios);
  }

  private async getIssuer() {
    const { Issuer, custom } = await import('openid-client');

    if (!this.cachedIssuer) {
      custom.setHttpOptionsDefaults({
        timeout: 10000,
      });
      this.cachedIssuer = await Issuer.discover(this.config.OAuth2URL);
      this.log.debug(`Discovered issuer at ${this.config.OAuth2URL}`);
    }

    if (!this.cachedClient) {
      this.cachedClient = new this.cachedIssuer.Client({
        client_id: this.config.auth.clientId,
        client_secret: this.config.auth.clientSecret,
      });
    }

    return { issuer: this.cachedIssuer, client: this.cachedClient };
  }

  public async getOidcToken(): Promise<TokenSet> {
    const { client } = await this.getIssuer();
    const grantRes = await client.grant({
      grant_type: 'client_credentials',
      audience: 't:api:admin',
    });

    if (!grantRes.access_token) {
      this.log.error('Failed to get access token');
      throw new Error('Failed to get access token');
    }

    return grantRes;
  }

  private addAuthInterceptor(axios: AxiosInstance): AxiosInstance {
    axios.interceptors.request.use(async (request) => {
      if (request.url?.includes('health')) return request;
      if (!this.token || this.token.expired()) {
        this.log.debug('Token expired, getting new token');
        this.token = await this.getOidcToken();
      }

      request.headers['Authorization'] = `Bearer ${this.token.access_token}`;
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
