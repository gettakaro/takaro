import { TakaroService } from './Base.js';

import { ModuleModel, ModuleRepo } from '../db/module.js';
import { IsJSON, IsOptional, IsString, Length, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';
import { CronJobCreateDTO, CronJobOutputDTO, CronJobService, CronJobUpdateDTO } from './CronJobService.js';
import { HookCreateDTO, HookOutputDTO, HookService, HookUpdateDTO } from './HookService.js';
import { errors, TakaroDTO, TakaroModelDTO, traceableClass } from '@takaro/util';
import { getModules } from '@takaro/modules';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { CommandCreateDTO, CommandOutputDTO, CommandService, CommandUpdateDTO } from './CommandService.js';
import {
  BuiltinModule,
  TakaroEventModuleCreated,
  TakaroEventModuleUpdated,
  TakaroEventModuleDeleted,
} from '@takaro/modules';
import { GameServerService, ModuleInstallDTO } from './GameServerService.js';
import { PermissionCreateDTO, PermissionOutputDTO } from './RoleService.js';

// Curse you ESM... :(
import _Ajv from 'ajv';
import { getEmptyConfigSchema } from '../lib/systemConfig.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from './EventService.js';
import { FunctionCreateDTO, FunctionOutputDTO, FunctionService, FunctionUpdateDTO } from './FunctionService.js';

const Ajv = _Ajv as unknown as typeof _Ajv.default;
const ajv = new Ajv({ useDefaults: true, strict: true, allErrors: true });

// Since input types have undistinguishable schemas. We need an annotation to parse into the correct input type.
// E.g. a select and country input both have an enum schema, to distinguish them we use the x-component: 'country'.
ajv.addKeyword('x-component');

export class ModuleOutputDTO extends TakaroModelDTO<ModuleOutputDTO> {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsJSON()
  configSchema: string;

  @IsJSON()
  uiSchema: string;

  @IsJSON()
  systemConfigSchema: string;

  @IsString()
  @IsOptional()
  builtin: string;

  @Type(() => CronJobOutputDTO)
  @ValidateNested({ each: true })
  cronJobs: CronJobOutputDTO[];

  @Type(() => HookOutputDTO)
  @ValidateNested({ each: true })
  hooks: HookOutputDTO[];

  @Type(() => CommandOutputDTO)
  @ValidateNested({ each: true })
  commands: CommandOutputDTO[];

  @Type(() => FunctionOutputDTO)
  @ValidateNested({ each: true })
  functions: FunctionOutputDTO[];

  @ValidateNested({ each: true })
  @Type(() => PermissionOutputDTO)
  permissions: PermissionOutputDTO[];
}

export class ModuleCreateDTO extends TakaroDTO<ModuleCreateDTO> {
  @IsString()
  @Length(3, 50)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsJSON()
  @IsOptional()
  configSchema: string;

  @IsJSON()
  @IsOptional()
  uiSchema: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PermissionCreateDTO)
  permissions: PermissionCreateDTO[];
}

export class ModuleCreateInternalDTO extends TakaroDTO<ModuleCreateInternalDTO> {
  @IsString()
  @Length(3, 50)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsJSON()
  @IsOptional()
  configSchema: string;

  @IsJSON()
  @IsOptional()
  uiSchema: string;

  @IsString()
  @IsOptional()
  builtin: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PermissionCreateDTO)
  permissions: PermissionCreateDTO[];
}

export class ModuleUpdateDTO extends TakaroDTO<ModuleUpdateDTO> {
  @Length(3, 50)
  @IsOptional()
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  @IsOptional()
  description?: string;

  @IsJSON()
  @IsOptional()
  configSchema: string;

  @IsJSON()
  @IsOptional()
  uiSchema: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PermissionCreateDTO)
  permissions: PermissionCreateDTO[];
}

@traceableClass('service:module')
export class ModuleService extends TakaroService<ModuleModel, ModuleOutputDTO, ModuleCreateDTO, ModuleUpdateDTO> {
  get repo() {
    return new ModuleRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<ModuleOutputDTO>): Promise<PaginatedOutput<ModuleOutputDTO>> {
    return this.repo.find(filters);
  }

