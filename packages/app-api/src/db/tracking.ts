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
  PlayerInventoryOutputDTO,
  PlayerInventoryHistoryInputDTO,
  PlayersByItemInputDTO,
  PlayerItemHistoryOutputDTO,
} from '../service/Tracking/dto.js';
import { ItemRepo, ItemsModel } from './items.js';
import { IItemDTO } from '@takaro/gameserver';

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

export class PlayerInventoryTrackingModel extends TakaroModel {
  static tableName = 'playerInventoryHistory';

  id!: string;
  playerId!: string;
  itemId!: string;
  quantity: number;

  static get relationMappings() {
    return {
      player: {
        relation: Model.BelongsToOneRelation,
        modelClass: PlayerOnGameServerModel,
        join: {
          from: 'playerInventoryHistory.playerId',
          to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.id`,
        },
      },
      item: {
        relation: Model.BelongsToOneRelation,
        modelClass: ItemsModel,
        join: {
          from: 'playerInventoryHistory.itemId',
          to: ItemsModel.tableName + '.id',
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

  async getInventoryModel(): Promise<{
    model: ModelClass<PlayerInventoryTrackingModel>;
    query: QueryBuilder<PlayerInventoryTrackingModel, PlayerInventoryTrackingModel[]>;
  }> {
    const knex = await this.getKnex();
    const model = PlayerInventoryTrackingModel.bindKnex(knex);
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

  async observePlayerInventory(playerId: string, gameServerId: string, items: IItemDTO[]) {
    const itemRepo = new ItemRepo(this.domainId);
    const itemDefs = await itemRepo.findItemsByCodes(
      items.map((item) => item.code),
      gameServerId,
    );

    const observationTime = new Date().toISOString();

    const toInsert = await Promise.all(
      items.map(async (item) => {
        const itemDef = itemDefs.find((itemDef) => itemDef.code === item.code);

        if (!itemDef) {
          throw new errors.BadRequestError(`Item ${item.code} not found`);
        }

        return {
          playerId,
          itemId: itemDef.id,
          quantity: item.amount,
          domain: this.domainId,
          createdAt: observationTime,
        };
      }),
    );

    const { query } = await this.getInventoryModel();
    await query.insert(toInsert);
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

  async ensureInventoryPartition(date?: string) {
    if (!date) date = new Date().toISOString(); // Default to today if no date is provided
    const knex = await this.getKnex();
    const query = knex.raw('SELECT ensure_player_inventory_history_partition(?)', [date]);

    await query;
  }

  async cleanupInventory(date: string) {
    const { query } = await this.getModel();
    const res = await query.where('createdAt', '<', date).delete().returning('*');

    this.log.info(`Deleted ${res.length} player inventory records older than ${date}`);
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

  async getPlayerInventoryHistory(input: PlayerInventoryHistoryInputDTO): Promise<PlayerInventoryOutputDTO[]> {
    const { query } = await this.getInventoryModel();
    const { playerId, startDate, endDate } = input;

    const qb = query
      .select(
        'playerInventoryHistory.playerId',
        'playerInventoryHistory.itemId',
        'items.name as itemName',
        'items.code as itemCode',
        'playerInventoryHistory.quantity',
        'playerInventoryHistory.createdAt',
      )
      .join('items', 'items.id', '=', 'playerInventoryHistory.itemId')
      .where('playerInventoryHistory.playerId', playerId)
      .andWhere('playerInventoryHistory.createdAt', '>=', startDate)
      .andWhere('playerInventoryHistory.createdAt', '<=', endDate)
      .orderBy('playerInventoryHistory.createdAt', 'desc');

    const result = await qb;
    return result.map((item) => {
      return new PlayerInventoryOutputDTO(item);
    });
  }

  async getPlayersByItem(input: PlayersByItemInputDTO): Promise<PlayerItemHistoryOutputDTO[]> {
    const { query } = await this.getInventoryModel();
    const { itemCode, startDate, endDate } = input;

    const qb = query
      .select('playerInventoryHistory.playerId', 'playerInventoryHistory.quantity', 'playerInventoryHistory.createdAt')
      .join('items', 'items.id', '=', 'playerInventoryHistory.itemId')
      .where('items.code', itemCode);

    if (startDate) {
      qb.andWhere('playerInventoryHistory.createdAt', '>=', startDate);
    }

    if (endDate) {
      qb.andWhere('playerInventoryHistory.createdAt', '<=', endDate);
    }

    qb.orderBy('playerInventoryHistory.createdAt', 'desc');

    const result = await qb;
    return result.map((item) => {
      return new PlayerItemHistoryOutputDTO(item);
    });
  }
}
