import { ITakaroQuery, QueryBuilder, TakaroModel, Redis } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass, ctx } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { IItemDTO } from '@takaro/gameserver';
import { GameServerModel } from './gameserver.js';
import { PlayerModel, RoleOnPlayerModel } from './player.js';
import {
  PlayerOnGameserverOutputDTO,
  PlayerOnGameServerCreateDTO,
  PlayerOnGameServerUpdateDTO,
  PlayerOnGameserverOutputWithRolesDTO,
} from '../service/PlayerOnGameserverService.js';
import { PlayerRoleAssignmentOutputDTO } from '../service/RoleService.js';
import { IGamePlayer } from '@takaro/modules';
import { PlayerInventoryTrackingModel } from './tracking.js';

export const PLAYER_ON_GAMESERVER_TABLE_NAME = 'playerOnGameServer';
const PLAYER_INVENTORY_TABLE_NAME = 'playerInventory';

export class PlayerOnGameServerModel extends TakaroModel {
  static tableName = PLAYER_ON_GAMESERVER_TABLE_NAME;

  gameServerId!: string;
  playerId!: string;

  gameId!: string;

  ping: number;

  positionX: number;
  positionY: number;
  positionZ: number;
  dimension?: string;

  lastSeen: string;
  playtimeSeconds: number;

  currency: number;

  online: boolean;

  ip?: string;

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

export class PlayerInventoryModel extends TakaroModel {
  static tableName = PLAYER_INVENTORY_TABLE_NAME;

  playerId!: string;
  itemId!: string;
  quantity!: number;

