import axios, { AxiosError, AxiosInstance } from 'axios';
import { config } from '../config.js';
import { addCounterToAxios, errors, logger } from '@takaro/util';
import { Redis } from '@takaro/db';
import ms from 'ms';

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

const redisClient = await Redis.getClient('steam');
const STEAM_RATE_LIMITED_KEY = 'steamApiRateLimit';
// How many calls per day we are allowed to make
const TOTAL_STEAM_API_CALLS = 100000;

class SteamApi {
  private apiKey = config.get('steam.apiKey');
  private _client: AxiosInstance;
  private log = logger('steamApi');
  public isRateLimited = false;

  get client() {
    if (!this._client) {
      this._client = axios.create({
        baseURL: 'https://api.steampowered.com',
        timeout: 10000,
      });

      addCounterToAxios(this._client, {
        name: 'steam_api_requests_total',
        help: 'Total number of requests to the Steam API',
      });

      this._client.interceptors.request.use((config) => {
        if (this.isRateLimited) {
          this.log.warn('Rate limited by Steam API, skipping request. This will reset after 24 hours');
          const controller = new AbortController();
          controller.abort();
        }

        this.incrCallCounter();

        return config;
      });

      this._client.interceptors.request.use((config) => {
        if (!this.apiKey) {
          this.log.warn('Steam API key not set, skipping sync');
          throw new errors.ConfigError('Steam API key not set');
        }

        config.params ||= {};
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
        async (error: AxiosError) => {
          let details = {};

          if (error.response?.data) {
            const data = error.response.data as Record<string, unknown>;
            details = JSON.stringify(data.meta);
          }

          if (error.response?.status === 429) {
            await this.setRateLimited();
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

  async getLevel(steamId: string): Promise<number> {
    const response = await this.client.get('/IPlayerService/GetSteamLevel/v1', {
      params: {
        steamid: steamId,
      },
    });

    return response.data.response.player_level;
  }

  private async setRateLimited() {
    this.log.warn('Rate limited by Steam API');
    await redisClient.set(STEAM_RATE_LIMITED_KEY, 'true', {
      PX: ms('1day'),
    });
  }

  async refreshRateLimitedStatus() {
    const res = await redisClient.get(STEAM_RATE_LIMITED_KEY);
    this.isRateLimited = res === 'true';
    return this.isRateLimited;
  }

  async incrCallCounter() {
    await redisClient.incr(this.steamCallsKey);
    // Ensure the key gets cleaned after a few days
    await redisClient.expire(this.steamCallsKey, ms('7days') / 1000, 'NX');
  }

  async getRemainingCalls() {
    const calls = await redisClient.get(this.steamCallsKey);
    return TOTAL_STEAM_API_CALLS - parseInt(calls || '0', 10);
  }

  get steamCallsKey() {
    return `steamApiCallsMade:${new Date().toISOString().split('T')[0]}`;
  }
}

export const steamApi = new SteamApi();
