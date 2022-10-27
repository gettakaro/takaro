import {
  TakaroModel,
  ITakaroQuery,
  QueryBuilder,
  encrypt,
  decrypt,
} from '@takaro/db';
import { Model, PartialModelObject } from 'objection';
import { errors } from '@takaro/logger';
import { ITakaroRepo } from './base';
import { PLAYER_ON_GAMESERVER_TABLE_NAME } from './player';

export const GAMESERVER_TABLE_NAME = 'gameservers';

export enum GAME_SERVER_TYPE {
  'MOCK' = 'MOCK',
  'SEVENDAYSTODIE' = 'SEVENDAYSTODIE',
  'RUST' = 'RUST',
}

export class GameServerModel extends TakaroModel {
  static tableName = GAMESERVER_TABLE_NAME;
  name!: string;

  connectionInfo!: Record<string, unknown>;

  type!: GAME_SERVER_TYPE;

  static get relationMappings() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const modelke = require('./player.ts').PlayerOnGameServerModel;

    return {
      players: {
        relation: Model.HasManyRelation,
        modelClass: modelke,
        join: {
          from: `${GAMESERVER_TABLE_NAME}.id`,
          to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.gameServerId`,
        },
      },
    };
  }
}

export class GameServerRepo extends ITakaroRepo<GameServerModel> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    return GameServerModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<GameServerModel>) {
    const model = await this.getModel();
    return await new QueryBuilder<GameServerModel>(filters).build(
      model.query()
    );
  }

  async findOne(id: string): Promise<GameServerModel> {
    const model = await this.getModel();
    const data = await model.query().findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    const connectionInfo = JSON.parse(
      await decrypt(data.connectionInfo as unknown as string)
    );

    return { ...data, connectionInfo } as GameServerModel;
  }

  async create(
    item: PartialModelObject<GameServerModel>
  ): Promise<GameServerModel> {
    const model = await this.getModel();
    const encryptedConnectionInfo = await encrypt(
      JSON.stringify(item.connectionInfo)
    );
    const data = {
      ...item,
      connectionInfo: Buffer.from(encryptedConnectionInfo, 'utf8'),
    } as unknown as Partial<GameServerModel>;
    const res = await model.query().insert(data).returning('*');
    return { ...res, connectionInfo: item.connectionInfo } as GameServerModel;
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(
    id: string,
    item: PartialModelObject<GameServerModel>
  ): Promise<GameServerModel> {
    const model = await this.getModel();
    const encryptedConnectionInfo = await encrypt(
      JSON.stringify(item.connectionInfo)
    );
    const data = {
      ...item,
      connectionInfo: encryptedConnectionInfo,
    } as unknown as Partial<GameServerModel>;
    const res = await model.query().updateAndFetchById(id, data).returning('*');
    return { ...res, connectionInfo: item.connectionInfo } as GameServerModel;
  }
}
