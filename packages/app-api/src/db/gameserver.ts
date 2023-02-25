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
  ModuleInstallDTO,
  ModuleInstallationOutputDTO,
} from '../service/GameServerService';
import { MODULE_TABLE_NAME } from './module';

export const GAMESERVER_TABLE_NAME = 'gameservers';
const MODULE_ASSIGNMENTS_TABLE_NAME = 'moduleAssignments';

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

class ModuleAssignmentModel extends TakaroModel {
  static tableName = MODULE_ASSIGNMENTS_TABLE_NAME;
  gameserverId: string;
  moduleId: string;
  config: string;

  static get relationMappings() {
    return {
      module: {
        relation: Model.BelongsToOneRelation,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        modelClass: require('./module').ModuleModel,
        join: {
          from: `${MODULE_ASSIGNMENTS_TABLE_NAME}.moduleId`,
          to: `${MODULE_TABLE_NAME}.id`,
        },
      },
      gameserver: {
        relation: Model.BelongsToOneRelation,
        modelClass: GameServerModel,
        join: {
          from: `${MODULE_ASSIGNMENTS_TABLE_NAME}.gameserverId`,
          to: `${GAMESERVER_TABLE_NAME}.id`,
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

  async getAssignmentsModel() {
    const knex = await this.getKnex();
    const model = ModuleAssignmentModel.bindKnex(knex);
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

  async getModuleInstallation(gameserverId: string, moduleId: string) {
    const { query } = await this.getAssignmentsModel();
    const res = await query
      .modify('domainScoped', this.domainId)
      .where({ gameserverId, moduleId });
    return new ModuleInstallationOutputDTO(res[0]);
  }

  async getInstalledModules(gameserverId: string) {
    const { query } = await this.getAssignmentsModel();
    const res = await query
      .modify('domainScoped', this.domainId)
      .where({ gameserverId });
    return res.map((item) => new ModuleInstallationOutputDTO(item));
  }

  async installModule(
    gameserverId: string,
    moduleId: string,
    installDto: ModuleInstallDTO
  ) {
    const { query, model } = await this.getAssignmentsModel();
    const data: Partial<ModuleAssignmentModel> = {
      gameserverId,
      moduleId,
      config: installDto.config,
      domain: this.domainId,
    };

    const existing = await query.where({ gameserverId, moduleId });

    if (existing.length > 0) {
      await query.updateAndFetchById(existing[0].id, data);
    } else {
      await model.query().insert(data);
    }

    const res = await query.findOne({ gameserverId, moduleId });
    return new ModuleInstallationOutputDTO(res);
  }

  async uninstallModule(gameserverId: string, moduleId: string) {
    const { query } = await this.getAssignmentsModel();
    const res = await query.delete().where({ gameserverId, moduleId });
    return !!res;
  }
}
