import { RoleApi, UserApi } from '../generated';
import { BaseApiClient, IApiClientConfig } from './baseClient';

export class Client extends BaseApiClient {
  constructor(config: IApiClientConfig) {
    super(config);
  }

  set username(username: string) {
    this.config.auth.username = username;
  }

  set password(password: string) {
    this.config.auth.password = password;
  }

  set token(token: string) {
    this.config.auth.token = token;
  }

  public async login() {
    if (!this.config.auth.username || !this.config.auth.password) {
      throw new Error('No username or password provided');
    }

    const loginRes = await this.user.userControllerLogin({
      password: this.config.auth.password,
      username: this.config.auth.username,
    });

    this.axios.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${loginRes.data.data.token}`;
  }

  public logout() {
    delete this.axios.defaults.headers.common['Authorization'];
  }

  get user() {
    return new UserApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }

  get role() {
    return new RoleApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }
}
