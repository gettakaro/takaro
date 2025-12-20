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

export class PlayerInventoryBaselineModel extends TakaroModel {
  static tableName = 'playerInventoryBaseline';

  id!: string;
  playerId!: string;
  baselineId!: string;
  itemId!: string;
  quantity!: number;
  quality?: string;

  static get relationMappings() {
    return {
      player: {
        relation: Model.BelongsToOneRelation,
        modelClass: PlayerOnGameServerModel,
        join: {
          from: 'playerInventoryBaseline.playerId',
          to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.id`,
        },
      },
      item: {
        relation: Model.BelongsToOneRelation,
        modelClass: ItemsModel,
        join: {
          from: 'playerInventoryBaseline.itemId',
          to: ItemsModel.tableName + '.id',
        },
      },
    };
  }
}

export class PlayerInventoryDiffModel extends TakaroModel {
  static tableName = 'playerInventoryDiff';

  id!: string;
  playerId!: string;
  itemId!: string;
  changeType!: 'added' | 'removed' | 'changed';
  previousQuantity?: number;
  newQuantity?: number;
  previousQuality?: string;
  newQuality?: string;

  static get relationMappings() {
    return {
      player: {
        relation: Model.BelongsToOneRelation,
        modelClass: PlayerOnGameServerModel,
        join: {
          from: 'playerInventoryDiff.playerId',
          to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.id`,
        },
      },
      item: {
        relation: Model.BelongsToOneRelation,
        modelClass: ItemsModel,
        join: {
          from: 'playerInventoryDiff.itemId',
          to: ItemsModel.tableName + '.id',
        },
      },
    };
  }
}

export interface InventoryDiff {
  itemId: string;
  changeType: 'added' | 'removed' | 'changed';
  previousQuantity?: number;
  newQuantity?: number;
  previousQuality?: string;
  newQuality?: string;
}

interface AggregatedItem {
  amount: number;
  quality?: string;
  itemId: string;
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

