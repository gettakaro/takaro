import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors } from '@takaro/util';
import { ITakaroRepo } from './base';
import { JsonObject } from 'type-fest';
import { CronJobModel, CRONJOB_TABLE_NAME } from './cronjob';
import { HookModel, HOOKS_TABLE_NAME } from './hook';
import {
  ModuleCreateDTO,
  ModuleOutputDTO,
  ModuleUpdateDTO,
} from '../service/ModuleService';
import { CommandModel, COMMANDS_TABLE_NAME } from './command';

export const MODULE_TABLE_NAME = 'modules';

export class ModuleModel extends TakaroModel {
  static tableName = MODULE_TABLE_NAME;
  name!: string;
  enabled!: boolean;
  config!: JsonObject;

  static get relationMappings() {
    return {
      cronJobs: {
        relation: Model.HasManyRelation,
        modelClass: CronJobModel,
        join: {
          from: `${MODULE_TABLE_NAME}.id`,
          to: `${CRONJOB_TABLE_NAME}.moduleId`,
        },
      },
      hooks: {
        relation: Model.HasManyRelation,
        modelClass: HookModel,
        join: {
          from: `${MODULE_TABLE_NAME}.id`,
          to: `${HOOKS_TABLE_NAME}.moduleId`,
        },
      },
      commands: {
        relation: Model.HasManyRelation,
        modelClass: CommandModel,
        join: {
          from: `${MODULE_TABLE_NAME}.id`,
          to: `${COMMANDS_TABLE_NAME}.moduleId`,
        },
      },
    };
  }
}

export class ModuleRepo extends ITakaroRepo<
  ModuleModel,
  ModuleOutputDTO,
  ModuleCreateDTO,
  ModuleUpdateDTO
> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    return ModuleModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<ModuleOutputDTO>) {
    const model = await this.getModel();
    const result = await new QueryBuilder<ModuleModel, ModuleOutputDTO>({
      ...filters,
      extend: ['cronJobs', 'hooks', 'commands'],
    }).build(model.query());

    return {
      total: result.total,
      results: result.results.map((item) => new ModuleOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<ModuleOutputDTO> {
    const model = await this.getModel();
    const data = await model
      .query()
      .findById(id)
      .withGraphJoined('cronJobs.function')
      .withGraphJoined('hooks.function')
      .withGraphJoined('commands.function');

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new ModuleOutputDTO(data);
  }

  async create(item: ModuleCreateDTO): Promise<ModuleOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().insert(item.toJSON());

    return this.findOne(data.id);
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(id: string, data: ModuleUpdateDTO): Promise<ModuleOutputDTO> {
    const model = await this.getModel();
    const item = await model
      .query()
      .updateAndFetchById(id, data.toJSON())
      .withGraphJoined('cronJobs')
      .withGraphJoined('hooks')
      .withGraphJoined('commands');

    return new ModuleOutputDTO(item);
  }
}
