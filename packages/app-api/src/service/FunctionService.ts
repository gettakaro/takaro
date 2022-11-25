import { TakaroService } from './Base';

import { IsString, IsUUID } from 'class-validator';
import { FunctionModel, FunctionRepo } from '../db/function';
import { errors, TakaroDTO } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base';
import { CommandService } from './CommandService';
import { HookService } from './HookService';
import { CronJobService } from './CronJobService';
import { ModuleService } from './ModuleService';

export class FunctionOutputDTO extends TakaroDTO<FunctionOutputDTO> {
  @IsUUID()
  id!: string;
  @IsString()
  code!: string;
}

export class FunctionCreateDTO extends TakaroDTO<FunctionCreateDTO> {
  @IsString()
  code!: string;
}

export class FunctionUpdateDTO extends TakaroDTO<FunctionUpdateDTO> {
  @IsString()
  code!: string;
}

export class FunctionService extends TakaroService<
  FunctionModel,
  FunctionOutputDTO,
  FunctionCreateDTO,
  FunctionUpdateDTO
> {
  get repo() {
    return new FunctionRepo(this.domainId);
  }

  find(
    filters: ITakaroQuery<FunctionOutputDTO>
  ): Promise<PaginatedOutput<FunctionOutputDTO>> {
    return this.repo.find(filters);
  }

  findOne(id: string): Promise<FunctionOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  create(data: FunctionCreateDTO): Promise<FunctionOutputDTO> {
    return this.repo.create(data);
  }

  async update(
    id: string,
    item: FunctionUpdateDTO
  ): Promise<FunctionOutputDTO> {
    const moduleId = await this.resolveFunctionIdToModule(id);

    if (moduleId) {
      const moduleService = new ModuleService(this.domainId);
      const module = await moduleService.findOne(moduleId);

      if (!module) {
        throw new errors.NotFoundError('Module not found');
      }

      if (module.builtinModuleId) {
        throw new errors.BadRequestError('Cannot update builtin module');
      }
    }

    return this.repo.update(id, item);
  }

  delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  private async resolveFunctionIdToModule(id: string) {
    const commandService = new CommandService(this.domainId);
    const hookService = new HookService(this.domainId);
    const cronjobService = new CronJobService(this.domainId);

    const results = await Promise.all([
      commandService.find({ filters: { functionId: id } }),
      hookService.find({ filters: { functionId: id } }),
      cronjobService.find({ filters: { functionId: id } }),
    ]);

    const modules = [];

    for (const result of results) {
      for (const item of result.results) {
        modules.push(item.moduleId);
      }
    }

    return modules[0];
  }
}
