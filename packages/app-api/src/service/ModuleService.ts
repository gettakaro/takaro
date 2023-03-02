import { TakaroService } from './Base';

import { ModuleModel, ModuleRepo } from '../db/module';
import {
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
  CronJobUpdateDTO,
} from './CronJobService';
import {
  HookCreateDTO,
  HookOutputDTO,
  HookService,
  HookUpdateDTO,
} from './HookService';
import { TakaroDTO } from '@takaro/util';
import { getModules } from '@takaro/modules';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base';
import {
  CommandCreateDTO,
  CommandOutputDTO,
  CommandService,
  CommandUpdateDTO,
} from './CommandService';
import { BuiltinModule } from '@takaro/modules';

export class ModuleOutputDTO extends TakaroDTO<ModuleOutputDTO> {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;

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
  builtin: string;
}

export class ModuleUpdateDTO extends TakaroDTO<ModuleUpdateDTO> {
  @Length(3, 50)
  @IsString()
  name!: string;
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
        new ModuleCreateDTO({
          name: builtin.name,
          domain: this.domainId,
          builtin: builtin.name,
        })
      );
    }

    const commands = Promise.all(
      builtin.commands.map(async (c) => {
        const existing = await commandService.find({
          filters: { name: c.name, moduleId: mod.id },
        });

        if (existing.results.length === 1) {
          const data = new CommandUpdateDTO(c);
          await data.validate();
          return commandService.update(existing.results[0].id, data);
        }

        const data = new CommandCreateDTO({ ...c, moduleId: mod.id });
        await data.validate();
        return commandService.create(data);
      })
    );

    const hooks = Promise.all(
      builtin.hooks.map(async (h) => {
        const existing = await hookService.find({
          filters: { name: h.name, moduleId: mod.id },
        });

        if (existing.results.length === 1) {
          const data = new HookUpdateDTO(h);
          await data.validate();
          return hookService.update(existing.results[0].id, data);
        }

        const data = new HookCreateDTO({ ...h, moduleId: mod.id });
        await data.validate();
        return hookService.create(data);
      })
    );
    const cronjobs = Promise.all(
      builtin.cronJobs.map(async (c) => {
        const existing = await cronjobService.find({
          filters: { name: c.name, moduleId: mod.id },
        });

        if (existing.results.length === 1) {
          const data = new CronJobUpdateDTO(c);
          await data.validate();
          return cronjobService.update(existing.results[0].id, data);
        }

        const data = new CronJobCreateDTO({ ...c, moduleId: mod.id });
        await data.validate();
        return cronjobService.create(data);
      })
    );

    return Promise.all([commands, hooks, cronjobs]);
  }
}
