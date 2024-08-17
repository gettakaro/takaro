import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { CronJobModel, CRONJOB_TABLE_NAME } from './cronjob.js';
import { HookModel, HOOKS_TABLE_NAME } from './hook.js';
import { ModuleCreateDTO, ModuleOutputDTO, ModuleUpdateDTO } from '../service/ModuleService.js';
import { CommandModel, COMMANDS_TABLE_NAME } from './command.js';
import { CronJobOutputDTO } from '../service/CronJobService.js';
import { HookOutputDTO } from '../service/HookService.js';
import { CommandOutputDTO } from '../service/CommandService.js';
import { FunctionOutputDTO } from '../service/FunctionService.js';
import { getSystemConfigSchema } from '../lib/systemConfig.js';
import { PERMISSION_TABLE_NAME, PermissionModel } from './role.js';
import { FunctionModel } from './function.js';

export const MODULE_TABLE_NAME = 'modules';
export class ModuleModel extends TakaroModel {
  static tableName = MODULE_TABLE_NAME;
  name!: string;
  builtin: string;
  description: string;

  configSchema: string;
  uiSchema: string;

  cronJobs: CronJobOutputDTO[];
  hooks: HookOutputDTO[];
  commands: CommandOutputDTO[];
  functions: FunctionOutputDTO[];

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
      functions: {
        relation: Model.HasManyRelation,
        modelClass: FunctionModel,
        join: {
          from: `${MODULE_TABLE_NAME}.id`,
          to: 'functions.moduleId',
        },
      },

      permissions: {
        relation: Model.HasManyRelation,
        modelClass: PermissionModel,
        join: {
          from: `${MODULE_TABLE_NAME}.id`,
          to: `${PERMISSION_TABLE_NAME}.moduleId`,
        },
      },
    };
  }
}

@traceableClass('repo:module')
export class ModuleRepo extends ITakaroRepo<ModuleModel, ModuleOutputDTO, ModuleCreateDTO, ModuleUpdateDTO> {
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
        'functions',
        'cronJobs.function',
        'hooks.function',
        'commands.function',
        'commands.arguments',
        'permissions',
      ],
    }).build(query);

    const toSend = await Promise.all(
      result.results.map(async (item) => {
        // Parse commands, hooks and cronjobs into their DTOs
        const parsed = {
          ...item,
          cronJobs: await Promise.all(
            item.cronJobs.map(
              async (cronJob) =>
                new CronJobOutputDTO({
                  ...cronJob,
                  function: new FunctionOutputDTO(cronJob.function),
                }),
            ),
          ),
          hooks: await Promise.all(
            item.hooks.map(
              async (hook) =>
                new HookOutputDTO({
                  ...hook,
                  function: new FunctionOutputDTO(hook.function),
                }),
            ),
          ),
          commands: await Promise.all(
            item.commands.map(
              async (command) =>
                new CommandOutputDTO({
                  ...command,
                  function: new FunctionOutputDTO(command.function),
                }),
            ),
          ),
          functions: await Promise.all(item.functions.map((func) => new FunctionOutputDTO(func))),
        };

        return new ModuleOutputDTO(parsed);
      }),
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
      .withGraphJoined('functions')
      .withGraphJoined('permissions')
      .orderBy('commands.name', 'DESC');

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    const toSend = new ModuleOutputDTO(data);
    toSend.systemConfigSchema = getSystemConfigSchema(toSend);
    return toSend;
  }

  async create(item: ModuleCreateDTO): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();

    const data = await query.insert({
      ...item.toJSON(),
      domain: this.domainId,
    });

    if (item.permissions && item.permissions.length > 0) {
      const knex = await this.getKnex();
      const permissionModel = PermissionModel.bindKnex(knex);
      await permissionModel.query().insert(
        item.permissions.map((permission) => ({
          moduleId: data.id,
          permission: permission.permission,
          friendlyName: permission.friendlyName,
          description: permission.description,
          canHaveCount: permission.canHaveCount,
        })),
      );
    }

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

    if (data.permissions) {
      const knex = await this.getKnex();
      const permissionModel = PermissionModel.bindKnex(knex);

      const existingPermissions = await permissionModel.query().where('moduleId', id);
      const existingPermissionsMap = existingPermissions.reduce(
        (acc, permission) => {
          acc[permission.permission] = permission;
          return acc;
        },
        {} as Record<string, PermissionModel>,
      );

      const toUpdate = data.permissions.filter((permission) => {
        const existingPermission = existingPermissionsMap[permission.permission];
        if (!existingPermission) return false;
        return (
          existingPermission.friendlyName !== permission.friendlyName ||
          existingPermission.canHaveCount !== permission.canHaveCount ||
          existingPermission.description !== permission.description
        );
      });

      const toInsert = data.permissions.filter((permission) => !existingPermissionsMap[permission.permission]);
      const toDelete = existingPermissions.filter(
        (permission) => !data.permissions.find((p) => p.permission === permission.permission),
      );

      if (toDelete.length) {
        await permissionModel
          .query()
          .delete()
          .whereIn(
            'id',
            toDelete.map((permission) => permission.id),
          );
      }

      for (const permission of toUpdate) {
        const { friendlyName, canHaveCount, description } = permission;
        await permissionModel
          .query()
          .update({ friendlyName, canHaveCount, description })
          .where('moduleId', id)
          .andWhere('permission', permission.permission);
      }

      if (toInsert.length) {
        await permissionModel.query().insert(
          toInsert.map((permission) => ({
            moduleId: id,
            permission: permission.permission,
            friendlyName: permission.friendlyName,
            description: permission.description,
          })),
        );
      }
    }

    return this.findOne(item.id);
  }

  async findByCommand(commandId: string): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();
    const item = await query.withGraphJoined('commands').findOne('commands.id', commandId);

    return new ModuleOutputDTO(item);
  }

  async findByHook(hookId: string): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();
    const item = await query.withGraphJoined('hooks').findOne('hooks.id', hookId);

    return new ModuleOutputDTO(item);
  }

  async findByCronJob(cronJobId: string): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();
    const item = await query.withGraphJoined('cronJobs').findOne('cronJobs.id', cronJobId);

    return new ModuleOutputDTO(item);
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

    return new ModuleOutputDTO(item);
  }
}
