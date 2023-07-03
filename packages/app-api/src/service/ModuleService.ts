import { TakaroService } from './Base.js';

import { ModuleModel, ModuleRepo } from '../db/module.js';
import { IsJSON, IsOptional, IsString, Length, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';
import { CronJobCreateDTO, CronJobOutputDTO, CronJobService, CronJobUpdateDTO } from './CronJobService.js';
import { HookCreateDTO, HookOutputDTO, HookService, HookUpdateDTO } from './HookService.js';
import { TakaroDTO, TakaroModelDTO } from '@takaro/util';
import { getModules } from '@takaro/modules';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { CommandCreateDTO, CommandOutputDTO, CommandService, CommandUpdateDTO } from './CommandService.js';
import { BuiltinModule } from '@takaro/modules';
import { GameServerService } from './GameServerService.js';

export class ModuleOutputDTO extends TakaroModelDTO<ModuleOutputDTO> {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsJSON()
  configSchema: string;

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

  @IsString()
  @IsOptional()
  builtin: string;
}

export class ModuleUpdateDTO extends TakaroDTO<ModuleUpdateDTO> {
  @Length(3, 50)
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsJSON()
  @IsOptional()
  configSchema: string;
}

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

  async create(item: ModuleCreateDTO) {
    const created = await this.repo.create(item);
    return created;
  }
  async update(id: string, item: ModuleUpdateDTO) {
    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string) {
    const gameServerService = new GameServerService(this.domainId);
    const installations = await gameServerService.getInstalledModules({
      moduleId: id,
    });
    await Promise.all(installations.map((i) => gameServerService.uninstallModule(i.gameserverId, i.moduleId)));
    await this.repo.delete(id);
    return id;
  }

  async seedBuiltinModules() {
    const modules = await getModules();
    await Promise.all(modules.map((m) => this.seedModule(m)));
  }

  private async seedModule(builtin: BuiltinModule) {
    const commandService = new CommandService(this.domainId);
    const hookService = new HookService(this.domainId);
    const cronjobService = new CronJobService(this.domainId);
    const existing = await this.repo.find({
      filters: { builtin: builtin.name },
    });

    let mod = existing.results[0];

    if (existing.results.length !== 1) {
      mod = await this.create(
        await new ModuleCreateInternalDTO().construct({
          ...builtin,
          builtin: builtin.name,
        })
      );
    } else {
      mod = await this.update(
        mod.id,
        await new ModuleUpdateDTO().construct({
          ...builtin,
        })
      );
    }

    const commands = Promise.all(
      builtin.commands.map(async (c) => {
        const existing = await commandService.find({
          filters: { name: c.name, moduleId: mod.id },
        });

        if (existing.results.length === 1) {
          const data = await new CommandUpdateDTO().construct(c);
          return commandService.update(existing.results[0].id, data);
        }

        const data = await new CommandCreateDTO().construct({
          ...c,
          moduleId: mod.id,
        });
        return commandService.create(data);
      })
    );

    const hooks = Promise.all(
      builtin.hooks.map(async (h) => {
        const existing = await hookService.find({
          filters: { name: h.name, moduleId: mod.id },
        });

        if (existing.results.length === 1) {
          const data = await new HookUpdateDTO().construct(h);
          return hookService.update(existing.results[0].id, data);
        }

        const data = await new HookCreateDTO().construct({
          ...h,
          eventType: h.eventType,
          moduleId: mod.id,
        });
        return hookService.create(data);
      })
    );
    const cronjobs = Promise.all(
      builtin.cronJobs.map(async (c) => {
        const existing = await cronjobService.find({
          filters: { name: c.name, moduleId: mod.id },
        });

        if (existing.results.length === 1) {
          const data = await new CronJobUpdateDTO().construct(c);
          return cronjobService.update(existing.results[0].id, data);
        }

        const data = await new CronJobCreateDTO().construct({
          ...c,
          moduleId: mod.id,
        });
        return cronjobService.create(data);
      })
    );

    return Promise.all([commands, hooks, cronjobs]);
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
}
