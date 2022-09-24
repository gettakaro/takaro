import { TakaroService } from './Base';
import { QueuesService } from '@takaro/queues';

import { HookModel, HookRepo } from '../db/hook';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import {
  AssignFunctionDTO,
  FunctionOutputDTO,
  FunctionService,
} from './FunctionService';
import { Type } from 'class-transformer';

export class HookOutputDTO {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsString()
  trigger!: string;

  @Type(() => FunctionOutputDTO)
  @ValidateNested()
  functions: FunctionOutputDTO[] = [];
}

export class HookCreateDTO {
  @IsString()
  @Length(3, 50)
  name!: string;

  @IsOptional()
  @IsString()
  enabled!: boolean;

  @IsString()
  trigger!: string;

  @IsUUID()
  moduleId!: string;
}

export class UpdateHookDTO {
  @Length(3, 50)
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsString()
  trigger!: string;

  @IsUUID()
  @IsOptional()
  moduleId?: string;
}

export class HookService extends TakaroService<HookModel> {
  queues = QueuesService.getInstance();

  get repo() {
    return new HookRepo(this.domainId);
  }

  async create(item: HookCreateDTO) {
    const created = await this.repo.create(item);
    return created;
  }
  async update(id: string, item: UpdateHookDTO) {
    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async assign(data: AssignFunctionDTO) {
    const functionsService = new FunctionService(this.domainId);
    await functionsService.assign(data);
    const hook = await this.repo.findOne(data.itemId);
    return hook;
  }

  async unAssign(itemId: string, functionId: string) {
    const functionsService = new FunctionService(this.domainId);
    await functionsService.unAssign(itemId, functionId);
    const hook = await this.repo.findOne(itemId);
    return hook;
  }
}
