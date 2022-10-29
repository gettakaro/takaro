import {
  TakaroModel,
  ITakaroQuery,
  QueryBuilder,
  encrypt,
  decrypt,
} from '@takaro/db';
import { Model } from 'objection';
import { errors } from '@takaro/logger';
import { ITakaroRepo } from './base';
import { PLAYER_ON_GAMESERVER_TABLE_NAME } from './player';
import {
  GameServerOutputDTO,
  GameServerCreateDTO,
  GameServerUpdateDTO,
} from '../service/GameServerService';

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
    return GameServerModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<GameServerOutputDTO>) {
    const model = await this.getModel();
    const result = await new QueryBuilder<GameServerModel, GameServerOutputDTO>(
      filters
    ).build(model.query());
    return {
      total: result.total,
      results: result.results.map((item) => new GameServerOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<GameServerOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    const connectionInfo = JSON.parse(
      await decrypt(data.connectionInfo as unknown as string)
    );

    return new GameServerOutputDTO({ ...data, connectionInfo });
  }

  async create(item: GameServerCreateDTO): Promise<GameServerOutputDTO> {
    const model = await this.getModel();
    const encryptedConnectionInfo = await encrypt(item.connectionInfo);
    const data = {
      ...item.toJSON(),
      connectionInfo: Buffer.from(encryptedConnectionInfo, 'utf8'),
    } as unknown as Partial<GameServerModel>;
    const res = await model.query().insert(data).returning('*');
    return new GameServerOutputDTO({
      ...res,
      connectionInfo: JSON.parse(item.connectionInfo),
    });
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(
    id: string,
    item: GameServerUpdateDTO
  ): Promise<GameServerOutputDTO> {
    const model = await this.getModel();
    const encryptedConnectionInfo = await encrypt(
      JSON.stringify(item.connectionInfo)
    );
    const data = {
      ...item.toJSON(),
      connectionInfo: encryptedConnectionInfo,
    } as unknown as Partial<GameServerModel>;
    const res = await model.query().updateAndFetchById(id, data).returning('*');
    return new GameServerOutputDTO({
      ...res,
      connectionInfo: JSON.parse(item.connectionInfo),
    });
  }
}