  async getBaselineModel() {
    const knex = await this.getKnex();
    const model = PlayerInventoryBaselineModel.bindKnex(knex);

    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
      knex,
    };
  }

  async getDiffModel() {
    const knex = await this.getKnex();
    const model = PlayerInventoryDiffModel.bindKnex(knex);

    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
      knex,
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

  private static readonly BASELINE_INTERVAL_MS = 3600000; // 1 hour

  /**
   * Aggregate items by code, summing quantities.
   * This handles multiple stacks of the same item type.
   */
  aggregateByCode(items: IItemDTO[], itemDefs: { id: string; code: string }[]): Map<string, AggregatedItem> {
    const map = new Map<string, AggregatedItem>();
    for (const item of items) {
      const itemDef = itemDefs.find((def) => def.code === item.code);
      if (!itemDef) continue;

      const existing = map.get(item.code);
      if (existing) {
        existing.amount += item.amount ?? 0;
        // Keep first quality found (could also use highest/latest)
      } else {
        map.set(item.code, {
          amount: item.amount ?? 0,
          quality: item.quality,
          itemId: itemDef.id,
        });
      }
    }
    return map;
  }

  /**
   * Calculate diffs between previous and current inventory.
   * Returns changes: added, removed, or changed items.
   */
  calculateDiffs(previousMap: Map<string, AggregatedItem>, currentMap: Map<string, AggregatedItem>): InventoryDiff[] {
    const diffs: InventoryDiff[] = [];

    // Added and changed
    for (const [code, curr] of currentMap) {
      const prev = previousMap.get(code);
      if (!prev) {
        diffs.push({
          itemId: curr.itemId,
          changeType: 'added',
          newQuantity: curr.amount,
          newQuality: curr.quality,
        });
      } else if (prev.amount !== curr.amount || prev.quality !== curr.quality) {
        diffs.push({
          itemId: curr.itemId,
          changeType: 'changed',
          previousQuantity: prev.amount,
          newQuantity: curr.amount,
          previousQuality: prev.quality,
          newQuality: curr.quality,
        });
      }
    }

    // Removed
    for (const [code, prev] of previousMap) {
      if (!currentMap.has(code)) {
        diffs.push({
          itemId: prev.itemId,
          changeType: 'removed',
          previousQuantity: prev.amount,
          previousQuality: prev.quality,
        });
      }
    }

    return diffs;
  }

  private async insertBaseline(
    playerId: string,
    baselineId: string,
    items: IItemDTO[],
    itemDefs: { id: string; code: string }[],
    observationTime: string,
  ) {
    const toInsert = items
      .map((item) => {
        const itemDef = itemDefs.find((def) => def.code === item.code);
        if (!itemDef) return null;

        return {
          playerId,
          baselineId,
          itemId: itemDef.id,
          quantity: item.amount ?? 0,
          quality: item.quality,
          domain: this.domainId,
          createdAt: observationTime,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (toInsert.length > 0) {
      const { query } = await this.getBaselineModel();
      await query.insert(toInsert);
    }
  }

  private async insertDiffs(playerId: string, diffs: InventoryDiff[], observationTime: string) {
    const toInsert = diffs.map((diff) => ({
      playerId,
      itemId: diff.itemId,
      changeType: diff.changeType,
      previousQuantity: diff.previousQuantity,
      newQuantity: diff.newQuantity,
      previousQuality: diff.previousQuality,
      newQuality: diff.newQuality,
      domain: this.domainId,
      createdAt: observationTime,
    }));

    if (toInsert.length > 0) {
      const { query } = await this.getDiffModel();
      await query.insert(toInsert);
    }
  }

  async observePlayerInventory(playerId: string, gameServerId: string, items: IItemDTO[]) {
    const itemRepo = new ItemRepo(this.domainId);
    const itemDefs = await itemRepo.findItemsByCodes(
      items.map((item) => item.code),
      gameServerId,
    );

    const observationTime = new Date().toISOString();

    try {
      const redis = await Redis.getClient('inventory');
      const cacheKey = `inventory:${this.domainId}:${playerId}`;
      const baselineKey = `inventory:baseline:${this.domainId}:${playerId}`;

      // Get previous state from cache
      const previousJson = await redis.get(cacheKey);
      const previousItems: IItemDTO[] = previousJson ? JSON.parse(previousJson) : [];

      // Check if baseline is needed
      const lastBaselineStr = await redis.get(baselineKey);
      const lastBaseline = lastBaselineStr ? parseInt(lastBaselineStr, 10) : 0;
      const needsBaseline = Date.now() - lastBaseline > TrackingRepo.BASELINE_INTERVAL_MS;

      // Aggregate items by code for comparison
      const previousMap = this.aggregateByCode(previousItems, itemDefs);
      const currentMap = this.aggregateByCode(items, itemDefs);

      if (needsBaseline) {
        // Store full baseline
        const baselineId = crypto.randomUUID();
        await this.insertBaseline(playerId, baselineId, items, itemDefs, observationTime);
        await redis.set(baselineKey, Date.now().toString());
        this.log.debug('Created inventory baseline', { playerId, baselineId });
      } else {
        // Calculate and store diffs
        const diffs = this.calculateDiffs(previousMap, currentMap);
        if (diffs.length > 0) {
          await this.insertDiffs(playerId, diffs, observationTime);
          this.log.debug('Stored inventory diffs', { playerId, diffCount: diffs.length });
        }
        // If no diffs, skip database write entirely - this is the storage savings
      }

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
      this.log.error('Failed to process inventory observation', { error, playerId });
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
    const deletedCount = await query.where('createdAt', '<', date).delete();

    this.log.info(`Deleted ${deletedCount} player location records older than ${date}`);
  }

  async ensureInventoryPartition(date?: string) {
    if (!date) date = new Date().toISOString(); // Default to today if no date is provided
    const knex = await this.getKnex();

    // Ensure partitions exist for both new tables
    await knex.raw('SELECT ensure_player_inventory_baseline_partition(?)', [date]);
    await knex.raw('SELECT ensure_player_inventory_diff_partition(?)', [date]);
  }

  async cleanupInventory(date: string) {
    // Clean up baseline table
    const { query: baselineQuery } = await this.getBaselineModel();
    const baselineDeletedCount = await baselineQuery.where('createdAt', '<', date).delete();

    // Clean up diff table
    const { query: diffQuery } = await this.getDiffModel();
    const diffDeletedCount = await diffQuery.where('createdAt', '<', date).delete();

    this.log.info(
      `Deleted ${baselineDeletedCount} baseline and ${diffDeletedCount} diff inventory records older than ${date}`,
    );
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

  /**
   * Get player inventory history by reconstructing from baselines + diffs.
   * Returns snapshots at each change point (not at fixed intervals).
   */
  async getPlayerInventoryHistory(input: PlayerInventoryHistoryInputDTO): Promise<PlayerInventoryOutputDTO[]> {
    const { playerId, startDate, endDate } = input;
    const { knex } = await this.getBaselineModel();

    // Get the PlayerOnGameServer ID for the given player
    const pogResult = await knex(PLAYER_ON_GAMESERVER_TABLE_NAME)
      .select('id')
      .where('playerId', playerId)
      .andWhere('domain', this.domainId)
      .first();

    if (!pogResult) {
      return [];
    }
    const pogId = pogResult.id;

    // Get baselines: most recent before startDate (anchor) + all in date range
    // The anchor baseline is needed to reconstruct inventory state when only diffs exist in the queried range
    const anchorBaseline = await knex('playerInventoryBaseline')
      .select('baselineId')
      .where('playerId', pogId)
      .andWhere('domain', this.domainId)
      .andWhere('createdAt', '<=', startDate)
      .orderBy('createdAt', 'desc')
      .first();

    let baselinesQuery = knex('playerInventoryBaseline')
      .select(
        'playerInventoryBaseline.baselineId',
        'playerInventoryBaseline.itemId',
        'playerInventoryBaseline.quantity',
        'playerInventoryBaseline.quality',
        'playerInventoryBaseline.createdAt',
        'playerInventoryBaseline.playerId as pogId',
        'items.name as itemName',
        'items.code as itemCode',
      )
      .join('items', 'items.id', '=', 'playerInventoryBaseline.itemId')
      .where('playerInventoryBaseline.playerId', pogId)
      .andWhere('playerInventoryBaseline.domain', this.domainId);

    if (anchorBaseline) {
      // Include anchor baseline OR baselines in date range
      baselinesQuery = baselinesQuery.where(function () {
        this.where('playerInventoryBaseline.baselineId', anchorBaseline.baselineId).orWhere(function () {
          this.where('playerInventoryBaseline.createdAt', '>=', startDate).andWhere(
            'playerInventoryBaseline.createdAt',
            '<=',
            endDate,
          );
        });
      });
    } else {
      // No anchor, just get baselines in range
      baselinesQuery = baselinesQuery
        .andWhere('playerInventoryBaseline.createdAt', '>=', startDate)
        .andWhere('playerInventoryBaseline.createdAt', '<=', endDate);
    }

    const baselines = await baselinesQuery.orderBy('playerInventoryBaseline.createdAt', 'asc');

    // Get all diffs in date range
    const diffs = await knex('playerInventoryDiff')
      .select(
        'playerInventoryDiff.itemId',
        'playerInventoryDiff.changeType',
        'playerInventoryDiff.previousQuantity',
        'playerInventoryDiff.newQuantity',
        'playerInventoryDiff.previousQuality',
        'playerInventoryDiff.newQuality',
        'playerInventoryDiff.createdAt',
        'playerInventoryDiff.playerId as pogId',
        'items.name as itemName',
        'items.code as itemCode',
      )
      .join('items', 'items.id', '=', 'playerInventoryDiff.itemId')
      .where('playerInventoryDiff.playerId', pogId)
      .andWhere('playerInventoryDiff.domain', this.domainId)
      .andWhere('playerInventoryDiff.createdAt', '>=', startDate)
      .andWhere('playerInventoryDiff.createdAt', '<=', endDate)
      .orderBy('playerInventoryDiff.createdAt', 'asc');

    // Build output: each baseline is a full snapshot, each diff represents a change
    const result: PlayerInventoryOutputDTO[] = [];

    // Group baselines by baselineId (each baseline is a complete snapshot)
    const baselinesByTime = new Map<string, typeof baselines>();
    for (const b of baselines) {
      const key = b.createdAt.toISOString();
      if (!baselinesByTime.has(key)) {
        baselinesByTime.set(key, []);
      }
      baselinesByTime.get(key)!.push(b);
    }

    // Output baselines as full snapshots
    for (const [createdAt, items] of baselinesByTime) {
      for (const item of items) {
        result.push(
          new PlayerInventoryOutputDTO({
            playerId,
            pogId: item.pogId,
            itemId: item.itemId,
            itemName: item.itemName,
            itemCode: item.itemCode,
            quantity: item.quantity,
            quality: item.quality,
            createdAt,
          }),
        );
      }
    }

    // Output diffs as change events
    // For 'added' and 'changed', show the new quantity
    // For 'removed', show quantity 0
    for (const diff of diffs) {
      if (diff.changeType === 'removed') {
        result.push(
          new PlayerInventoryOutputDTO({
            playerId,
            pogId: diff.pogId,
            itemId: diff.itemId,
            itemName: diff.itemName,
            itemCode: diff.itemCode,
            quantity: 0,
            quality: diff.previousQuality,
            createdAt: diff.createdAt.toISOString(),
          }),
        );
      } else {
        result.push(
          new PlayerInventoryOutputDTO({
            playerId,
            pogId: diff.pogId,
            itemId: diff.itemId,
            itemName: diff.itemName,
            itemCode: diff.itemCode,
            quantity: diff.newQuantity,
            quality: diff.newQuality,
            createdAt: diff.createdAt.toISOString(),
          }),
        );
      }
    }

    // Sort by createdAt descending (most recent first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }

  /**
   * Get players who had a specific item in their inventory.
   * Queries both baseline and diff tables.
   */
  async getPlayersByItem(input: PlayersByItemInputDTO): Promise<PlayerItemHistoryOutputDTO[]> {
    const { itemId, startDate, endDate } = input;
    const { knex } = await this.getBaselineModel();

    // Query baselines for item appearances
    const baselineQuery = knex('playerInventoryBaseline')
      .select(
        'playerInventoryBaseline.playerId as pogId',
        'playerInventoryBaseline.quantity',
        'playerInventoryBaseline.createdAt',
        `${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId as playerId`,
      )
      .join(
        PLAYER_ON_GAMESERVER_TABLE_NAME,
        'playerInventoryBaseline.playerId',
        `${PLAYER_ON_GAMESERVER_TABLE_NAME}.id`,
      )
      .where('playerInventoryBaseline.itemId', itemId)
      .andWhere('playerInventoryBaseline.domain', this.domainId);

    if (startDate) {
      baselineQuery.andWhere('playerInventoryBaseline.createdAt', '>=', startDate);
    }
    if (endDate) {
      baselineQuery.andWhere('playerInventoryBaseline.createdAt', '<=', endDate);
    }

    // Query diffs for item added/changed events
    const diffQuery = knex('playerInventoryDiff')
      .select(
        'playerInventoryDiff.playerId as pogId',
        'playerInventoryDiff.newQuantity as quantity',
        'playerInventoryDiff.createdAt',
        `${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId as playerId`,
      )
      .join(PLAYER_ON_GAMESERVER_TABLE_NAME, 'playerInventoryDiff.playerId', `${PLAYER_ON_GAMESERVER_TABLE_NAME}.id`)
      .where('playerInventoryDiff.itemId', itemId)
      .andWhere('playerInventoryDiff.domain', this.domainId)
      .whereIn('playerInventoryDiff.changeType', ['added', 'changed']);

    if (startDate) {
      diffQuery.andWhere('playerInventoryDiff.createdAt', '>=', startDate);
    }
    if (endDate) {
      diffQuery.andWhere('playerInventoryDiff.createdAt', '<=', endDate);
    }

    const [baselineResults, diffResults] = await Promise.all([baselineQuery, diffQuery]);

    // Combine and deduplicate results
    const combined = [...baselineResults, ...diffResults];

    // Sort by createdAt descending
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return combined.map((item: any) => {
      return new PlayerItemHistoryOutputDTO({
        playerId: item.playerId,
        pogId: item.pogId,
        quantity: item.quantity,
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
      });
    });
  }
}
