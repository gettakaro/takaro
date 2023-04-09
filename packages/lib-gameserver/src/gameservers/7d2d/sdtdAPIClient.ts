import { Axios, AxiosResponse } from 'axios';
import axios from 'axios';
import { SdtdConnectionInfo } from './index';
import {
  CommandResponse,
  PlayerLocation,
  StatsResponse,
} from './apiResponses.js';

export class SdtdApiClient {
  private client: Axios;

  constructor(private config: SdtdConnectionInfo) {
    this.client = axios.create({
      baseURL: this.url,
    });

    this.client.interceptors.request.use((config) => {
      config.params = {
        ...config.params,
        adminuser: this.config.adminUser,
        admintoken: this.config.adminToken,
      };

      return config;
    });
  }

  private get url() {
    return `${this.config.useTls ? 'https' : 'http'}://${this.config.host}`;
  }

  async getStats(): Promise<AxiosResponse<StatsResponse>> {
    return this.client.get('/api/getstats');
  }

  async executeConsoleCommand(
    command: string
  ): Promise<AxiosResponse<CommandResponse>> {
    return this.client.get(`/api/executeconsolecommand?command=${command}`);
  }

  async getPlayersLocation(): Promise<AxiosResponse<Array<PlayerLocation>>> {
    return this.client.get('/api/getplayerslocation');
  }
}
