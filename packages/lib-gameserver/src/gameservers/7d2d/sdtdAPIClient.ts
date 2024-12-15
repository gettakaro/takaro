import axios, { Axios, AxiosResponse } from 'axios';
import { SdtdConnectionInfo } from './connectionInfo.js';
import {
  CommandResponse,
  InventoryResponse,
  OnlinePlayerResponse,
  PlayerLocation,
  StatsResponse,
} from './apiResponses.js';
import { addCounterToAxios, errors } from '@takaro/util';
import { MapInfoDTO } from '../../main.js';

export class SdtdApiClient {
  private client: Axios;

  constructor(private config: SdtdConnectionInfo) {
    this.client = axios.create({
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

    this.client.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        if (error.response) {
          const simplifiedError = new errors.BadRequestError('Axios error', {
            extra: 'A request to the 7D2D server failed',
            status: error.response.status,
            statusText: error.response.statusText,
            url: error.config.url,
          });
          return Promise.reject(simplifiedError);
        }
        const simplifiedError = new errors.BadRequestError('Axios error', {
          extra: 'A request to the 7D2D server failed',
          message: error.message,
          url: error.config.url,
        });
        return Promise.reject(simplifiedError);
      },
    );
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

  async getMapInfo(): Promise<MapInfoDTO> {
    const res = await this.client.get('/api/map/config');

    return new MapInfoDTO({
      enabled: res.data.data.enabled,
      mapBlockSize: res.data.data.mapBlockSize,
      maxZoom: res.data.data.maxZoom,
      mapSizeX: res.data.data.mapSize.x,
      mapSizeY: res.data.data.mapSize.y,
      mapSizeZ: res.data.data.mapSize.z,
    });
  }

  async getMapTile(x: number, y: number, z: number): Promise<Buffer> {
    const res = await this.client.get(`/map/${z}/${x}/${y}.png?t=${Date.now() / 1000}`);
    return res.data;
  }
}
