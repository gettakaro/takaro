import { QueryBuilder, TakaroModel } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass } from '@takaro/util';
import { GameServerModel, GAMESERVER_TABLE_NAME } from './gameserver.js';
import { ITakaroRepo } from './base.js';
import {
  IpHistoryOutputDTO,
  PlayerCreateDTO,
  PlayerOutputDTO,
  PlayerOutputWithRolesDTO,
  PlayerUpdateDTO,
} from '../service/PlayerService.js';
import { ROLE_TABLE_NAME, RoleModel } from './role.js';
import { PLAYER_ON_GAMESERVER_TABLE_NAME, PlayerOnGameServerModel } from './playerOnGameserver.js';
import { config } from '../config.js';
import { PlayerSearchInputDTO } from '../controllers/PlayerController.js';

export interface ISteamData {
  steamId: string;
  steamAvatar: string;
  steamAccountCreated: number | null;
  steamCommunityBanned: boolean;
  steamEconomyBan: string;
  steamVacBanned: boolean;
  steamsDaysSinceLastBan: number;
  steamNumberOfVACBans: number;
  steamLevel: number;
}

interface IObserveIPOpts {
  country: string | null;
  city: string | null;
  longitude: string | null;
  latitude: string | null;
}

export const PLAYER_TABLE_NAME = 'players';
const ROLE_ON_PLAYER_TABLE_NAME = 'roleOnPlayer';

export class RoleOnPlayerModel extends TakaroModel {
  static tableName = ROLE_ON_PLAYER_TABLE_NAME;

  playerId!: string;
  roleId!: string;
  gameServerId: string | undefined;
  expiresAt: string | undefined;

  static get relationMappings() {
    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: RoleModel,
        join: {
          from: `${ROLE_ON_PLAYER_TABLE_NAME}.roleId`,
          to: `${ROLE_TABLE_NAME}.id`,
        },
      },
    };
  }
}

export class PlayerModel extends TakaroModel {
  static tableName = PLAYER_TABLE_NAME;
  name!: string;
  steamId?: string;
  xboxLiveId?: string;
  epicOnlineServicesId?: string;

  steamLastFetch: Date;
  steamAvatar: string;
  steamAccountCreated: string;
  steamCommunityBanned: boolean;
  steamEconomyBan: string;
  steamVacBanned: boolean;
  steamsDaysSinceLastBan: number;
  steamNumberOfVACBans: number;

