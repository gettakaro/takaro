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

export class ModuleOutputDTO {
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
}

export class ModuleCreateDTO {
  @IsString()
  @Length(3, 50)
  name!: string;

  @IsOptional()
  @IsString()
  enabled!: boolean;

  @IsOptional()
  @IsObject()
  config!: JsonObject;
}

export class UpdateModuleDTO {
  @Length(3, 50)
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsObject()
  config!: JsonObject;
}

export class ModuleService extends TakaroService<ModuleModel> {
  get repo() {
    return new ModuleRepo(this.domainId);
  }

  async create(item: ModuleCreateDTO) {
    const created = await this.repo.create(item);
    return created;
  }
  async update(id: string, item: UpdateModuleDTO) {
    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}
