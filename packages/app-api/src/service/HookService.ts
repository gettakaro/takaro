import { TakaroService } from './Base.js';
import { IHookJobData, queueService } from '@takaro/queues';
import { Redis } from '@takaro/db';

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
import { HookEvents, isDiscordMessageEvent, EventPayload, EventTypes, EventMapping } from '@takaro/modules';
import { PlayerOnGameServerService } from './PlayerOnGameserverService.js';
import { PlayerService } from './Player/index.js';
import { ModuleService } from './Module/index.js';
import { InstallModuleDTO } from './Module/dto.js';

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
  eventType: EventTypes;
  @IsUUID()
  versionId: string;
}

export class HookCreateDTO extends TakaroDTO<HookCreateDTO> {
  @IsString()
  @Length(1, 50)
  name: string;
  @Validate(IsSafeRegex, {
    message:
      'Regex did not pass validation (see the underlying package for more details: https://www.npmjs.com/package/safe-regex)',
  })
  @IsString()
  regex: string;
  @IsUUID()
  versionId: string;
  @IsEnum(HookEvents)
  eventType!: EventTypes;
  @IsOptional()
  @IsString()
  function?: string;
}

export class HookUpdateDTO extends TakaroDTO<HookUpdateDTO> {
  @Length(1, 50)
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
  eventType: EventTypes;
  @IsOptional()
  @IsString()
  function?: string;
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
  private moduleService = new ModuleService(this.domainId);
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
    await this.moduleService.refreshInstallations(created.versionId);
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

    const installations = await this.moduleService.getInstalledModules({ versionId: updated.versionId });
    await Promise.all(
      installations.map((i) => {
        const newSystemConfig = i.systemConfig;
        const cmdCfg = newSystemConfig.hooks[existing.name];
        delete newSystemConfig.hooks[existing.name];
        newSystemConfig.hooks[updated.name] = cmdCfg;
        return this.moduleService.installModule(
          new InstallModuleDTO({
            gameServerId: i.gameserverId,
            versionId: i.versionId,
            userConfig: JSON.stringify(i.userConfig),
            systemConfig: JSON.stringify(newSystemConfig),
          }),
        );
      }),
    );

    return updated;
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async handleEvent(opts: IHandleHookOptions) {
    const { eventData, eventType, gameServerId, playerId } = opts;
    const redis = await Redis.getClient('service:hook');

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

      for (const hook of hooksAfterFilters) {
        // This is to solve a pass-by-reference issue
        const copiedHookData = { ...hookData };

        const moduleInstallations = await this.moduleService.getInstalledModules({
          gameserverId: gameServerId,
          versionId: hook.versionId,
        });

        for (const installation of moduleInstallations) {
          if (!installation.systemConfig.enabled) continue;
          const hookConfig = installation.systemConfig.hooks[hook.name];
          if (!hookConfig.enabled) continue;

          if (isDiscordMessageEvent(eventData)) {
            const configuredChannel = hookConfig.discordChannelId;
            if (eventData.channel.id !== configuredChannel) continue;
          }

          copiedHookData.functionId = hook.function.id;
          copiedHookData.itemId = hook.id;
          copiedHookData.module = installation;

          if (hookConfig.cooldown) {
            const cooldownType = hookConfig.cooldownType;
            let cooldownKey = `${this.domainId}:hook:${hook.id}:cooldown`;

            switch (cooldownType) {
              case 'player':
                // If no player is attached to this event, we'll assume it's a server cooldown
                if (!playerId) {
                  cooldownKey += `:${gameServerId}`;
                  break;
                }
                cooldownKey += `:${playerId}`;
                break;
              case 'server':
                cooldownKey += `:${gameServerId}`;
                break;
              default:
                break;
            }

            const cooldown = await redis.get(cooldownKey);
            if (cooldown) {
              this.log.debug(`Hook ${hook.id} is on cooldown`);
              continue;
            }
            await redis.set(cooldownKey, '1', {
              EX: hookConfig.cooldown,
            });
          }

          await queueService.queues.hooks.queue.add(copiedHookData as IHookJobData, {
            delay: hookConfig.delay * 1000,
          });
        }
      }
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
