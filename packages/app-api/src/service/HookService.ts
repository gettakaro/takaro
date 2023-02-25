import { TakaroService } from './Base';
import { QueuesService } from '@takaro/queues';
import { GameEvents, EventMapping } from '@takaro/gameserver';

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
  FunctionUpdateDTO,
} from './FunctionService';
import { Type } from 'class-transformer';
import safeRegex from 'safe-regex';
import { TakaroDTO, errors } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base';
import { AuthService } from './AuthService';

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

  @IsUUID()
  moduleId: string;
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

  @IsOptional()
  @IsString()
  function?: string;
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
    const existing = await this.repo.findOne(id);

    if (!existing) {
      throw new errors.NotFoundError('Hook not found');
    }

    if (item.function) {
      const functionsService = new FunctionService(this.domainId);
      const fn = await functionsService.findOne(existing.function.id);
      if (!fn) {
        throw new errors.NotFoundError('Function not found');
      }

      await functionsService.update(
        fn.id,
        new FunctionUpdateDTO({
          code: item.function,
        })
      );
    }

    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async handleEvent(eventData: EventMapping[GameEvents], gameServerId: string) {
    this.log.debug('Handling hooks', { eventData });

    const triggeredHooks = await this.repo.getTriggeredHooks(
      eventData.type,
      eventData.msg,
      gameServerId
    );

    this.log.debug(`Found ${triggeredHooks.length} hooks that match the event`);

    if (triggeredHooks.length) {
      const authService = new AuthService(this.domainId);
      const token = await authService.getAgentToken();

      await Promise.all(
        triggeredHooks.map(async (hook) => {
          return this.queues.queues.hooks.queue.add(hook.id, {
            itemId: hook.id,
            data: eventData,
            domainId: this.domainId,
            function: hook.function.code,
            token,
          });
        })
      );
    }
  }
}
