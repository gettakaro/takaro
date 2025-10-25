import { ITakaroQuery, TakaroModel, Redis } from '@takaro/db';
import { errors, traceableClass, ctx } from '@takaro/util';
import { Model } from 'objection';
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
  dimension?: string;

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
  quality?: string;

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
  async getModel() {
    const knex = await this.getKnex();
    const model = PlayerLocationTrackingModel.bindKnex(knex);

    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
      knex,
    };
  }

  async getInventoryModel() {
    const knex = await this.getKnex();
    const model = PlayerInventoryTrackingModel.bindKnex(knex);

    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
    };
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

  async observePlayerLocation(playerId: string, x: number, y: number, z: number, dimension?: string) {
    const { query } = await this.getModel();
    await query.insert({
      playerId,
      x,
      y,
      z,
      dimension,
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
          quality: item.quality,
          domain: this.domainId,
          createdAt: observationTime,
        };
      }),
    );

    const { query } = await this.getInventoryModel();
    await query.insert(toInsert);

    // Invalidate and update the cache
    try {
      const redis = await Redis.getClient('inventory');
      const cacheKey = `inventory:${this.domainId}:${playerId}`;

      // Delete the old cache
      await redis.del(cacheKey);

      // Pre-populate cache with new data
      const inventoryItems = items.map((item) => {
        const itemDef = itemDefs.find((def) => def.code === item.code);
        return new IItemDTO({
          code: item.code,
          name: itemDef?.name || item.name,
          description: itemDef?.description || item.description,
          amount: item.amount,
          quality: item.quality,
        });
      });

      await redis.set(cacheKey, JSON.stringify(inventoryItems), { EX: 1800 });
    } catch (error) {
      this.log.warn('Failed to update inventory cache', { error, playerId });
    }
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
    const { query } = await this.getInventoryModel();
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

    const qb = query
      .distinct()
      .select(
        'playerLocation.*',
        'playerLocation.playerId as pogId',
        `${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId as playerId`,
      )
      .join(PLAYER_ON_GAMESERVER_TABLE_NAME, 'playerLocation.playerId', `${PLAYER_ON_GAMESERVER_TABLE_NAME}.id`)
      .where('playerLocation.createdAt', '>=', startDate);

    if (playerId && playerId.length > 0) {
      qb.whereIn(`${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId`, playerId);
    }

    if (endDate) {
      qb.where('playerLocation.createdAt', '<=', endDate);
    }

    if (limit) {
      qb.limit(limit);
    } else {
      qb.limit(1000);
    }

    qb.orderBy('playerLocation.createdAt', 'DESC');

    const result = await qb;
    return result.map((item: any) => {
      return new PlayerLocationOutputDTO({
        ...item,
        pogId: item.pogId,
        playerId: item.playerId,
      });
    });
  }

  async getBoundingBoxPlayers(input: BoundingBoxSearchInputDTO): Promise<PlayerLocationOutputDTO[]> {
    const { query } = await this.getModel();
    const { minX, maxX, minY, maxY, minZ, maxZ, startDate, endDate, gameserverId } = input;

    const qb = query
      .distinct()
      .select(
        'playerLocation.*',
        'playerLocation.playerId as pogId',
        `${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId as playerId`,
      )
      .join(PLAYER_ON_GAMESERVER_TABLE_NAME, 'playerLocation.playerId', `${PLAYER_ON_GAMESERVER_TABLE_NAME}.id`)
      .where(`${PLAYER_ON_GAMESERVER_TABLE_NAME}.gameServerId`, gameserverId)
      .andWhere('playerLocation.x', '>=', minX)
      .andWhere('playerLocation.x', '<=', maxX)
      .andWhere('playerLocation.y', '>=', minY)
      .andWhere('playerLocation.y', '<=', maxY)
      .andWhere('playerLocation.z', '>=', minZ)
      .andWhere('playerLocation.z', '<=', maxZ);

    if (startDate) {
      qb.andWhere('playerLocation.createdAt', '>=', startDate);
    }
    if (endDate) {
      qb.andWhere('playerLocation.createdAt', '<=', endDate);
    }

    const result = await qb;
    return result.map((item: any) => {
      return new PlayerLocationOutputDTO({
        ...item,
        pogId: item.pogId,
        playerId: item.playerId,
      });
    });
  }

  async getRadiusPlayers(input: RadiusSearchInputDTO): Promise<PlayerLocationOutputDTO[]> {
    const { query } = await this.getModel();
    const { x, y, z, radius, startDate, endDate, gameserverId } = input;

    const qb = query
      .distinct()
      .select(
        'playerLocation.*',
        'playerLocation.playerId as pogId',
        `${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId as playerId`,
      )
      .join(PLAYER_ON_GAMESERVER_TABLE_NAME, 'playerLocation.playerId', `${PLAYER_ON_GAMESERVER_TABLE_NAME}.id`)
      .where(`${PLAYER_ON_GAMESERVER_TABLE_NAME}.gameServerId`, gameserverId)
      .andWhereRaw(
        'sqrt(("playerLocation"."x" - ?) ^ 2 + ("playerLocation"."y" - ?) ^ 2 + ("playerLocation"."z" - ?) ^ 2) <= ?',
        [x, y, z, radius],
      );

    if (startDate) {
      qb.andWhere('playerLocation.createdAt', '>=', startDate);
    }
    if (endDate) {
      qb.andWhere('playerLocation.createdAt', '<=', endDate);
    }

    const result = await qb;
    return result.map((item: any) => {
      return new PlayerLocationOutputDTO({
        ...item,
        pogId: item.pogId,
        playerId: item.playerId,
      });
    });
  }

  async getPlayerInventoryHistory(input: PlayerInventoryHistoryInputDTO): Promise<PlayerInventoryOutputDTO[]> {
    const { query } = await this.getInventoryModel();
    const { playerId, startDate, endDate } = input;

    const qb = query
      .distinct()
      .select(
        'playerInventoryHistory.playerId as pogId',
        'playerInventoryHistory.itemId',
        'items.name as itemName',
        'items.code as itemCode',
        'playerInventoryHistory.quantity',
        'playerInventoryHistory.quality',
        'playerInventoryHistory.createdAt',
        `${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId as playerId`,
      )
      .join('items', 'items.id', '=', 'playerInventoryHistory.itemId')
      .join(PLAYER_ON_GAMESERVER_TABLE_NAME, 'playerInventoryHistory.playerId', `${PLAYER_ON_GAMESERVER_TABLE_NAME}.id`)
      .where(`${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId`, playerId)
      .andWhere('playerInventoryHistory.createdAt', '>=', startDate)
      .andWhere('playerInventoryHistory.createdAt', '<=', endDate)
      .orderBy('playerInventoryHistory.createdAt', 'desc');

    const result = await qb;
    return result.map((item: any) => {
      return new PlayerInventoryOutputDTO({
        ...item,
        pogId: item.pogId,
        playerId: item.playerId,
      });
    });
  }

  async getPlayersByItem(input: PlayersByItemInputDTO): Promise<PlayerItemHistoryOutputDTO[]> {
    const { query } = await this.getInventoryModel();
    const { itemId, startDate, endDate } = input;

    const qb = query
      .distinct()
      .select(
        'playerInventoryHistory.playerId as pogId',
        'playerInventoryHistory.quantity',
        'playerInventoryHistory.createdAt',
        `${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId as playerId`,
      )
      .join(PLAYER_ON_GAMESERVER_TABLE_NAME, 'playerInventoryHistory.playerId', `${PLAYER_ON_GAMESERVER_TABLE_NAME}.id`)
      .where('playerInventoryHistory.itemId', itemId);

    if (startDate) {
      qb.andWhere('playerInventoryHistory.createdAt', '>=', startDate);
    }

    if (endDate) {
      qb.andWhere('playerInventoryHistory.createdAt', '<=', endDate);
    }

    qb.orderBy('playerInventoryHistory.createdAt', 'desc');

    const result = await qb;
    return result.map((item: any) => {
      return new PlayerItemHistoryOutputDTO({
        ...item,
        pogId: item.pogId,
        playerId: item.playerId,
      });
    });
  }
}
