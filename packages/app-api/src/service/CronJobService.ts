import { TakaroService } from './Base';

import { CronJobModel, CronJobRepo } from '../db/cronjob';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CronJobOutputDTO {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsString()
  temporalValue!: string;
}

export class CronJobCreateDTO {
  @IsString()
  @Length(3, 50)
  name!: string;

  @IsOptional()
  @IsString()
  enabled!: boolean;

  @IsString()
  temporalValue!: string;
}

export class UpdateCronJobDTO {
  @Length(3, 50)
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsString()
  temporalValue!: string;
}

export class CronJobService extends TakaroService<CronJobModel> {
  get repo() {
    return new CronJobRepo(this.domainId);
  }
}
