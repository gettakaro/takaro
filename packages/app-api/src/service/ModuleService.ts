import { TakaroService } from './Base';

import { ModuleModel, ModuleRepo } from '../db/module';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import {
  CronJobCreateDTO,
  CronJobOutputDTO,
  CronJobService,
} from './CronJobService';
import { HookCreateDTO, HookOutputDTO, HookService } from './HookService';
import { errors, TakaroDTO } from '@takaro/util';
import getModules from '@takaro/modules';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base';
import {
  CommandCreateDTO,
  CommandOutputDTO,
  CommandService,
} from './CommandService';
import {
  FunctionCreateDTO,
  FunctionOutputDTO,
  FunctionService,
} from './FunctionService';

export class ModuleOutputDTO extends TakaroDTO<ModuleOutputDTO> {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsObject()
  config!: Record<string, string>;

  @Type(() => CronJobOutputDTO)
  @ValidateNested({ each: true })
  cronJobs: CronJobOutputDTO[];

  @Type(() => HookOutputDTO)
  @ValidateNested({ each: true })
  hooks: HookOutputDTO[];

  @Type(() => CommandOutputDTO)
  @ValidateNested({ each: true })
  commands: CommandOutputDTO[];

  @IsString()
  builtinModuleId: string | null;
}

export class ModuleCreateDTO extends TakaroDTO<ModuleCreateDTO> {
  @IsString()
  @Length(3, 50)
  name!: string;

  @IsOptional()
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsObject()
  config!: Record<string, string>;

  @IsOptional()
  @IsString()
  builtinModuleId: string | null;
}

export class ModuleUpdateDTO extends TakaroDTO<ModuleUpdateDTO> {
  @Length(3, 50)
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsObject()
  config!: Record<string, string>;
}

export class ModuleSetBuiltinDTO extends TakaroDTO<ModuleSetBuiltinDTO> {
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsObject()
  config!: Record<string, string>;
}

export class ModuleService extends TakaroService<
  ModuleModel,
  ModuleOutputDTO,
  ModuleCreateDTO,
  ModuleUpdateDTO
> {
  get repo() {
    return new ModuleRepo(this.domainId);
  }

  async find(
    filters: ITakaroQuery<ModuleOutputDTO>
  ): Promise<PaginatedOutput<ModuleOutputDTO>> {
    return this.repo.find(filters);
  }

  async findOne(id: string): Promise<ModuleOutputDTO | undefined> {
    const modules = await getModules();
    const builtinModule = modules.get(id);
    if (builtinModule) {
      return new ModuleOutputDTO({
        name: builtinModule.name,
        commands: builtinModule.commands.map(
          (c) =>
            new CommandOutputDTO({
              ...c,
              function: new FunctionOutputDTO({ code: c.function }),
            })
        ),
        cronJobs: builtinModule.cronJobs.map(
          (c) =>
            new CronJobOutputDTO({
              ...c,
              function: new FunctionOutputDTO({ code: c.function }),
            })
        ),
        hooks: builtinModule.hooks.map(
          (c) =>
            new HookOutputDTO({
              ...c,
              function: new FunctionOutputDTO({ code: c.function }),
            })
        ),
        enabled: true,
        config: {},
      });
    }

    return this.repo.findOne(id);
  }

  async create(item: ModuleCreateDTO) {
    const created = await this.repo.create(item);
    return created;
  }
  async update(id: string, item: ModuleUpdateDTO) {
    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async getBuiltins(): Promise<ModuleOutputDTO[]> {
    const modules = await getModules();
    return Array.from(modules.values()).map((mod) => {
      return new ModuleOutputDTO({
        name: mod.name,
        commands: mod.commands.map(
          (c) =>
            new CommandOutputDTO({
              ...c,
              function: new FunctionOutputDTO({ code: c.function }),
            })
        ),
        cronJobs: mod.cronJobs.map(
          (c) =>
            new CronJobOutputDTO({
              ...c,
              function: new FunctionOutputDTO({ code: c.function }),
            })
        ),
        hooks: mod.hooks.map(
          (c) =>
            new HookOutputDTO({
              ...c,
              function: new FunctionOutputDTO({ code: c.function }),
            })
        ),
        enabled: true,
        config: {},
      });
    });
  }

  async setBuiltin(id: string, item: ModuleSetBuiltinDTO) {
    const modules = await getModules();
    const builtinModule = modules.get(id);
    if (!builtinModule) {
      throw new errors.NotFoundError('This builtin module does not exist');
    }

    // See if this built-in module was already enabled
    const existingBuiltIn = await this.repo.find({
      filters: { builtinModuleId: id },
    });

    if (existingBuiltIn.results.length > 0) {
      // It already exists, update it
      const existing = existingBuiltIn.results[0];
      await this.repo.update(
        existing.id,
        new ModuleUpdateDTO({
          config: item.config,
          enabled: item.enabled,
        })
      );
      return this.findOne(existing.id);
    }

    let created: ModuleOutputDTO | null = null;

    try {
      created = await this.repo.create(
        new ModuleCreateDTO({
          name: builtinModule.name,
          enabled: item.enabled,
          config: item.config,
          builtinModuleId: id,
        })
      );
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      if (!error.message.includes('UniqueViolationError')) {
        created = await this.repo.create(
          new ModuleCreateDTO({
            name: `${builtinModule.name} (builtin)`,
            enabled: item.enabled,
            config: item.config,
            builtinModuleId: id,
          })
        );
      }
    }

    const commandService = new CommandService(this.domainId);
    const functionService = new FunctionService(this.domainId);
    const hookService = new HookService(this.domainId);
    const cronJobService = new CronJobService(this.domainId);

    // Create all the commands,hooks, cronjobs associated with the builtin module
    await Promise.all([
      ...builtinModule.commands.map(async (c) => {
        const fn = await functionService.create(
          new FunctionCreateDTO({ code: c.function })
        );
        return commandService.create(
          new CommandCreateDTO({
            ...c,
            trigger: c.name,
            function: fn.id,
            moduleId: created?.id,
          })
        );
      }),
      ...builtinModule.hooks.map(async (c) => {
        const fn = await functionService.create(
          new FunctionCreateDTO({ code: c.function })
        );

        return hookService.create(
          new HookCreateDTO({
            ...c,
            function: fn.id,
            moduleId: created?.id,
          })
        );
      }),
      ...builtinModule.cronJobs.map(async (c) => {
        const fn = await functionService.create(
          new FunctionCreateDTO({ code: c.function })
        );

        return cronJobService.create(
          new CronJobCreateDTO({
            ...c,
            function: fn.id,
            moduleId: created?.id,
          })
        );
      }),
    ]);

    if (created) return this.findOne(created?.id);
  }
}
