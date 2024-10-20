import { Axios, AxiosResponse } from 'axios';
import { SdtdConnectionInfo } from './connectionInfo.js';
import {
  CommandResponse,
  InventoryResponse,
  OnlinePlayerResponse,
  PlayerLocation,
  StatsResponse,
} from './apiResponses.js';
import { addCounterToAxios } from '@takaro/util';
import { createAxios } from '@takaro/apiclient';

export class SdtdApiClient {
  private client: Axios;

  constructor(private config: SdtdConnectionInfo) {
    this.client = createAxios({
      baseURL: this.url,
    });

    addCounterToAxios(this.client, {
      name: 'sdtd_api_requests_total',
      help: 'Total number of requests to the 7D2D API',
    });

    this.client.interceptors.request.use((req) => {
      req.headers['X-SDTD-API-TOKENNAME'] = config.adminUser;
      req.headers['X-SDTD-API-SECRET'] = config.adminToken;

      return req;
    });
  }

  private get url() {
    return `${this.config.useTls ? 'https' : 'http'}://${this.config.host}`;
  }

  async getStats(): Promise<AxiosResponse<StatsResponse>> {
    return this.client.get('/api/getstats');
  }

  async executeConsoleCommand(command: string): Promise<AxiosResponse<CommandResponse>> {
    return this.client.get(`/api/executeconsolecommand?command=${command}`);
  }

  async getPlayersLocation(): Promise<AxiosResponse<Array<PlayerLocation>>> {
    return this.client.get('/api/getplayerslocation');
  }

  async getOnlinePlayers(): Promise<AxiosResponse<Array<OnlinePlayerResponse>>> {
    return this.client.get('/api/getplayersonline');
  }

  async getPlayerInventory(id: string): Promise<AxiosResponse<InventoryResponse>> {
    return this.client.get(`/api/getplayerinventory?userid=${id}`);
  }
}
