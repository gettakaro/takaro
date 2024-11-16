import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { CronJobModel, CRONJOB_TABLE_NAME } from './cronjob.js';
import { HookModel, HOOKS_TABLE_NAME } from './hook.js';
import {
  InstallModuleDTO,
  ModuleInstallationOutputDTO,
  ModuleUpdateDTO,
  ModuleVersionUpdateDTO,
} from '../service/Module/dto.js';
import { CommandModel, COMMANDS_TABLE_NAME } from './command.js';
import { CronJobOutputDTO } from '../service/CronJobService.js';
import { HookOutputDTO } from '../service/HookService.js';
import { CommandOutputDTO } from '../service/CommandService.js';
import { FunctionOutputDTO } from '../service/FunctionService.js';
import { PERMISSION_TABLE_NAME, PermissionModel } from './role.js';
import { FunctionModel } from './function.js';
import { ModuleCreateDTO, ModuleOutputDTO, ModuleVersionOutputDTO } from '../service/Module/dto.js';
import { GameServerModel } from './gameserver.js';

export const MODULE_TABLE_NAME = 'modules';
export class ModuleModel extends TakaroModel {
  static tableName = MODULE_TABLE_NAME;
  name!: string;
  builtin: string;
}

export class ModuleVersion extends TakaroModel {
  static tableName = 'moduleVersions';
  moduleId: string;
  tag: string;
  description: string;
  configSchema: string;
  uiSchema: string;

  cronJobs: CronJobOutputDTO[];
  hooks: HookOutputDTO[];
  commands: CommandOutputDTO[];
  functions: FunctionOutputDTO[];

  static get relationMappings() {
    return {
      module: {
        relation: Model.BelongsToOneRelation,
        modelClass: ModuleModel,
        join: {
          from: 'moduleVersions.moduleId',
          to: 'modules.id',
        },
      },
      cronJobs: {
        relation: Model.HasManyRelation,
        modelClass: CronJobModel,
        join: {
          from: `${ModuleVersion.tableName}.id`,
          to: `${CRONJOB_TABLE_NAME}.versionId`,
        },
      },
      hooks: {
        relation: Model.HasManyRelation,
        modelClass: HookModel,
        join: {
          from: `${ModuleVersion.tableName}.id`,
          to: `${HOOKS_TABLE_NAME}.versionId`,
        },
      },
      commands: {
        relation: Model.HasManyRelation,
        modelClass: CommandModel,
        join: {
          from: `${ModuleVersion.tableName}.id`,
          to: `${COMMANDS_TABLE_NAME}.versionId`,
        },
      },
      functions: {
        relation: Model.HasManyRelation,
        modelClass: FunctionModel,
        join: {
          from: `${ModuleVersion.tableName}.id`,
          to: 'functions.versionId',
        },
      },

      permissions: {
        relation: Model.HasManyRelation,
        modelClass: PermissionModel,
        join: {
          from: `${ModuleVersion.tableName}.id`,
          to: `${PERMISSION_TABLE_NAME}.moduleVersionId`,
        },
      },
    };
  }
}

export class ModuleInstallationModel extends TakaroModel {
  static tableName = 'moduleInstallations';
  gameserverId: string;
  moduleId: string;
  versionId: string;
  userConfig: string;
  systemConfig: string;

