import { TakaroService } from './Base.js';
import { IHookJobData, queueService } from '@takaro/queues';

import { HookModel, HookRepo } from '../db/hook.js';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { FunctionCreateDTO, FunctionOutputDTO, FunctionService, FunctionUpdateDTO } from './FunctionService.js';
import { Type } from 'class-transformer';
import safeRegex from 'safe-regex';
import { TakaroDTO, errors, TakaroModelDTO, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { GameServerService } from './GameServerService.js';
import { HookEvents, isDiscordMessageEvent, EventPayload, EventTypes, EventMapping } from '@takaro/modules';
import { PlayerOnGameServerService } from './PlayerOnGameserverService.js';
import { PlayerService } from './PlayerService.js';
import { ModuleService } from './ModuleService.js';

interface IHandleHookOptions {
  eventType: EventTypes;
  eventData: EventPayload;
  gameServerId: string;
  playerId?: string;
}

@ValidatorConstraint()
export class IsSafeRegex implements ValidatorConstraintInterface {
  public validate(regex: string) {
    return safeRegex(regex);
  }
}
export class HookOutputDTO extends TakaroModelDTO<HookOutputDTO> {
  @IsString()
  name: string;

  @IsString()
  regex: string;

  @Type(() => FunctionOutputDTO)
  @ValidateNested()
  function: FunctionOutputDTO;

  @IsEnum(HookEvents)
  eventType!: EventTypes;

  @IsUUID()
  moduleId: string;
}

export class HookCreateDTO extends TakaroDTO<HookCreateDTO> {
  @IsString()
  @Length(3, 50)
  name: string;

  @Validate(IsSafeRegex, {
    message:
      'Regex did not pass validation (see the underlying package for more details: https://www.npmjs.com/package/safe-regex)',
  })
  @IsString()
  regex: string;

  @IsUUID()
  moduleId: string;

  @IsEnum(HookEvents)
  eventType!: EventTypes;

  @IsOptional()
  @IsString()
  function?: string;

  @IsOptional()
  @IsString()
  discordChannelId?: string;
}

export class HookUpdateDTO extends TakaroDTO<HookUpdateDTO> {
  @Length(3, 50)
  @IsString()
  @IsOptional()
  name: string;

  @Validate(IsSafeRegex, {
    message:
      'Regex did not pass validation (see the underlying package for more details: https://www.npmjs.com/package/safe-regex)',
  })
  @IsString()
  @IsOptional()
  regex: string;

  @IsEnum(HookEvents)
  @IsOptional()
  eventType!: EventTypes;

  @IsOptional()
  @IsString()
  function?: string;

  @IsOptional()
  @IsString()
  discordChannelId?: string;
}

export class HookTriggerDTO extends TakaroDTO<HookTriggerDTO> {
  @IsUUID()
  gameServerId: string;

  @IsOptional()
  @IsUUID()
  playerId?: string;

  @IsOptional()
  @IsUUID()
  moduleId?: string;

  @IsEnum(HookEvents)
  eventType!: EventTypes;

  @IsObject()
  eventMeta: EventPayload;
}

@traceableClass('service:hook')
export class HookService extends TakaroService<HookModel, HookOutputDTO, HookCreateDTO, HookUpdateDTO> {
  get repo() {
    return new HookRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<HookOutputDTO>): Promise<PaginatedOutput<HookOutputDTO>> {
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
        }),
      );
      fnIdToAdd = newFn.id;
    } else {
      const newFn = await functionsService.create(await new FunctionCreateDTO());
      fnIdToAdd = newFn.id;
    }

    const created = await this.repo.create(new HookCreateDTO({ ...item, function: fnIdToAdd }));

    const moduleService = new ModuleService(this.domainId);
    await moduleService.refreshInstallations(item.moduleId);

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
        }),
      );
    }

    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async handleEvent(opts: IHandleHookOptions) {
    const { eventData, eventType, gameServerId, playerId } = opts;
    const gameServerService = new GameServerService(this.domainId);

    const triggeredHooks = await this.repo.getTriggeredHooks(eventType, gameServerId);

    const hooksAfterFilters = triggeredHooks
      // Regex checks
      .filter((hook) => {
        if (!hook.regex) return true;
        if (!('msg' in eventData)) return false;
        if (typeof eventData.msg !== 'string') return false;
        const regex = new RegExp(hook.regex);
        return regex.test(eventData.msg);
      });

    if (hooksAfterFilters.length) {
      this.log.info(`Found ${hooksAfterFilters.length} hooks that match the event`);
      const hookData: Partial<IHookJobData> = {
        eventData: eventData,
        domainId: this.domainId,
        gameServerId,
      };

      if (playerId) {
        const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);
        const playerService = new PlayerService(this.domainId);
        const resolvedPlayer = await playerOnGameServerService.find({
          filters: {
            playerId: [playerId],
            gameServerId: [gameServerId],
          },
        });
        const globalPlayer = await playerService.findOne(playerId);
        hookData.pog = resolvedPlayer.results[0];
        hookData.player = globalPlayer;
      }

      await Promise.all(
        hooksAfterFilters.map(async (hook) => {
          // This is to solve a pass-by-reference issue
          const copiedHookData = { ...hookData };

          const moduleInstallation = await gameServerService.getModuleInstallation(gameServerId, hook.moduleId);
          if (!moduleInstallation.systemConfig.enabled) return;
          if (!moduleInstallation.systemConfig.hooks[hook.name].enabled) return;

          if (isDiscordMessageEvent(eventData)) {
            const configuredChannel = moduleInstallation.systemConfig.hooks[hook.name].discordChannelId;
            if (eventData.channel.id !== configuredChannel) return;
          }

          copiedHookData.functionId = hook.function.id;
          copiedHookData.itemId = hook.id;
          copiedHookData.module = await gameServerService.getModuleInstallation(gameServerId, hook.moduleId);

          return queueService.queues.hooks.queue.add(copiedHookData as IHookJobData);
        }),
      );
    }
  }

  async trigger(data: HookTriggerDTO) {
    const dto = EventMapping[data.eventType];

    if (!dto) {
      throw new errors.BadRequestError('Invalid event type');
    }

    const eventData = new dto(data.eventMeta);
    await eventData.validate();

    return this.handleEvent({
      eventType: data.eventType,
      eventData,
      gameServerId: data.gameServerId,
      playerId: data.playerId,
    });
  }
}
