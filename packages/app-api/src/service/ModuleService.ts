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
import { CronJobOutputDTO } from './CronJobService';
import { JsonObject } from 'type-fest';
import { HookOutputDTO } from './HookService';
import { TakaroDTO } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base';

export class ModuleOutputDTO extends TakaroDTO<ModuleOutputDTO> {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsObject()
  config!: JsonObject;

  @Type(() => CronJobOutputDTO)
  @ValidateNested()
  cronJobs: CronJobOutputDTO[] = [];

  @Type(() => HookOutputDTO)
  @ValidateNested()
  hooks: HookOutputDTO[] = [];
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
  config!: JsonObject;
}

export class ModuleUpdateDTO extends TakaroDTO<ModuleUpdateDTO> {
  @Length(3, 50)
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsObject()
  config!: JsonObject;
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
}
