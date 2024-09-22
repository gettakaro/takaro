import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { Model, transaction } from 'objection';
import { errors, traceableClass } from '@takaro/util';
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
import { ItemRepo } from './items.js';
import { IGamePlayer } from '@takaro/modules';

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

  lastSeen: string;
  playtimeSeconds: number;

  currency: number;

  online: boolean;

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
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async getInventoryModel() {
    const knex = await this.getKnex();
    const model = PlayerInventoryModel.bindKnex(knex);
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
      results: await Promise.all(
        result.results.map(async (item) => new PlayerOnGameserverOutputWithRolesDTO(await this.findOne(item.id))),
      ),
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
      currency: data.currency,
      online: data.online,
      playtimeSeconds: data.playtimeSeconds,
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
    const { model } = await this.getModel();

    await model.transaction(async (trx) => {
      const txQuery = () => model.query(trx).modify('domainScoped', this.domainId);

      // Lock the rows for sender and receiver
      const senderData = await txQuery().forUpdate().findById(senderId);
      const receiverData = await txQuery().forUpdate().findById(receiverId);

      if (!senderData || !receiverData) {
        throw new errors.NotFoundError();
      }

      if (senderData.gameServerId !== receiverData.gameServerId) {
        throw new errors.BadRequestError('Players are not on the same game server');
      }

      if (senderData.currency < amount) {
        throw new errors.BadRequestError('Insufficient funds');
      }

      // Update sender and receiver in the same transaction
      await trx.raw(
        `
        UPDATE "playerOnGameServer"
        SET currency = currency - ?
        WHERE id = ?
      `,
        [amount, senderId],
      );

      await trx.raw(
        `
        UPDATE "playerOnGameServer"
        SET currency = currency + ?
        WHERE id = ?
      `,
        [amount, receiverId],
      );
    });
  }

  async deductCurrency(playerId: string, amount: number): Promise<PlayerOnGameserverOutputDTO> {
    const { model } = await this.getModel();

    await model.transaction(async (trx) => {
      const result = await trx.raw(
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
    });
    return this.findOne(playerId);
  }

  async addCurrency(playerId: string, amount: number): Promise<PlayerOnGameserverOutputDTO> {
    const { model } = await this.getModel();

    await model.transaction(async (trx) => {
      const result = await trx.raw(
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
    });
    return this.findOne(playerId);
  }

  async getInventory(playerId: string): Promise<IItemDTO[]> {
    const { query } = await this.getInventoryModel();

    const items = await query
      .select('items.name', 'items.code', 'items.description', 'playerInventory.quantity')
      .join('items', 'items.id', '=', 'playerInventory.itemId')
      .where('playerInventory.playerId', playerId);

    return Promise.all(items.map((item) => new IItemDTO({ ...item, amount: item.quantity })));
  }

  async syncInventory(playerId: string, gameServerId: string, items: IItemDTO[]) {
    const { query, model } = await this.getInventoryModel();
    const { query: query2 } = await this.getInventoryModel();

    const itemRepo = new ItemRepo(this.domainId);
    const itemDefs = await itemRepo.findItemsByCodes(
      items.map((item) => item.code),
      gameServerId,
    );

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
        };
      }),
    );

    const trx = await transaction.start(model.knex());

    try {
      await query.delete().where({ playerId }).transacting(trx);
      if (toInsert.length) {
        await query2.insert(toInsert).transacting(trx);
      }

      // If everything is ok, commit the transaction
      await trx.commit();
    } catch (error) {
      // If we got an error, rollback the transaction
      await trx.rollback();
      throw error;
    }
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