  async findOne(id: string): Promise<ModuleOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  async create(mod: ModuleCreateDTO) {
    try {
      if (!mod.configSchema) {
        mod.configSchema = JSON.stringify(getEmptyConfigSchema());
      }
      ajv.compile(JSON.parse(mod.configSchema));
    } catch (e) {
      throw new errors.BadRequestError('Invalid config schema');
    }
    const created = await this.repo.create(mod);

    const eventsService = new EventService(this.domainId);

    await eventsService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.MODULE_CREATED,
        moduleId: created.id,
        meta: await new TakaroEventModuleCreated(),
      }),
    );

    return created;
  }

  async update(id: string, mod: ModuleUpdateDTO) {
    try {
      if (mod.configSchema === '{}') {
        mod.configSchema = JSON.stringify(getEmptyConfigSchema());
      }

      if (mod.configSchema) {
        ajv.compile(JSON.parse(mod.configSchema));
      }
      const updated = await this.repo.update(id, mod);

      if (!updated.builtin) {
        const eventsService = new EventService(this.domainId);
        await eventsService.create(
          new EventCreateDTO({
            eventName: EVENT_TYPES.MODULE_UPDATED,
            moduleId: id,
            meta: await new TakaroEventModuleUpdated(),
          }),
        );
      }

      await this.refreshInstallations(id);

      return updated;
    } catch (e) {
      throw new errors.BadRequestError('Invalid config schema');
    }
  }

  async delete(id: string) {
    const gameServerService = new GameServerService(this.domainId);
    const installations = await gameServerService.getInstalledModules({
      moduleId: id,
    });
    await Promise.all(installations.map((i) => gameServerService.uninstallModule(i.gameserverId, i.moduleId)));
    await this.repo.delete(id);

    const eventsService = new EventService(this.domainId);

    await eventsService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.MODULE_DELETED,
        moduleId: id,
        meta: await new TakaroEventModuleDeleted(),
      }),
    );

    return id;
  }

  async import(mod: BuiltinModule<unknown>) {
    const existing = await this.repo.find({
      filters: { name: [mod.name] },
    });

    if (existing.results.length === 1) {
      mod.name = `${mod.name}-imported`;
    }

    return this.seedModule(mod, true);
  }

  async seedBuiltinModules() {
    const modules = getModules();
    await Promise.all(modules.map((m) => this.seedModule(m)));
  }

  async seedModule(builtin: BuiltinModule<unknown>, isImport = false) {
    const commandService = new CommandService(this.domainId);
    const hookService = new HookService(this.domainId);
    const cronjobService = new CronJobService(this.domainId);
    const functionService = new FunctionService(this.domainId);
    const existing = await this.repo.find({
      filters: { builtin: [builtin.name] },
    });

    let mod = existing.results[0];

    if (existing.results.length !== 1) {
      mod = await this.create(
        new ModuleCreateInternalDTO({
          ...builtin,
          builtin: isImport ? null : builtin.name,
          permissions: await Promise.all(builtin.permissions.map((p) => new PermissionOutputDTO(p))),
        }),
      );
    } else {
      try {
        mod = await this.update(
          mod.id,
          new ModuleUpdateDTO({
            ...builtin,
            permissions: await Promise.all(builtin.permissions.map((p) => new PermissionOutputDTO(p))),
          }),
        );
      } catch (error) {
        if ((error as Error).message === 'Invalid config schema') {
          this.log.warn('Invalid config schema, uninstalling module', { moduleId: mod.id });
          await this.delete(mod.id);
          mod = await this.create(
            new ModuleCreateInternalDTO({
              ...builtin,
              builtin: isImport ? null : builtin.name,
              permissions: await Promise.all(builtin.permissions.map((p) => new PermissionOutputDTO(p))),
            }),
          );
        } else {
          throw error;
        }
      }
    }

    const commands = Promise.all(
      builtin.commands.map(async (c) => {
        const existing = await commandService.find({
          filters: { name: [c.name], moduleId: [mod.id] },
        });

        if (existing.results.length === 1) {
          const data = new CommandUpdateDTO(c);
          return commandService.update(existing.results[0].id, data);
        }

        const data = new CommandCreateDTO({
          ...c,
          moduleId: mod.id,
        });
        return commandService.create(data);
      }),
    );

    const hooks = Promise.all(
      builtin.hooks.map(async (h) => {
        const existing = await hookService.find({
          filters: { name: [h.name], moduleId: [mod.id] },
        });

        if (existing.results.length === 1) {
          const data = new HookUpdateDTO(h);
          return hookService.update(existing.results[0].id, data);
        }

        const data = new HookCreateDTO({
          ...h,
          eventType: h.eventType,
          moduleId: mod.id,
        });
        return hookService.create(data);
      }),
    );
    const cronjobs = Promise.all(
      builtin.cronJobs.map(async (c) => {
        const existing = await cronjobService.find({
          filters: { name: [c.name], moduleId: [mod.id] },
        });

        if (existing.results.length === 1) {
          const data = new CronJobUpdateDTO(c);
          return cronjobService.update(existing.results[0].id, data);
        }

        const data = new CronJobCreateDTO({
          ...c,
          moduleId: mod.id,
        });
        return cronjobService.create(data);
      }),
    );

    const functions = Promise.all(
      builtin.functions.map(async (f) => {
        const existing = await functionService.find({
          filters: { name: [f.name], moduleId: [mod.id] },
        });

        if (existing.results.length === 1) {
          const data = new FunctionUpdateDTO({
            name: f.name,
            code: f.function,
          });
          return functionService.update(existing.results[0].id, data);
        }

        const data = new FunctionCreateDTO({
          name: f.name,
          code: f.function,
          moduleId: mod.id,
        });
        return functionService.create(data);
      }),
    );

    return Promise.all([commands, hooks, cronjobs, functions]);
  }

  async findOneBy(itemType: string, itemId: string | undefined): Promise<ModuleOutputDTO | undefined> {
    if (!itemId) {
      return;
    }

    switch (itemType) {
      case 'cronjob':
        return await this.repo.findByCronJob(itemId);

      case 'command':
        return await this.repo.findByCommand(itemId);

      case 'hook':
        return await this.repo.findByHook(itemId);

      case 'function':
        return await this.repo.findByFunction(itemId);
    }
  }

  /**
   * After creating a hook, command, cronjob or function, the systemConfig may be outdated
   * @param moduleId
   */
  async refreshInstallations(moduleId: string) {
    const gameserverService = new GameServerService(this.domainId);
    const installations = await gameserverService.getInstalledModules({ moduleId });

    for (const installation of installations) {
      try {
        await gameserverService.installModule(
          installation.gameserverId,
          moduleId,
          new ModuleInstallDTO({
            systemConfig: JSON.stringify(installation.systemConfig),
            userConfig: JSON.stringify(installation.userConfig),
          }),
        );
      } catch (error) {
        if ((error as Error).message === 'Invalid config schema') {
          this.log.warn('Invalid config schema, uninstalling module', {
            moduleId,
            gameserverId: installation.gameserverId,
          });
          await gameserverService.uninstallModule(installation.gameserverId, moduleId);
        } else {
          throw error;
        }
      }
    }
  }
}
