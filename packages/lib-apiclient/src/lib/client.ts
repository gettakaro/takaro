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
  DiscordApi,
  EventApi,
} from '../generated/api.js';
import { BaseApiClient, IBaseApiClientConfig } from './baseClient.js';

export interface IApiClientConfig extends IBaseApiClientConfig {
  auth: {
    username?: string;
    password?: string;
    token?: string;
  };
}

export class Client extends BaseApiClient<IApiClientConfig> {
  public token: string | null;
  constructor(config: IApiClientConfig) {
    super(config);

    if (this.config.auth.token) {
      this.axios.defaults.headers.common['x-takaro-token'] = `${this.config.auth.token}`;
    }
  }

  set username(username: string) {
    this.config.auth.username = username;
  }

  set password(password: string) {
    this.config.auth.password = password;
  }

  public async login() {
    if (!this.config.auth.username || !this.config.auth.password) {
      throw new Error('No username or password provided');
    }

    const loginRes = await this.user.userControllerLogin({
      password: this.config.auth.password,
      username: this.config.auth.username,
    });

    this.config.auth.token = loginRes.data.data.token;
    this.token = loginRes.data.data.token;

    this.axios.defaults.headers.common['Authorization'] = `Bearer ${loginRes.data.data.token}`;

    return loginRes.data.data.token;
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

  get discord() {
    return new DiscordApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }

  get event() {
    return new EventApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }
}
