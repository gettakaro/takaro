import { TakaroService } from './Base';
import { QueuesService } from '@takaro/queues';

import { HookModel, HookRepo } from '../db/hook';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  FunctionCreateDTO,
  FunctionOutputDTO,
  FunctionService,
} from './FunctionService';
import { Type } from 'class-transformer';
import { GameEvents } from '@takaro/gameserver';
import safeRegex from 'safe-regex';
import { TakaroDTO } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base';

@ValidatorConstraint()
export class IsSafeRegex implements ValidatorConstraintInterface {
  public async validate(regex: string) {
    return safeRegex(regex);
  }
}

export class HookOutputDTO extends TakaroDTO<HookOutputDTO> {
  @IsUUID()
  id: string;
  @IsString()
  name: string;

  @IsBoolean()
  enabled: boolean;

  @IsString()
  regex: string;

  @Type(() => FunctionOutputDTO)
  @ValidateNested()
  function: FunctionOutputDTO;

  @IsEnum(GameEvents)
  eventType: GameEvents;
}

export class HookCreateDTO extends TakaroDTO<HookCreateDTO> {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsOptional()
  @IsBoolean()
  enabled: boolean;

  @Validate(IsSafeRegex, {
    message:
      'Regex did not pass validation (see the underlying package for more details: https://www.npmjs.com/package/safe-regex)',
  })
  @IsString()
  regex: string;

  @IsUUID()
  moduleId: string;

  @IsEnum(GameEvents)
  eventType: GameEvents;

  @IsOptional()
  @IsString()
  function?: string;
}

export class HookUpdateDTO extends TakaroDTO<HookUpdateDTO> {
  @Length(3, 50)
  @IsString()
  name: string;

  @IsBoolean()
  enabled: boolean;

  @Validate(IsSafeRegex, {
    message:
      'Regex did not pass validation (see the underlying package for more details: https://www.npmjs.com/package/safe-regex)',
  })
  @IsString()
  regex: string;

  @IsUUID()
  @IsOptional()
  moduleId?: string;
}

export class HookService extends TakaroService<
  HookModel,
  HookOutputDTO,
  HookCreateDTO,
  HookUpdateDTO
> {
  queues = QueuesService.getInstance();

  get repo() {
    return new HookRepo(this.domainId);
  }

  async find(
    filters: ITakaroQuery<HookOutputDTO>
  ): Promise<PaginatedOutput<HookOutputDTO>> {
    return this.repo.find(filters);
  }

  async findOne(id: string): Promise<HookOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  async create(item: HookCreateDTO) {
    const functionsService = new FunctionService(this.domainId);
    let fnIdToAdd: string | null = null;

    if (item.function) {
      const newFn = await functionsService.create(
        new FunctionCreateDTO({
          code: item.function,
        })
      );
      fnIdToAdd = newFn.id;
    } else {
      const newFn = await functionsService.create(
        new FunctionCreateDTO({
          code: '',
        })
      );
      fnIdToAdd = newFn.id;
    }

    const created = await this.repo.create(
      new HookCreateDTO({ ...item, function: fnIdToAdd })
    );
    return created;
  }
  async update(id: string, item: HookUpdateDTO) {
    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}
