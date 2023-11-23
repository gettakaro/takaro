import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass } from '@takaro/util';
import { GameServerModel, GAMESERVER_TABLE_NAME } from './gameserver.js';
import { ITakaroRepo } from './base.js';
import {
  PlayerCreateDTO,
  PlayerOutputDTO,
  PlayerOutputWithRolesDTO,
  PlayerUpdateDTO,
} from '../service/PlayerService.js';
import { ROLE_TABLE_NAME, RoleModel } from './role.js';
import { PLAYER_ON_GAMESERVER_TABLE_NAME, PlayerOnGameServerModel } from './playerOnGameserver.js';

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
  async find(filters: ITakaroQuery<PlayerOutputWithRolesDTO>) {
    const { query } = await this.getModel();
    const extend = filters.extend || [];
    const result = await new QueryBuilder<PlayerModel, PlayerOutputWithRolesDTO>({
      ...filters,
      extend: ['roleAssignments.role.permissions', ...extend],
    }).build(query);
    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new PlayerOutputWithRolesDTO().construct(item))),
    };
  }

  async findOne(id: string): Promise<PlayerOutputWithRolesDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id).withGraphFetched('roleAssignments.role.permissions');

    if (!data) {
      throw new errors.NotFoundError();
    }

    return new PlayerOutputWithRolesDTO().construct(data);
  }

  async create(item: PlayerCreateDTO): Promise<PlayerOutputDTO> {
    const { query } = await this.getModel();
    const player = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new PlayerOutputDTO().construct(player);
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
    return new PlayerOutputDTO().construct(res);
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

    await roleOnPlayerModel.query().insert(updateObj);
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

    await roleOnPlayerModel.query().delete().where(whereObj);
  }
}
