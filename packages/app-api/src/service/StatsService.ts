import { TakaroService } from './Base.js';

import { TakaroDTO, errors, traceableClass } from '@takaro/util';
import { TakaroModel } from '@takaro/db';
import { ITakaroRepo, PaginatedOutput } from '../db/base.js';
import { Axios } from 'axios';
import { IsObject } from 'class-validator';
import { config } from '../config.js';
import { EventsCountInputDTO } from '../controllers/StatsController.js';

export class StatsOutputDTO extends TakaroDTO<StatsOutputDTO> {
  @IsObject()
  values: [number, number][] = [];
}

@traceableClass('service:stats')
export class StatsService extends TakaroService<TakaroModel, TakaroDTO<void>, TakaroDTO<void>, TakaroDTO<void>> {
  private promClient = new Axios({
    baseURL: config.get('metrics.prometheusUrl'),
  });
  get repo(): ITakaroRepo<TakaroModel, TakaroDTO<void>, TakaroDTO<void>, TakaroDTO<void>> {
    // Dummy since we're not talking to our DB here
    return {} as ITakaroRepo<TakaroModel, TakaroDTO<void>, TakaroDTO<void>, TakaroDTO<void>>;
  }
  find(): Promise<PaginatedOutput<TakaroDTO<void>>> {
    throw new errors.NotImplementedError();
  }
  findOne(): Promise<TakaroDTO<void>> {
    throw new errors.NotImplementedError();
  }
  create(): Promise<TakaroDTO<void>> {
    throw new errors.NotImplementedError();
  }
  update(): Promise<TakaroDTO<void>> {
    throw new errors.NotImplementedError();
  }
  delete(): Promise<string> {
    throw new errors.NotImplementedError();
  }

  private handleTimestamps(startDate?: string, endDate?: string) {
    const thirtyMinutesAgo = new Date(new Date().getTime() - 30 * 60 * 1000);
    const startTime = (startDate ? new Date(startDate).valueOf() : thirtyMinutesAgo.valueOf()) / 1000;
    const endTime = (endDate ? new Date(endDate).valueOf() : new Date().valueOf()) / 1000;
    // Calculate step, we always return 100 datapoints (or less) right now
    const step = Math.max(1, Math.floor((endTime - startTime) / 100));
    return { startTime, endTime, step };
  }

  private async prometheusQuery(query: string, startDate?: string, endDate?: string) {
    const { startTime, endTime, step } = this.handleTimestamps(startDate, endDate);

    const response = await this.promClient.get('/api/v1/query_range', {
      params: {
        query,
        start: startTime,
        end: endTime,
        step,
      },
    });

    const parsed = JSON.parse(response.data);

    if (parsed.status !== 'success') throw new errors.InternalServerError();
    if (parsed.data.result.length === 0) return [];

    return parsed.data.result[0].values;
  }

  async getPing(playerId: string, gameserverId: string, startTime?: string, endTime?: string) {
    const data = await this.prometheusQuery(
      `takaro_player_ping{job="worker", domain="${this.domainId}", player="${playerId}", gameserver="${gameserverId}"}`,
      startTime,
      endTime,
    );
    return { values: data };
  }

  async getCurrency(playerId: string, gameserverId: string, startTime?: string, endTime?: string) {
    const data = await this.prometheusQuery(
      `takaro_player_currency{job="worker", domain="${this.domainId}", player="${playerId}", gameserver="${gameserverId}"}`,
      startTime,
      endTime,
    );
    return { values: data };
  }

  async getLatency(gameserverId: string, startTime?: string, endTime?: string) {
    const data = await this.prometheusQuery(
      `avg by(gameserver) (takaro_gameServer_latency{domain="${this.domainId}", gameserver="${gameserverId}"})`,
      startTime,
      endTime,
    );
    return { values: data };
  }

  async getPlayersOnline(gameserverId?: string, startTime?: string, endTime?: string) {
    if (gameserverId) {
      const data = await this.prometheusQuery(
        `takaro_players_online{job="worker", domain="${this.domainId}", gameserver="${gameserverId}"}`,
        startTime,
        endTime,
      );
      return { values: data };
    }
    const data = await this.prometheusQuery(
      `sum by(domain) (takaro_players_online{job="worker", domain="${this.domainId}"})`,
      startTime,
      endTime,
    );
    return { values: data };
  }

  async getActivityStats(
    dataType: 'users' | 'players',
    timeType: 'daily' | 'weekly' | 'monthly',
    gameserverId?: string,
    startTime?: string,
    endTime?: string,
  ) {
    const metricName = `takaro_${timeType}_active_${dataType}`;

    if (dataType === 'users' && gameserverId)
      throw new errors.BadRequestError('Cannot get user activity for a specific gameserver');

    if (gameserverId) {
      const data = await this.prometheusQuery(
        `${metricName}{job="kpi", domain="${this.domainId}", gameServer="${gameserverId}"}`,
        startTime,
        endTime,
      );
      return { values: data };
    }
    const data = await this.prometheusQuery(
      `sum by(domain) (${metricName}{job="kpi", domain="${this.domainId}", gameServer=""})`,
      startTime,
      endTime,
    );
    return { values: data };
  }

  async getEventsCountOverTime(filters: EventsCountInputDTO) {
    //let query = floor(sum by(player, gameserver) (increase(takaro_events{event="entity-killed", domain="bumpy-mangos-kick"}[24h])))
    let labelSelectors = `event="${filters.eventName}", domain="${this.domainId}"`;
    const sumByFields = [];

    if (filters.gameServerId) {
      labelSelectors += `, gameserver="${filters.gameServerId}"`;
    }
    if (filters.moduleId) {
      labelSelectors += `, module="${filters.moduleId}"`;
    }
    if (filters.playerId) {
      labelSelectors += `, player="${filters.playerId}"`;
    }

    if (filters.userId) {
      labelSelectors += `, user="${filters.userId}"`;
    }

    if (filters.sumBy && filters.sumBy.length > 0) {
      sumByFields.push(...filters.sumBy);
    }

    const sumByClause = sumByFields.length > 0 ? `sum by(${sumByFields.join(', ')})` : '';
    const query = `${sumByClause} (increase(takaro_events{${labelSelectors}}[${filters.bucketStep}]))`;

    const data = await this.prometheusQuery(query, filters.startDate, filters.endDate);
    return { values: data };
  }
}
