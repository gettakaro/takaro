import { TakaroModel, ITakaroQuery, QueryBuilder, encrypt, decrypt } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass } from '@takaro/util';
import { GAME_SERVER_TYPE } from '@takaro/gameserver';
import { ITakaroRepo } from './base.js';
import { PLAYER_ON_GAMESERVER_TABLE_NAME, PlayerOnGameServerModel } from './playerOnGameserver.js';
import {
  GameServerOutputDTO,
  GameServerCreateDTO,
  GameServerUpdateDTO,
} from '../service/GameServerService.js';
import { ITEMS_TABLE_NAME, ItemsModel } from './items.js';

export const GAMESERVER_TABLE_NAME = 'gameservers';

export class GameServerModel extends TakaroModel {
  static tableName = GAMESERVER_TABLE_NAME;
  name!: string;

  connectionInfo!: Record<string, unknown>;
  reachable!: boolean;

  type!: GAME_SERVER_TYPE;

  static get relationMappings() {
    return {
      players: {
        relation: Model.HasManyRelation,
        modelClass: PlayerOnGameServerModel,
        join: {
          from: `${GAMESERVER_TABLE_NAME}.id`,
          to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.gameServerId`,
        },
      },
      items: {
        relation: Model.HasManyRelation,
        modelClass: ItemsModel,
        join: {
          from: `${GAMESERVER_TABLE_NAME}.id`,
          to: `${ITEMS_TABLE_NAME}.gameserverId`,
        },
      },
    };
  }
}

@traceableClass('repo:gameserver')
export class GameServerRepo extends ITakaroRepo<
  GameServerModel,
  GameServerOutputDTO,
  GameServerCreateDTO,
  GameServerUpdateDTO
> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    const model = GameServerModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<GameServerOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<GameServerModel, GameServerOutputDTO>(filters).build(query);
    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new GameServerOutputDTO(item))),
    };
  }

  async findOne(id: string, decryptConnectionInfo: boolean): Promise<GameServerOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    if (!decryptConnectionInfo) {
      return new GameServerOutputDTO(data);
    }

    const connectionInfo = JSON.parse(await decrypt(data.connectionInfo as unknown as string));
    return new GameServerOutputDTO({ ...data, connectionInfo });
  }

  async create(item: GameServerCreateDTO): Promise<GameServerOutputDTO> {
    const { query } = await this.getModel();
    const encryptedConnectionInfo = await encrypt(item.connectionInfo);
    const data = {
      ...item.toJSON(),
      domain: this.domainId,
      connectionInfo: Buffer.from(encryptedConnectionInfo, 'utf8'),
    } as unknown as Partial<GameServerModel>;
    const res = await query.insert(data).returning('*');
    return new GameServerOutputDTO({
      ...res,
      connectionInfo: JSON.parse(item.connectionInfo),
    });
  }

  async delete(id: string): Promise<boolean> {
    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, item: GameServerUpdateDTO): Promise<GameServerOutputDTO> {
    const { query } = await this.getModel();

    const updateData: Record<string, unknown> = {
      ...item.toJSON(),
    };

    if (item.connectionInfo) {
      const encryptedConnectionInfo = await encrypt(item.connectionInfo);
      updateData.connectionInfo = encryptedConnectionInfo as unknown as Record<string, unknown>;
    }

    // Remove all undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await query.updateAndFetchById(id, updateData);
    return this.findOne(id, true);
  }
}
