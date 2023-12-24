import { TakaroService } from './Base.js';
import { queueService } from '@takaro/queues';

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
import {
  EventMapping,
  EventTypes,
  HookEventTypes,
  HookEvents,
  EventChatMessage,
  EventPlayerConnected,
  EventPlayerDisconnected,
  EventLogLine,
  isDiscordMessageEvent,
  EventPlayerDeath,
  isPlayerDeathEvent,
  isChatMessageEvent,
  isConnectedEvent,
  isDisconnectedEvent,
} from '@takaro/modules';

@ValidatorConstraint()
export class IsSafeRegex implements ValidatorConstraintInterface {
  public async validate(regex: string) {
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

  @IsEnum(EventTypes)
  eventType!: HookEventTypes;

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

  @IsEnum(EventTypes)
  eventType!: HookEventTypes;

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

  @IsEnum(EventTypes)
  @IsOptional()
  eventType!: HookEventTypes;

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

  @IsObject()
  eventData!: EventMapping[HookEvents];
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
        await new FunctionCreateDTO().construct({
          code: item.function,
        })
      );
      fnIdToAdd = newFn.id;
    } else {
      const newFn = await functionsService.create(await new FunctionCreateDTO());
      fnIdToAdd = newFn.id;
    }

    const created = await this.repo.create(await new HookCreateDTO().construct({ ...item, function: fnIdToAdd }));
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
        await new FunctionUpdateDTO().construct({
          code: item.function,
        })
      );
    }

    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async handleEvent(eventData: EventMapping[HookEvents], gameServerId: string) {
    this.log.debug('Handling hooks', { eventData });
    const gameServerService = new GameServerService(this.domainId);

    const triggeredHooks = await this.repo.getTriggeredHooks(eventData.type, gameServerId);

    const hooksAfterFilters = triggeredHooks
      // Regex checks
      .filter((hook) => {
        if (!hook.regex) return true;

        const regex = new RegExp(hook.regex);
        return regex.test(eventData.msg);
      });

    if (hooksAfterFilters.length) {
      this.log.debug(`Found ${hooksAfterFilters.length} hooks that match the event`);

      await Promise.all(
        hooksAfterFilters.map(async (hook) => {
          const moduleInstallation = await gameServerService.getModuleInstallation(gameServerId, hook.moduleId);

          if (isDiscordMessageEvent(eventData)) {
            const configuredChannel = moduleInstallation.systemConfig.hooks[`${hook.name} Discord channel ID`];
            if (eventData.channel.id !== configuredChannel) return;
          }

          return queueService.queues.hooks.queue.add({
            itemId: hook.id,
            module: await gameServerService.getModuleInstallation(gameServerId, hook.moduleId),
            eventData: eventData,
            domainId: this.domainId,
            functionId: hook.function.id,
            gameServerId,
          });
        })
      );
    }
  }

  async trigger(data: HookTriggerDTO) {
    let eventData: EventMapping[keyof EventMapping] | null = null;

    switch (data.eventData.type) {
      case EventTypes.CHAT_MESSAGE:
        if (!isChatMessageEvent(data.eventData)) {
          throw new errors.BadRequestError('Invalid event data');
        }
        eventData = await new EventChatMessage().construct(data.eventData);
        break;
      case EventTypes.PLAYER_CONNECTED:
        if (!isConnectedEvent(data.eventData)) {
          throw new errors.BadRequestError('Invalid event data');
        }
        eventData = await new EventPlayerConnected().construct(data.eventData);
        break;
      case EventTypes.PLAYER_DISCONNECTED:
        if (!isDisconnectedEvent(data.eventData)) {
          throw new errors.BadRequestError('Invalid event data');
        }
        eventData = await new EventPlayerDisconnected().construct(data.eventData);
        break;
      case EventTypes.PLAYER_DEATH:
        if (!isPlayerDeathEvent(data.eventData)) {
          throw new errors.BadRequestError('Invalid event data');
        }
        eventData = await new EventPlayerDeath().construct(data.eventData);
        break;
      case EventTypes.LOG_LINE:
        eventData = await new EventLogLine().construct({
          timestamp: data.eventData.timestamp,
          type: EventTypes.LOG_LINE,
          msg: data.eventData.msg,
        });
        break;
      default:
        throw new errors.NotFoundError('Unknown event');
    }

    // await eventData.validate()

    return this.handleEvent(eventData, data.gameServerId);
  }
}
