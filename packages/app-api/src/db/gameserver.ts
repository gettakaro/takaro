import {
  TakaroModel,
  ITakaroQuery,
  QueryBuilder,
  encrypt,
  decrypt,
} from '@takaro/db';
import { Model } from 'objection';
import { errors } from '@takaro/util';
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
    const PlayerOnGameServerModel =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('./player.ts').PlayerOnGameServerModel;

    return {
      players: {
        relation: Model.HasManyRelation,
        modelClass: PlayerOnGameServerModel,
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
    const model = GameServerModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<GameServerOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<GameServerModel, GameServerOutputDTO>(
      filters
    ).build(query);
    return {
      total: result.total,
      results: result.results.map((item) => new GameServerOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<GameServerOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    const connectionInfo = JSON.parse(
      await decrypt(data.connectionInfo as unknown as string)
    );

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

  async update(
    id: string,
    item: GameServerUpdateDTO
  ): Promise<GameServerOutputDTO> {
    const { query } = await this.getModel();
    const encryptedConnectionInfo = await encrypt(item.connectionInfo);
    const data = {
      ...item.toJSON(),
      connectionInfo: encryptedConnectionInfo,
    } as unknown as Partial<GameServerModel>;
    const res = await query.updateAndFetchById(id, data).returning('*');
    return new GameServerOutputDTO({
      ...res,
      connectionInfo: JSON.parse(item.connectionInfo),
    });
  }
}