  static get relationMappings() {
    return {
      player: {
        relation: Model.BelongsToOneRelation,
        modelClass: PlayerOnGameServerModel,
        join: {
          from: `${PLAYER_INVENTORY_TABLE_NAME}.playerId`,
          to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.id`,
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

    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
      knex,
    };
  }

  async find(filters: ITakaroQuery<PlayerOnGameserverOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<PlayerOnGameServerModel, PlayerOnGameserverOutputDTO>(filters).build(query);

    // Batch load all the related data to avoid N+1 queries
    const playerIds = result.results.map((item) => item.playerId);
    const pogIds = result.results.map((item) => item.id);

    if (result.results.length === 0) {
      return { total: result.total, results: [] };
    }

    // Batch load roles for all players
    const knex = await this.getKnex();
    const roleOnPlayerModel = RoleOnPlayerModel.bindKnex(knex);
    const allRoles = await roleOnPlayerModel
      .query()
      .whereIn('playerId', playerIds)
      .withGraphFetched('role.permissions.permission');

    // Batch load inventories
    const inventories = await Promise.all(pogIds.map((id) => this.getInventory(id)));

    // Group roles by player
    const rolesByPlayer = allRoles.reduce(
      (acc, role) => {
        if (!acc[role.playerId]) acc[role.playerId] = [];
        acc[role.playerId].push(role);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    // Build results with batched data
    const results = result.results.map((item, index) => {
      const playerRoles = rolesByPlayer[item.playerId] || [];
      const globalRoles = playerRoles.filter((role) => role.gameServerId === null);
      const gameServerRoles = playerRoles.filter((role) => role.gameServerId === item.gameServerId);
      const filteredRoles = [...globalRoles, ...gameServerRoles];
      const uniqueRoles = filteredRoles.filter(
        (role, idx, self) => self.findIndex((r) => r.roleId === role.roleId) === idx,
      );

      const data = {
        ...item,
        roles: uniqueRoles.map((role) => new PlayerRoleAssignmentOutputDTO(role)),
        inventory: inventories[index],
      };

      return new PlayerOnGameserverOutputWithRolesDTO(data);
    });

    return {
      total: result.total,
      results,
    };
  }

  async findOne(id: string): Promise<PlayerOnGameserverOutputWithRolesDTO> {
    const { query } = await this.getModel();
    const data = (await query
      .findById(id)
      .withGraphFetched('player')) as unknown as PlayerOnGameserverOutputWithRolesDTO;

    if (!data) {
      throw new errors.NotFoundError();
    }

    const knex = await this.getKnex();
    const roleOnPlayerModel = RoleOnPlayerModel.bindKnex(knex);
    const roles = await roleOnPlayerModel
      .query()
      .where({ playerId: data.playerId })
      .withGraphFetched('role.permissions.permission');
    const globalRoles = roles.filter((role) => role.gameServerId === null);
    const gameServerRoles = roles.filter((role) => role.gameServerId === data.gameServerId);
    const filteredRoles = [...globalRoles, ...gameServerRoles];
    const uniqueRoles = filteredRoles.filter(
      (role, index, self) => self.findIndex((r) => r.roleId === role.roleId) === index,
    );
    const roleDTOs = await Promise.all(uniqueRoles.map((role) => new PlayerRoleAssignmentOutputDTO(role)));

    data.roles = roleDTOs;

    data.inventory = await this.getInventory(data.id);

    return new PlayerOnGameserverOutputWithRolesDTO(data);
  }

  async create(item: PlayerOnGameServerCreateDTO): Promise<PlayerOnGameserverOutputDTO> {
    const { query } = await this.getModel();
    const player = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new PlayerOnGameserverOutputDTO(player);
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
    const res = await query.updateAndFetchById(id, {
      ping: data.ping,
      positionX: data.positionX,
      positionY: data.positionY,
      positionZ: data.positionZ,
      dimension: data.dimension,
      currency: data.currency,
      online: data.online,
      playtimeSeconds: data.playtimeSeconds,
      ip: data.ip,
    });

    return this.findOne(res.id);
  }

  async getPog(playerId: string, gameServerId: string): Promise<PlayerOnGameserverOutputDTO> {
    const { query } = await this.getModel();

    const foundProfiles = await query.where({ playerId, gameServerId });

    if (foundProfiles.length === 0) {
      throw new errors.NotFoundError();
    }

    return this.findOne(foundProfiles[0].id);
  }

  async findGameAssociations(gameId: string, gameServerId: string): Promise<PlayerOnGameServerModel | null> {
    const { query } = await this.getModel();
    const foundProfiles = await query.where({ gameId, gameServerId });

    if (foundProfiles.length === 0) {
      return null;
    }

    if (foundProfiles.length > 1) {
      throw new errors.BadRequestError('Player found on multiple game servers');
    }

    return foundProfiles[0];
  }

  async insertAssociation(gameId: string, playerId: string, gameServerId: string) {
    const { query } = await this.getModel();

    try {
      const foundProfiles = await query.insert({
        gameId,
        playerId,
        gameServerId,
        domain: this.domainId,
      });
      return foundProfiles;
    } catch (error) {
      if (error instanceof Error && error.name === 'UniqueViolationError') {
        // Already exists, just fetch and return
        // We can do this 'as ...' safely because we know it exists
        return this.findGameAssociations(gameId, gameServerId) as Promise<PlayerOnGameServerModel>;
      }

      // Any other error, rethrow
      throw error;
    }
  }

  async transact(senderId: string, receiverId: string, amount: number) {
    const { query } = await this.getModel();

    // Lock the rows for sender and receiver
    const senderData = await query.clone().forUpdate().findById(senderId);
    const receiverData = await query.clone().forUpdate().findById(receiverId);

    if (!senderData || !receiverData) {
      throw new errors.NotFoundError();
    }

    if (senderData.gameServerId !== receiverData.gameServerId) {
      throw new errors.BadRequestError('Players are not on the same game server');
    }

    if (senderData.currency < amount) {
      throw new errors.BadRequestError('Insufficient funds');
    }

    // Update sender and receiver using context transaction
    await this.raw(
      `
      UPDATE "playerOnGameServer"
      SET currency = currency - ?
      WHERE id = ?
    `,
      [amount, senderId],
    );

    await this.raw(
      `
      UPDATE "playerOnGameServer"
      SET currency = currency + ?
      WHERE id = ?
    `,
      [amount, receiverId],
    );
  }

  async deductCurrency(playerId: string, amount: number): Promise<PlayerOnGameserverOutputDTO> {
    const result = await this.raw(
      `
      UPDATE "playerOnGameServer"
      SET currency = currency - ?
      WHERE id = ?
      RETURNING *;
    `,
      [amount, playerId],
    );

    if (result.rowCount === 0) {
      throw new errors.BadRequestError('Player not found');
    }

    return this.findOne(playerId);
  }

  async addCurrency(playerId: string, amount: number): Promise<PlayerOnGameserverOutputDTO> {
    const result = await this.raw(
      `
      UPDATE "playerOnGameServer"
      SET currency = currency + ?
      WHERE id = ?
      RETURNING *;
    `,
      [amount, playerId],
    );

    if (result.rowCount === 0) {
      throw new errors.BadRequestError('Player not found');
    }

    return this.findOne(playerId);
  }

  async resetAllCurrencyForGameServer(gameServerId: string): Promise<number> {
    const result: any = await this.raw(
      `
      UPDATE "playerOnGameServer"
      SET currency = 0
      WHERE "gameServerId" = ? AND "domain" = ?
      RETURNING *;
    `,
      [gameServerId, this.domainId],
    );

    return result.rowCount ?? 0;
  }

  async bulkDeleteByPlayersAndGameServer(
    playerIds: string[],
    gameServerId: string,
  ): Promise<{ deleted: string[]; failed: Array<{ id: string; error: string }> }> {
    if (playerIds.length === 0) {
      return { deleted: [], failed: [] };
    }

    const { query } = await this.getModel();
    const deleted: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    const deletedRecords = await query
      .delete()
      .where({ gameServerId })
      .whereIn('playerId', playerIds)
      .returning(['id', 'playerId']);

    deletedRecords.forEach((record) => {
      deleted.push(record.playerId);
    });

    // Find which player IDs failed (had no POG on this gameserver)
    const deletedPlayerIds = new Set(deleted);
    playerIds.forEach((playerId) => {
      if (!deletedPlayerIds.has(playerId)) {
        failed.push({ id: playerId, error: 'POG not found' });
      }
    });

    this.log.info('Bulk deleted POGs', {
      gameServerId,
      requestedCount: playerIds.length,
      deletedCount: deleted.length,
      failedCount: failed.length,
    });

    return { deleted, failed };
  }

  async getInventory(pogId: string): Promise<IItemDTO[]> {
    const redis = await Redis.getClient('inventory');
    const cacheKey = `inventory:${this.domainId}:${pogId}`;

    // Try cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      this.log.warn('Redis cache error, falling back to database', { error, pogId });
    }

    // Fall back to database query
    const inventory = await this.getInventoryFromDB(pogId);

    // Cache for 30 minutes
    try {
      await redis.set(cacheKey, JSON.stringify(inventory), { EX: 1800 });
    } catch (error) {
      this.log.warn('Failed to cache inventory', { error, pogId });
    }

    return inventory;
  }

  private async getInventoryFromDB(pogId: string): Promise<IItemDTO[]> {
    const knex = await this.getKnex();
    const model = PlayerInventoryTrackingModel.bindKnex(knex);
    const query = model.query().modify('domainScoped', this.domainId);

    // First, find the latest snapshot for the player
    const latestSnapshot = await query
      .select('createdAt')
      .where('playerId', pogId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .first();

    if (!latestSnapshot) {
      return [];
    }

    // Now, query the inventory history for the player using the latest snapshot
    const query2 = model.query().modify('domainScoped', this.domainId);

    const items = await query2
      .select('items.name', 'items.code', 'items.description', 'playerInventoryHistory.quantity')
      .join('items', 'items.id', '=', 'playerInventoryHistory.itemId')
      .where('playerInventoryHistory.playerId', pogId)
      .andWhere('playerInventoryHistory.createdAt', latestSnapshot.createdAt);

    return Promise.all(
      items.map(
        (item: any) =>
          new IItemDTO({
            name: item.name,
            code: item.code,
            description: item.description,
            amount: item.quantity,
          }),
      ),
    );
  }

  async setOnlinePlayers(gameServerId: string, players: IGamePlayer[]) {
    const { query: query1 } = await this.getModel();
    const { query: query2 } = await this.getModel();
    const gameIds = players.map((player) => player.gameId);

    await Promise.all([
      query1.whereNotIn('gameId', gameIds).andWhere({ gameServerId }).update({ online: false }),

      query2
        .whereIn('gameId', gameIds)
        .andWhere({ gameServerId })
        .update({ online: true, lastSeen: new Date().toISOString() }),
    ]);
  }
}
