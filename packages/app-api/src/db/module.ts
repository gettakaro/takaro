import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { CronJobModel, CRONJOB_TABLE_NAME } from './cronjob.js';
import { HookModel, HOOKS_TABLE_NAME } from './hook.js';
import {
  ModuleCreateDTO,
  ModuleOutputDTO,
  ModuleUpdateDTO,
} from '../service/ModuleService.js';
import { CommandModel, COMMANDS_TABLE_NAME } from './command.js';
import { CronJobOutputDTO } from '../service/CronJobService.js';
import { HookOutputDTO } from '../service/HookService.js';
import { CommandOutputDTO } from '../service/CommandService.js';
import { FunctionOutputDTO } from '../service/FunctionService.js';
import { getSystemConfigSchema } from '../lib/systemConfig.js';

export const MODULE_TABLE_NAME = 'modules';

export class ModuleModel extends TakaroModel {
  static tableName = MODULE_TABLE_NAME;
  name!: string;
  builtin: string;
  description: string;

  configSchema: string;

  cronJobs: CronJobOutputDTO[];
  hooks: HookOutputDTO[];
  commands: CommandOutputDTO[];

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
    const model = ModuleModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<ModuleOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<ModuleModel, ModuleOutputDTO>({
      ...filters,
      extend: [
        'cronJobs',
        'hooks',
        'commands',
        'cronJobs.function',
        'hooks.function',
        'commands.function',
        'commands.arguments',
      ],
    }).build(query);

    const toSend = await Promise.all(
      result.results.map(async (item) => {
        // Parse commands, hooks and cronjobs into their DTOs
        const parsed = {
          ...item,
          cronJobs: await Promise.all(
            item.cronJobs.map(async (cronJob) =>
              new CronJobOutputDTO().construct({
                ...cronJob,
                function: await new FunctionOutputDTO().construct(
                  cronJob.function
                ),
              })
            )
          ),
          hooks: await Promise.all(
            item.hooks.map(async (hook) =>
              new HookOutputDTO().construct({
                ...hook,
                function: await new FunctionOutputDTO().construct(
                  hook.function
                ),
              })
            )
          ),
          commands: await Promise.all(
            item.commands.map(async (command) =>
              new CommandOutputDTO().construct({
                ...command,
                function: await new FunctionOutputDTO().construct(
                  command.function
                ),
              })
            )
          ),
        };

        return new ModuleOutputDTO().construct(parsed);
      })
    );

    return {
      total: result.total,
      results: toSend.map((item) => {
        item.systemConfigSchema = getSystemConfigSchema(item);
        return item;
      }),
    };
  }

  async findOne(id: string): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();
    const data = await query
      .findById(id)
      .withGraphJoined('cronJobs.function')
      .withGraphJoined('hooks.function')
      .withGraphJoined('commands.function')
      .withGraphJoined('commands.arguments')
      .orderBy('commands.name', 'DESC');

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    const toSend = await new ModuleOutputDTO().construct(data);
    toSend.systemConfigSchema = getSystemConfigSchema(toSend);
    return toSend;
  }

  async create(item: ModuleCreateDTO): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.insert({
      ...item.toJSON(),
      domain: this.domainId,
    });

    return this.findOne(data.id);
  }

  async delete(id: string): Promise<boolean> {
    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, data: ModuleUpdateDTO): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();
    const item = await query.updateAndFetchById(id, data.toJSON());

    return this.findOne(item.id);
  }

  async findByCommand(commandId: string): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();
    const item = await query
      .withGraphJoined('commands')
      .findOne('commands.id', commandId);

    return new ModuleOutputDTO().construct(item);
  }

  async findByHook(hookId: string): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();
    const item = await query
      .withGraphJoined('hooks')
      .findOne('hooks.id', hookId);

    return new ModuleOutputDTO().construct(item);
  }

  async findByCronJob(cronJobId: string): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();
    const item = await query
      .withGraphJoined('cronJobs')
      .findOne('cronJobs.id', cronJobId);

    return new ModuleOutputDTO().construct(item);
  }

  async findByFunction(functionId: string): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();
    const item = await query
      .withGraphJoined('hooks')
      .withGraphJoined('commands')
      .withGraphJoined('cronJobs')
      .findOne('hooks.functionId', functionId)
      .orWhere('commands.functionId', functionId)
      .orWhere('cronJobs.functionId', functionId);

    return new ModuleOutputDTO().construct(item);
  }
}
