import { AxiosError, AxiosInstance } from 'axios';
import axios from 'axios';
import { config } from '../config.js';
import { addCounterToAxios, logger } from '@takaro/util';

interface IPlayerSummary {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  commentpermission: number;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff: number;
  personastate: number;
  primaryclanid: string;
  timecreated: number;
  personastateflags: number;
}

interface IPlayerBans {
  SteamId: string;
  CommunityBanned: boolean;
  VACBanned: boolean;
  NumberOfVACBans: number;
  DaysSinceLastBan: number;
  NumberOfGameBans: number;
  EconomyBan: string;
}

class SteamApi {
  private apiKey = config.get('steam.apiKey');
  private _client: AxiosInstance;
  private log = logger('steamApi');

  get client() {
    if (!this._client) {
      this._client = axios.create({
        baseURL: 'https://api.steampowered.com',
        timeout: 1000,
      });

      addCounterToAxios(this._client, {
        name: 'steam_api_requests_total',
        help: 'Total number of requests to the Steam API',
      });

      this._client.interceptors.request.use((config) => {
        config.params = config.params || {};
        config.params.key = this.apiKey;
        return config;
      });

      this._client.interceptors.request.use((request) => {
        this.log.debug(`➡️ ${request.method?.toUpperCase()} ${request.url}`, {
          method: request.method,
          url: request.url,
        });
        return request;
      });

      this._client.interceptors.response.use(
        (response) => {
          this.log.debug(
            `⬅️ ${response.request.method?.toUpperCase()} ${response.request.path} ${response.status} ${
              response.statusText
            }`,
            {
              status: response.status,
              statusText: response.statusText,
              method: response.request.method,
              url: response.request.url,
            },
          );

          return response;
        },
        (error: AxiosError) => {
          let details = {};

          if (error.response?.data) {
            const data = error.response.data as Record<string, unknown>;
            details = JSON.stringify(data.meta);
          }

          this.log.error('☠️ Request errored', {
            traceId: error.response?.headers['x-trace-id'],
            details,
            status: error.response?.status,
            statusText: error.response?.statusText,
            method: error.config?.method,
            url: error.config?.url,
            response: error.response?.data,
          });
          return Promise.reject(error);
        },
      );
    }
    return this._client;
  }

  async getPlayerSummaries(steamIds: string[]): Promise<IPlayerSummary[]> {
    const response = await this.client.get('/ISteamUser/GetPlayerSummaries/v2', {
      params: {
        steamids: steamIds.join(','),
      },
    });
    return response.data.response.players;
  }

  async getPlayerBans(steamIds: string[]): Promise<IPlayerBans[]> {
    const response = await this.client.get('/ISteamUser/GetPlayerBans/v1', {
      params: {
        steamids: steamIds.join(','),
      },
    });

    return response.data.players;
  }
}

export const steamApi = new SteamApi();