  static get relationMappings() {
    return {
      version: {
        relation: Model.BelongsToOneRelation,
        modelClass: ModuleVersion,
        join: {
          from: `${ModuleInstallationModel.tableName}.versionId`,
          to: `${ModuleVersion.tableName}.id`,
        },
      },
      gameserver: {
        relation: Model.BelongsToOneRelation,
        modelClass: GameServerModel,
        join: {
          from: `${ModuleInstallationModel.tableName}.gameserverId`,
          to: `${GameServerModel.tableName}.id`,
        },
      },
      module: {
        relation: Model.BelongsToOneRelation,
        modelClass: ModuleModel,
        join: {
          from: `${ModuleInstallationModel.tableName}.moduleId`,
          to: `${ModuleModel.tableName}.id`,
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
    const versionModel = ModuleVersion.bindKnex(knex);
    const installationsModel = ModuleInstallationModel.bindKnex(knex);

    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
      queryVersion: versionModel.query().modify('domainScoped', this.domainId),
      queryInstallations: installationsModel.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<ModuleOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<ModuleModel, ModuleOutputDTO>(filters).build(query);

    return {
      total: result.total,
      results: result.results.map((_) => new ModuleOutputDTO(_)),
    };
  }

  async findVersions(filters: ITakaroQuery<ModuleVersionOutputDTO>) {
    const { queryVersion } = await this.getModel();
    const result = await new QueryBuilder<ModuleVersion, ModuleVersionOutputDTO>({
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
    }).build(queryVersion);

    return {
      total: result.total,
      results: result.results.map((_) => new ModuleVersionOutputDTO(_)),
    };
  }

  async findInstallations(filters: ITakaroQuery<ModuleInstallationOutputDTO>) {
    const { queryInstallations } = await this.getModel();

    const result = await new QueryBuilder<ModuleInstallationModel, ModuleInstallationOutputDTO>({
      ...filters,
      extend: ['version', 'module'],
    }).build(queryInstallations);

    return {
      total: result.total,
      results: result.results.map((_) => new ModuleInstallationOutputDTO(_ as unknown as ModuleInstallationOutputDTO)),
    };
  }

  async findOne(id: string): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new ModuleOutputDTO(data);
  }

  async findOneVersion(id: string): Promise<ModuleVersionOutputDTO> {
    const { queryVersion } = await this.getModel();
    const data = await queryVersion
      .findById(id)
      .withGraphJoined('hooks')
      .withGraphJoined('commands')
      .withGraphJoined('cronJobs')
      .withGraphJoined('functions')
      .withGraphJoined('permissions')
      .withGraphJoined('hooks.function')
      .withGraphJoined('cronJobs.function')
      .withGraphJoined('commands.function')
      .withGraphJoined('commands.arguments');

    return new ModuleVersionOutputDTO(data);
  }

  async create(item: ModuleCreateDTO): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();

    const data = await query.insert({
      name: item.name,
      builtin: item.builtin,
      domain: this.domainId,
    });

    return this.findOne(data.id);
  }

  async delete(id: string): Promise<boolean> {
    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async deleteVersion(id: string): Promise<boolean> {
    const { queryVersion } = await this.getModel();
    const data = await queryVersion.deleteById(id);
    return !!data;
  }

  async update(id: string, data: ModuleUpdateDTO): Promise<ModuleOutputDTO> {
    const { query } = await this.getModel();
    const item = await query.updateAndFetchById(id, data.toJSON());
    return this.findOne(item.id);
  }

  async updateVersion(id: string, data: ModuleVersionUpdateDTO): Promise<ModuleVersionOutputDTO> {
    const { queryVersion } = await this.getModel();
    const item = await queryVersion.updateAndFetchById(id, data.toJSON());

    if (data.permissions) {
      const knex = await this.getKnex();
      const permissionModel = PermissionModel.bindKnex(knex);

      const existingPermissions = await permissionModel.query().where('moduleVersionId', id);
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
          .where('moduleVersionId', id)
          .andWhere('permission', permission.permission);
      }

      if (toInsert.length) {
        await permissionModel.query().insert(
          toInsert.map((permission) => ({
            moduleVersionId: id,
            permission: permission.permission,
            friendlyName: permission.friendlyName,
            description: permission.description,
            canHaveCount: permission.canHaveCount,
          })),
        );
      }
    }

    return this.findOneVersion(item.id);
  }

  async findByCommand(commandId: string): Promise<ModuleVersionOutputDTO> {
    const { queryVersion } = await this.getModel();
    const item = await queryVersion.withGraphJoined('commands').findOne('commands.id', commandId);

    return new ModuleVersionOutputDTO(item);
  }

  async findByHook(hookId: string): Promise<ModuleVersionOutputDTO> {
    const { queryVersion } = await this.getModel();
    const item = await queryVersion.withGraphJoined('hooks').findOne('hooks.id', hookId);

    return new ModuleVersionOutputDTO(item);
  }

  async findByCronJob(cronJobId: string): Promise<ModuleVersionOutputDTO> {
    const { queryVersion } = await this.getModel();
    const item = await queryVersion.withGraphJoined('cronJobs').findOne('cronJobs.id', cronJobId);

    return new ModuleVersionOutputDTO(item);
  }

  async findByFunction(functionId: string): Promise<ModuleVersionOutputDTO> {
    const { queryVersion } = await this.getModel();
    const item = await queryVersion
      .withGraphJoined('hooks')
      .withGraphJoined('commands')
      .withGraphJoined('cronJobs')
      .findOne('hooks.functionId', functionId)
      .orWhere('commands.functionId', functionId)
      .orWhere('cronJobs.functionId', functionId);

    return new ModuleVersionOutputDTO(item);
  }

  async getVersion(id: string): Promise<ModuleVersionOutputDTO> {
    const { queryVersion } = await this.getModel();
    const item = await queryVersion
      .findById(id)
      .withGraphJoined('cronJobs')
      .withGraphJoined('hooks')
      .withGraphJoined('commands')
      .withGraphJoined('functions');

    return new ModuleVersionOutputDTO(item);
  }

  async createVersion(moduleId: string, tag: string): Promise<ModuleVersionOutputDTO> {
    const { queryVersion } = await this.getModel();

    const item = await queryVersion.insert({
      moduleId,
      tag,
      domain: this.domainId,
    });

    return this.findOneVersion(item.id);
  }

  async getLatestVersion(moduleId: string): Promise<ModuleVersionOutputDTO> {
    const { queryVersion } = await this.getModel();
    const item = await queryVersion
      .where('moduleId', moduleId)
      .andWhere('tag', 'latest')
      .first()
      .withGraphJoined('cronJobs')
      .withGraphJoined('hooks')
      .withGraphJoined('commands')
      .withGraphJoined('permissions')
      .withGraphJoined('functions');

    if (!item) {
      const latest = await this.createVersion(moduleId, 'latest');
      return this.findOneVersion(latest.id);
    }

    return new ModuleVersionOutputDTO(item);
  }

  async findOneInstallation(installationId: string) {
    const { queryInstallations } = await this.getModel();
    const res = await queryInstallations
      .findById(installationId)
      .withGraphJoined('version')
      .withGraphJoined('version.cronJobs')
      .withGraphJoined('version.hooks')
      .withGraphJoined('version.commands')
      .withGraphJoined('version.permissions')
      .withGraphJoined('version.functions');
    return new ModuleInstallationOutputDTO(res as unknown as ModuleInstallationOutputDTO);
  }

  async getInstalledModules({
    gameserverId,
    moduleId,
    versionId,
  }: {
    gameserverId?: string;
    moduleId?: string;
    versionId?: string;
  }) {
    const { queryInstallations } = await this.getModel();
    const qry = queryInstallations.modify('domainScoped', this.domainId);

    if (gameserverId) {
      qry.where({ gameserverId });
    }

    if (moduleId) {
      qry.where({ moduleId });
    }

    if (versionId) {
      qry.where({ versionId });
    }

    const res = await qry.withGraphJoined('version');

    return Promise.all(
      res.map((item) => new ModuleInstallationOutputDTO(item as unknown as ModuleInstallationOutputDTO)),
    );
  }

  async installModule(installDto: InstallModuleDTO) {
    const { queryInstallations } = await this.getModel();

    const versionToInstall = await this.findOneVersion(installDto.versionId);
    const data: Partial<ModuleInstallationModel> = {
      gameserverId: installDto.gameServerId,
      versionId: installDto.versionId,
      moduleId: versionToInstall.moduleId,
      userConfig: installDto.userConfig,
      systemConfig: installDto.systemConfig,
      domain: this.domainId,
    };

    const existingInstallation = await this.getInstalledModules({
      gameserverId: installDto.gameServerId,
      versionId: installDto.versionId,
    });

    if (!existingInstallation.length) {
      const created = await queryInstallations.insert(data);
      return this.findOneInstallation(created.id);
    } else {
      const installation = existingInstallation[0];
      await queryInstallations.updateAndFetchById(installation.id, data);
      return this.findOneInstallation(installation.id);
    }
  }

  async uninstallModule(installationId: string) {
    const { query } = await this.getModel();
    const res = await query.deleteById(installationId);
    return !!res;
  }
}
