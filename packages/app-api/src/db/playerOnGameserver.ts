export const PLAYER_ON_GAMESERVER_TABLE_NAME = 'playerOnGameServer';
import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { IPlayerReferenceDTO } from '@takaro/gameserver';
import { GameServerModel } from './gameserver.js';
import { PlayerModel, RoleOnPlayerModel } from './player.js';
import {
  PlayerOnGameserverOutputDTO,
  PlayerOnGameServerCreateDTO,
  PlayerOnGameServerUpdateDTO,
  PlayerOnGameserverOutputWithRolesDTO,
} from '../service/PlayerOnGameserverService.js';
import { RoleOutputDTO } from '../service/RoleService.js';

export class PlayerOnGameServerModel extends TakaroModel {
  static tableName = PLAYER_ON_GAMESERVER_TABLE_NAME;

  gameServerId!: string;
  playerId!: string;

  gameId!: string;

  ping: number;
  ip: string;

  positionX: number;
  positionY: number;
  positionZ: number;

  static get relationMappings() {
    return {
      gameServer: {
        relation: Model.BelongsToOneRelation,
        modelClass: GameServerModel,
        join: {
          from: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.gameServerId`,
          to: `${GameServerModel.tableName}.id`,
        },
      },
      player: {
        relation: Model.BelongsToOneRelation,
        modelClass: PlayerModel,
        join: {
          from: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId`,
          to: `${PlayerModel.tableName}.id`,
        },
      },
    };
  }
}

@traceableClass('repo:playerOnGameserver')
export class PlayerOnGameServerRepo extends ITakaroRepo<
  PlayerOnGameServerModel,
  PlayerOnGameserverOutputDTO,
  PlayerOnGameServerCreateDTO,
  PlayerOnGameServerUpdateDTO
> {
  async getModel() {
    const knex = await this.getKnex();
    const model = PlayerOnGameServerModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }
  async find(filters: ITakaroQuery<PlayerOnGameserverOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<PlayerOnGameServerModel, PlayerOnGameserverOutputDTO>(filters).build(query);
    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new PlayerOnGameserverOutputDTO().construct(item))),
    };
  }

  async findOne(id: string): Promise<PlayerOnGameserverOutputWithRolesDTO> {
    const { query } = await this.getModel();
    const data = (await query.findById(id)) as unknown as PlayerOnGameserverOutputWithRolesDTO;

    if (!data) {
      throw new errors.NotFoundError();
    }

    const knex = await this.getKnex();
    const roleOnPlayerModel = RoleOnPlayerModel.bindKnex(knex);
    const roles = await roleOnPlayerModel
      .query()
      .where({ playerId: data.playerId })
      .withGraphFetched('role.permissions');
    const globalRoles = roles.filter((role) => role.gameServerId === null);
    const gameServerRoles = roles.filter((role) => role.gameServerId !== data.gameServerId);
    const filteredRoles = [...globalRoles, ...gameServerRoles];
    const uniqueRoles = filteredRoles.filter(
      (role, index, self) => self.findIndex((r) => r.roleId === role.roleId) === index
    );
    const roleDTOs = await Promise.all(uniqueRoles.map((role) => new RoleOutputDTO().construct(role)));

    data.roles = roleDTOs;

    return new PlayerOnGameserverOutputWithRolesDTO().construct(data);
  }

  async create(item: PlayerOnGameServerCreateDTO): Promise<PlayerOnGameserverOutputDTO> {
    const { query } = await this.getModel();
    const player = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new PlayerOnGameserverOutputDTO().construct(player);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, data: PlayerOnGameServerUpdateDTO): Promise<PlayerOnGameserverOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const res = await query
      .updateAndFetchById(id, {
        ping: data.ping,
        ip: data.ip,
        positionX: data.positionX,
        positionY: data.positionY,
        positionZ: data.positionZ,
      })
      .returning('*');
    return new PlayerOnGameserverOutputDTO().construct(res);
  }

  async findGameAssociations(gameId: string) {
    const { query } = await this.getModel();
    const foundProfiles = await query.where({ gameId });
    return foundProfiles;
  }

  async insertAssociation(gameId: string, playerId: string, gameServerId: string) {
    const { query } = await this.getModel();
    const foundProfiles = await query.insert({
      gameId,
      playerId,
      gameServerId,
      domain: this.domainId,
    });
    return foundProfiles;
  }

  async resolveRef(ref: IPlayerReferenceDTO, gameServerId: string): Promise<PlayerOnGameserverOutputWithRolesDTO> {
    const { query } = await this.getModel();

    const foundProfiles = await query.where({ gameId: ref.gameId, gameServerId });

    if (foundProfiles.length === 0) {
      throw new errors.NotFoundError();
    }

    const player = await this.findOne(foundProfiles[0].id);
    return player;
  }

  async getRef(playerId: string, gameServerId: string) {
    const { query } = await this.getModel();

    const foundProfiles = await query.where({ playerId, gameServerId });

    if (foundProfiles.length === 0) {
      throw new errors.NotFoundError();
    }

    return new IPlayerReferenceDTO().construct(foundProfiles[0]);
  }
}
