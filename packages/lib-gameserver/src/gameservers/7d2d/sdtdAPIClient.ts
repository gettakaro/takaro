import { Axios, AxiosResponse } from 'axios';
import { SdtdConnectionInfo } from './connectionInfo.js';
import {
  CommandResponse,
  InventoryResponse,
  OnlinePlayerResponse,
  PlayerLocation,
  StatsResponse,
} from './apiResponses.js';
import { addCounterToAxios, createAxios, logger } from '@takaro/util';
import { MapInfoDTO } from '../../main.js';

export class SdtdApiClient {
  private client: Axios;
  private log = logger('7d2d:api');

  constructor(private config: SdtdConnectionInfo) {
    this.client = createAxios(
      {
        baseURL: this.url,
      },
      { logger: this.log },
    );

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

  async getMapTile(x: number, y: number, z: number): Promise<string> {
    const res = await this.client.get(`/map/${z}/${x}/${y}.png?t=${Date.now() / 1000}`, {
      responseType: 'arraybuffer',
    });
    // Convert to b64
    return Buffer.from(res.data, 'binary').toString('base64');
  }
}
