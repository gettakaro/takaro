import { TakaroService } from './Base.js';

import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { FunctionModel, FunctionRepo } from '../db/function.js';
import { TakaroDTO, TakaroModelDTO, traceableClass, errors } from '@takaro/util';
import { TakaroEventModuleUpdated } from '@takaro/modules';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { EventCreateDTO, EventService, EVENT_TYPES } from './EventService.js';
import { ModuleService } from './Module/index.js';

export class FunctionOutputDTO extends TakaroModelDTO<FunctionOutputDTO> {
  @IsString()
  code: string;
  @IsString()
  @IsOptional()
  name: string;
  @IsString()
  @IsOptional()
  @Length(1, 131072)
  description?: string;
  @IsUUID()
  @IsOptional()
  versionId?: string;
}

export class FunctionCreateDTO extends TakaroDTO<FunctionCreateDTO> {
  @IsString()
  @IsOptional()
  code?: string;
  @IsString()
  @IsOptional()
  name: string;
  @IsString()
  @IsOptional()
  @Length(1, 131072)
  description?: string;
  @IsUUID()
  @IsOptional()
  versionId?: string;
}

export class FunctionUpdateDTO extends TakaroDTO<FunctionUpdateDTO> {
  @IsString()
  @IsOptional()
  name: string;
  @IsString()
  @IsOptional()
  @Length(1, 131072)
  description?: string;
  @IsString()
  @IsOptional()
  code: string;
}

const defaultFunctionCode = `import { data, takaro } from '@takaro/helpers';
async function main() {
    const {} = data;
}
await main();`;

@traceableClass('service:function')
export class FunctionService extends TakaroService<
  FunctionModel,
  FunctionOutputDTO,
  FunctionCreateDTO,
  FunctionUpdateDTO
> {
  get repo() {
    return new FunctionRepo(this.domainId);
  }

  find(filters: ITakaroQuery<FunctionOutputDTO>): Promise<PaginatedOutput<FunctionOutputDTO>> {
    return this.repo.find(filters);
  }

  findOne(id: string): Promise<FunctionOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  async create(data: FunctionCreateDTO): Promise<FunctionOutputDTO> {
    if (!data.code) data.code = defaultFunctionCode;
    const created = await this.repo.create(data);

    // Trigger module-updated event if versionId is provided
    if (data.versionId) {
      const moduleService = new ModuleService(this.domainId);
      const moduleVersion = await moduleService.findOneBy('versionId', data.versionId);
      if (moduleVersion) {
        await new EventService(this.domainId).create(
          new EventCreateDTO({
            eventName: EVENT_TYPES.MODULE_UPDATED,
            moduleId: moduleVersion.moduleId,
            meta: new TakaroEventModuleUpdated({
              changeType: 'created',
              componentType: 'function',
              componentName: created.name,
              componentId: created.id,
              newValue: {
                name: created.name,
                code: created.code,
              },
            }),
          }),
        );
      }
    }

    return created;
  }

  async update(id: string, item: FunctionUpdateDTO): Promise<FunctionOutputDTO> {
    const existing = await this.repo.findOne(id);
    if (!existing) {
      throw new errors.NotFoundError('Function not found');
    }

    // Capture previous state for event
    const previousValue = {
      name: existing.name,
      code: existing.code,
    };

    const updated = await this.repo.update(id, item);

    // Trigger module-updated event if versionId is present
    if (existing.versionId) {
      const moduleService = new ModuleService(this.domainId);
      const moduleVersion = await moduleService.findOneBy('versionId', existing.versionId);
      if (moduleVersion) {
        await new EventService(this.domainId).create(
          new EventCreateDTO({
            eventName: EVENT_TYPES.MODULE_UPDATED,
            moduleId: moduleVersion.moduleId,
            meta: new TakaroEventModuleUpdated({
              changeType: 'updated',
              componentType: 'function',
              componentName: updated.name,
              componentId: updated.id,
              previousValue,
              newValue: {
                name: updated.name,
                code: updated.code,
              },
            }),
          }),
        );
      }
    }

    return updated;
  }

  async delete(id: string) {
    // Get function details before deletion for event
    const existing = await this.repo.findOne(id);
    if (!existing) {
      throw new errors.NotFoundError('Function not found');
    }

    await this.repo.delete(id);

    // Trigger module-updated event if versionId is present
    if (existing.versionId) {
      const moduleService = new ModuleService(this.domainId);
      const moduleVersion = await moduleService.findOneBy('versionId', existing.versionId);
      if (moduleVersion) {
        await new EventService(this.domainId).create(
          new EventCreateDTO({
            eventName: EVENT_TYPES.MODULE_UPDATED,
            moduleId: moduleVersion.moduleId,
            meta: new TakaroEventModuleUpdated({
              changeType: 'deleted',
              componentType: 'function',
              componentName: existing.name,
              componentId: existing.id,
              previousValue: {
                name: existing.name,
                code: existing.code,
              },
            }),
          }),
        );
      }
    }

    return id;
  }
}
