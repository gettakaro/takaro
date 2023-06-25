import { TakaroService } from './Base.js';
import { queueService } from '@takaro/queues';
import {
  GameEvents,
  EventMapping,
  EventChatMessage,
  EventPlayerConnected,
  EventPlayerDisconnected,
  EventLogLine,
  IPlayerReferenceDTO,
} from '@takaro/gameserver';

import { HookModel, HookRepo } from '../db/hook.js';
import {
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
} from './FunctionService.js';
import { Type } from 'class-transformer';
import safeRegex from 'safe-regex';
import { TakaroDTO, errors, TakaroModelDTO } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { GameServerService } from './GameServerService.js';
import { DiscordEvents, HookEventTypes, HookEvents } from '@takaro/modules';

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

  @IsEnum({ ...GameEvents, ...DiscordEvents })
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

  @IsEnum({ ...GameEvents, ...DiscordEvents })
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

  @IsEnum({ ...GameEvents, ...DiscordEvents })
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

  @IsEnum({ ...GameEvents, ...DiscordEvents })
  eventType!: HookEventTypes;

  @Type(() => IPlayerReferenceDTO)
  @ValidateNested()
  @IsOptional()
  player: IPlayerReferenceDTO;

  @IsString()
  @IsOptional()
  msg: string;
}

export class HookService extends TakaroService<
  HookModel,
  HookOutputDTO,
  HookCreateDTO,
  HookUpdateDTO
> {
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
        await new FunctionCreateDTO().construct({
          code: item.function,
        })
      );
      fnIdToAdd = newFn.id;
    } else {
      const newFn = await functionsService.create(
        await new FunctionCreateDTO()
      );
      fnIdToAdd = newFn.id;
    }

    const created = await this.repo.create(
      await new HookCreateDTO().construct({ ...item, function: fnIdToAdd })
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

  async handleEvent(eventData: HookEvents, gameServerId: string) {
    this.log.debug('Handling hooks', { eventData });
    const gameServerService = new GameServerService(this.domainId);

    const triggeredHooks = await this.repo.getTriggeredHooks(
      eventData.type,
      eventData.msg,
      gameServerId
    );

    if (triggeredHooks.length) {
      this.log.debug(
        `Found ${triggeredHooks.length} hooks that match the event`
      );

      await Promise.all(
        triggeredHooks.map(async (hook) => {
          return queueService.queues.hooks.queue.add({
            itemId: hook.id,
            data: {
              ...eventData,
              module: await gameServerService.getModuleInstallation(
                gameServerId,
                hook.moduleId
              ),
            },
            domainId: this.domainId,
            functionId: hook.function.id,
            gameServerId,
          });
        })
      );
    }
  }

  async trigger(data: HookTriggerDTO) {
    let eventData: EventMapping[GameEvents] | null = null;
    const gameServerService = new GameServerService(this.domainId);

    const player = await gameServerService.getPlayer(
      data.gameServerId,
      data.player
    );

    if (!player) throw new errors.NotFoundError('Player not found');

    switch (data.eventType) {
      case GameEvents.CHAT_MESSAGE:
        eventData = await new EventChatMessage().construct({
          player,
          msg: data.msg,
        });
        break;
      case GameEvents.PLAYER_CONNECTED:
        eventData = await new EventPlayerConnected().construct({
          player,
          msg: 'Player connected',
        });
        break;
      case GameEvents.PLAYER_DISCONNECTED:
        eventData = await new EventPlayerDisconnected().construct({
          player,
          msg: 'Player disconnected',
        });
        break;
      case GameEvents.LOG_LINE:
        eventData = await new EventLogLine().construct({
          msg: data.msg,
        });
        break;
      default:
        throw new errors.NotFoundError('Unknown event');
    }

    return this.handleEvent(eventData, data.gameServerId);
  }
}