  static get relationMappings() {
    return {
      gameServers: {
        relation: Model.ManyToManyRelation,
        modelClass: GameServerModel,
        join: {
          from: `${PLAYER_TABLE_NAME}.id`,
          through: {
            from: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.gameServerId`,
            to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId`,
          },
          to: `${GAMESERVER_TABLE_NAME}.id`,
        },
      },
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: RoleModel,
        join: {
          from: `${PLAYER_TABLE_NAME}.id`,
          through: {
            from: `${ROLE_ON_PLAYER_TABLE_NAME}.playerId`,
            to: `${ROLE_ON_PLAYER_TABLE_NAME}.roleId`,
          },
          to: `${ROLE_TABLE_NAME}.id`,
        },
      },
      roleAssignments: {
        relation: Model.HasManyRelation,
        modelClass: RoleOnPlayerModel,
        join: {
          from: `${PLAYER_TABLE_NAME}.id`,
          to: `${ROLE_ON_PLAYER_TABLE_NAME}.playerId`,
        },
      },
      playerOnGameServers: {
        relation: Model.HasManyRelation,
        modelClass: PlayerOnGameServerModel,
        join: {
          from: `${PLAYER_TABLE_NAME}.id`,
          to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId`,
        },
      },
    };
  }
}

export class PlayerIPHistoryModel extends TakaroModel {
  static tableName = 'playerIpHistory';

  playerId!: string;
  gameServerId!: string;
  ip!: string;
  country!: string | null;
  city!: string | null;
  longitude!: string | null;
  latitude!: string | null;

  static get relationMappings() {
    return {
      player: {
        relation: Model.BelongsToOneRelation,
        modelClass: PlayerModel,
        join: {
          from: `${PlayerIPHistoryModel.tableName}.playerId`,
          to: `${PlayerModel.tableName}.id`,
        },
      },
    };
  }
}

@traceableClass('repo:player')
export class PlayerRepo extends ITakaroRepo<PlayerModel, PlayerOutputDTO, PlayerCreateDTO, PlayerUpdateDTO> {
  async getModel() {
    const knex = await this.getKnex();
    const model = PlayerModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async getIPHistoryModel() {
    const knex = await this.getKnex();
    const model = PlayerIPHistoryModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: Partial<PlayerSearchInputDTO>) {
    const { query } = await this.getModel();
    const extend = filters.extend || [];
    const qry = new QueryBuilder<PlayerModel, PlayerOutputWithRolesDTO>({
      ...filters,
      extend: ['roleAssignments.role.permissions', ...extend],
    }).build(query);

    if (filters.filters?.roleId) {
      qry
        .join(ROLE_ON_PLAYER_TABLE_NAME, `${ROLE_ON_PLAYER_TABLE_NAME}.playerId`, `${PLAYER_TABLE_NAME}.id`)
        .whereIn(`${ROLE_ON_PLAYER_TABLE_NAME}.roleId`, filters.filters.roleId);
    }

    const result = await qry;

    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new PlayerOutputWithRolesDTO(item))),
    };
  }

  async findOne(id: string): Promise<PlayerOutputWithRolesDTO> {
    const { query } = await this.getModel();
    const res = await query.findById(id).withGraphFetched('roleAssignments.role.permissions');
    const { query: ipQuery } = await this.getIPHistoryModel();

    if (!res) {
      throw new errors.NotFoundError();
    }

    const data = new PlayerOutputWithRolesDTO(res);

    const ipHistory = await ipQuery.where({ playerId: data.id }).orderBy('createdAt', 'desc').limit(10);
    data.ipHistory = await Promise.all(ipHistory.map((ip) => new IpHistoryOutputDTO(ip)));

    return data;
  }

  async create(item: PlayerCreateDTO): Promise<PlayerOutputDTO> {
    const { query } = await this.getModel();
    const player = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new PlayerOutputDTO(player);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, data: PlayerUpdateDTO): Promise<PlayerOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const res = await query.updateAndFetchById(id, data.toJSON()).returning('*');
    return new PlayerOutputDTO(res);
  }

  async assignRole(playerId: string, roleId: string, gameServerId?: string, expiresAt?: string): Promise<void> {
    const knex = await this.getKnex();
    const roleOnPlayerModel = RoleOnPlayerModel.bindKnex(knex);

    const updateObj = {
      playerId,
      roleId,
      expiresAt,
      gameServerId,
    };

    const whereObj: Record<string, unknown> = {
      playerId,
      roleId,
    };

    if (gameServerId) whereObj.gameServerId = gameServerId;

    const existing = await roleOnPlayerModel.query().findOne(whereObj);

    if (existing) {
      await roleOnPlayerModel.query().update(updateObj).where(whereObj);
    } else {
      await roleOnPlayerModel.query().insert(updateObj);
    }
  }

  async removeRole(playerId: string, roleId: string, gameServerId?: string): Promise<void> {
    const knex = await this.getKnex();
    const roleOnPlayerModel = RoleOnPlayerModel.bindKnex(knex);

    const whereObj: Record<string, string | null> = {
      playerId,
      roleId,
    };

    if (gameServerId) {
      whereObj.gameServerId = gameServerId;
    } else {
      whereObj.gameServerId = null;
    }

    const res = await roleOnPlayerModel.query().delete().where(whereObj);
    if (res === 0) {
      this.log.warn(`Tried to remove role from player ${playerId} but it was not assigned`, {
        roleId,
        gameServerId,
        playerId,
      });
    }
  }

  async getPlayersToRefreshSteam(): Promise<string[]> {
    const { query } = await this.getModel();

    const refreshOlderThanDate = new Date(Date.now() - config.get('steam.refreshOlderThanMs')).toISOString();

    const players = await query
      .select('steamId')
      .where('steamId', 'is not', null)
      .andWhere(function () {
        this.where('steamLastFetch', '<', refreshOlderThanDate).orWhere('steamLastFetch', 'is', null);
      })
      .orderBy('steamLastFetch', 'asc')
      .limit(config.get('steam.refreshBatchSize'));

    return players.filter((item) => item.steamId).map((item) => item.steamId) as string[];
  }

  async setSteamData(data: (ISteamData | { steamId: string })[]) {
    await Promise.all(
      data.map(async (item) => {
        if (!item) return;
        const { query } = await this.getModel();
        const updateObj: Partial<PlayerModel> = {
          ...item,
          steamAccountCreated: undefined,
          steamLastFetch: new Date(),
        };

        if ('steamAccountCreated' in item) {
          updateObj.steamAccountCreated = item.steamAccountCreated
            ? new Date(item.steamAccountCreated * 1000).toISOString()
            : undefined;
        }

        return query.update(updateObj).where('steamId', item.steamId);
      }),
    );
  }

  /**
   * Checks if the last ip address of the player is the same as the current one.
   * If not, it will add the new ip address to the history.
   * @param ip Ip address
   * @param country Country code
   */
  async observeIp(playerId: string, gameServerId: string, ip: string, ipData: IObserveIPOpts | null) {
    const { query } = await this.getIPHistoryModel();
    const { query: query2 } = await this.getIPHistoryModel();

    const lastIp = await query.select('ip').where({ playerId }).orderBy('createdAt', 'desc').limit(1).first();

    if (lastIp && lastIp.ip === ip) {
      return;
    }

    let res: PlayerIPHistoryModel;

    if (ipData) {
      res = await query.insert({
        playerId,
        gameServerId,
        ip,
        country: ipData.country,
        city: ipData.city,
        longitude: ipData.longitude,
        latitude: ipData.latitude,
        domain: this.domainId,
      });
    } else {
      res = await query.insert({
        playerId,
        gameServerId,
        ip,
        domain: this.domainId,
      });
    }

    return await query2.findById(res.id);
  }

  async calculatePlayerActivityMetrics() {
    const oneDayAgo = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24).toISOString();
    const oneWeekAgo = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7).toISOString();
    const oneMonthAgo = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 30).toISOString();

    const { query: dauQuery } = await this.getModel();
    const { query: wauQuery } = await this.getModel();
    const { query: mauQuery } = await this.getModel();

    const dauRes = await dauQuery
      .joinRelated('playerOnGameServers')
      .where('playerOnGameServers.lastSeen', '>', oneDayAgo)
      .countDistinct('players.id');
    const wauRes = await wauQuery
      .joinRelated('playerOnGameServers')
      .where('playerOnGameServers.lastSeen', '>', oneWeekAgo)
      .countDistinct('players.id');
    const mauRes = await mauQuery
      .joinRelated('playerOnGameServers')
      .where('playerOnGameServers.lastSeen', '>', oneMonthAgo)
      .countDistinct('players.id');

    const dau = parseInt((dauRes[0] as unknown as { count: string }).count, 10);
    const wau = parseInt((wauRes[0] as unknown as { count: string }).count, 10);
    const mau = parseInt((mauRes[0] as unknown as { count: string }).count, 10);

    return {
      dau,
      wau,
      mau,
    };
  }
}
