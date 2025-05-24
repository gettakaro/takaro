import { ITakaroQuery, TakaroModel } from '@takaro/db';
import { errors, traceableClass } from '@takaro/util';
import { Model, ModelClass, QueryBuilder } from 'objection';
import { ITakaroRepo, PaginatedOutput, voidDTO } from './base.js';
import { PlayerOnGameServerModel, PLAYER_ON_GAMESERVER_TABLE_NAME } from './playerOnGameserver.js';
import {
  BoundingBoxSearchInputDTO,
  PlayerLocationOutputDTO,
  PlayerMovementHistoryInputDTO,
  RadiusSearchInputDTO,
} from '../service/Tracking/dto.js';

export class PlayerLocationTrackingModel extends TakaroModel {
  static tableName = 'playerLocation';

  id!: string;
  playerId!: string;
  x: number;
  y: number;
  z: number;

  static get relationMappings() {
    return {
      player: {
        relation: Model.BelongsToOneRelation,
        modelClass: PlayerOnGameServerModel,
        join: {
          from: 'playerLocation.playerId',
          to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.id`,
        },
      },
    };
  }
}

@traceableClass('repo:tracking')
export class TrackingRepo extends ITakaroRepo<PlayerLocationTrackingModel, PlayerLocationOutputDTO, voidDTO, voidDTO> {
  async getModel(): Promise<{
    model: ModelClass<PlayerLocationTrackingModel>;
    query: QueryBuilder<PlayerLocationTrackingModel, PlayerLocationTrackingModel[]>;
  }> {
    const knex = await this.getKnex();
    const model = PlayerLocationTrackingModel.bindKnex(knex);
    const query = model.query().modify('domainScoped', this.domainId);
    return { model, query };
  }

  async find(_filters: ITakaroQuery<PlayerLocationOutputDTO>): Promise<PaginatedOutput<PlayerLocationOutputDTO>> {
    throw new errors.NotImplementedError();
  }

  async findOne(_id: string): Promise<PlayerLocationOutputDTO> {
    throw new errors.NotImplementedError();
  }

  async create(_item: voidDTO): Promise<PlayerLocationOutputDTO> {
    throw new errors.NotImplementedError();
  }

  async update(_id: string, _item: voidDTO): Promise<PlayerLocationOutputDTO> {
    throw new errors.NotImplementedError();
  }

  async delete(_id: string): Promise<boolean> {
    throw new errors.NotImplementedError();
  }

  async observePlayerLocation(playerId: string, x: number, y: number, z: number) {
    const { query } = await this.getModel();
    await query.insert({
      playerId,
      x,
      y,
      z,
      domain: this.domainId,
    });
  }

  /**
   * Calls the pg function `ensure_player_location_partition(domain)`
   * @param domain
   */
  async ensureLocationPartition(date?: string) {
    if (!date) date = new Date().toISOString(); // Default to today if no date is provided
    const knex = await this.getKnex();
    const query = knex.raw('SELECT ensure_player_location_partition(?)', [date]);

    await query;
  }

  async cleanupLocation(date: string) {
    const { query } = await this.getModel();
    const res = await query.where('createdAt', '<', date).delete().returning('*');

    this.log.info(`Deleted ${res.length} player location records older than ${date}`);
  }

  async getPlayerMovementHistory(input: PlayerMovementHistoryInputDTO): Promise<PlayerLocationOutputDTO[]> {
    const { query } = await this.getModel();
    let { startDate } = input;
    const { playerId, endDate, limit } = input;

    if (!startDate) {
      // If no start date is provided, default to 1 day ago
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    }

    const qb = query.where('createdAt', '>=', startDate);

    if (playerId && playerId.length > 0) {
      qb.whereIn('playerId', playerId);
    }

    if (endDate) {
      qb.where('createdAt', '<=', endDate);
    }

    if (limit) {
      qb.limit(limit);
    } else {
      qb.limit(1000);
    }

    qb.orderBy('createdAt', 'DESC');

    const result = await qb;
    return result.map((item) => {
      return new PlayerLocationOutputDTO(item);
    });
  }

  async getBoundingBoxPlayers(input: BoundingBoxSearchInputDTO): Promise<PlayerLocationOutputDTO[]> {
    const { query } = await this.getModel();
    const { minX, maxX, minY, maxY, minZ, maxZ } = input;

    const qb = query
      .where('x', '>=', minX)
      .andWhere('x', '<=', maxX)
      .andWhere('y', '>=', minY)
      .andWhere('y', '<=', maxY)
      .andWhere('z', '>=', minZ)
      .andWhere('z', '<=', maxZ);

    const result = await qb;
    return result.map((item) => {
      return new PlayerLocationOutputDTO(item);
    });
  }

  async getRadiusPlayers(input: RadiusSearchInputDTO): Promise<PlayerLocationOutputDTO[]> {
    const { query } = await this.getModel();
    const { x, y, z, radius } = input;

    const qb = query.whereRaw('sqrt((x - ?) ^ 2 + (y - ?) ^ 2 + (z - ?) ^ 2) <= ?', [x, y, z, radius]);

    const result = await qb;
    return result.map((item) => {
      return new PlayerLocationOutputDTO(item);
    });
  }
}
