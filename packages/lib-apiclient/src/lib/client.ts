import {
  CronJobApi,
  FunctionApi,
  GameServerApi,
  RoleApi,
  UserApi,
  ModuleApi,
  HookApi,
  PlayerApi,
  SettingsApi,
  CommandApi,
  VariableApi,
} from '../generated/api.js';
import { BaseApiClient, IApiClientConfig } from './baseClient.js';

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

  get gameserver() {
    return new GameServerApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }

  get cronjob() {
    return new CronJobApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }

  get function() {
    return new FunctionApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }

  get module() {
    return new ModuleApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }

  get hook() {
    return new HookApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }

  get command() {
    return new CommandApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }

  get player() {
    return new PlayerApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }

  get settings() {
    return new SettingsApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }

  get variable() {
    return new VariableApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }
}
