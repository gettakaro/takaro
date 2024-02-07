import { TakaroService } from './Base.js';

import { IsEnum, IsObject, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, errors, isTakaroDTO, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { EventModel, EventRepo } from '../db/event.js';
import { getSocketServer } from '../lib/socketServer.js';
import { PlayerOutputDTO } from './PlayerService.js';
import { Type } from 'class-transformer';
import { GameServerOutputDTO } from './GameServerService.js';
import { ModuleOutputDTO } from './ModuleService.js';
import { UserOutputDTO } from './UserService.js';
import { EventMapping, EventPayload, TakaroEvents } from '@takaro/modules';
import { ValueOf } from 'type-fest';
import { HookService } from './HookService.js';

export const EVENT_TYPES = {
  ...TakaroEvents,
  // All game events except for LOG_LINE
  PLAYER_CONNECTED: 'player-connected',
  PLAYER_DISCONNECTED: 'player-disconnected',
  CHAT_MESSAGE: 'chat-message',
  PLAYER_DEATH: 'player-death',
  ENTITY_KILLED: 'entity-killed',
} as const;

export type EventTypes = ValueOf<typeof EVENT_TYPES>;

export class EventOutputDTO extends TakaroModelDTO<EventOutputDTO> {
  @IsEnum(EVENT_TYPES)
  eventName!: EventTypes;

  @IsOptional()
  @IsUUID()
  moduleId!: string;

  @IsOptional()
  @IsUUID()
  playerId!: string;

  @IsOptional()
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  gameserverId!: string;

  @IsOptional()
  @IsObject()
  meta: EventPayload;

  @IsOptional()
  @Type(() => PlayerOutputDTO)
  @ValidateNested()
  player: typeof PlayerOutputDTO;

  @IsOptional()
  @Type(() => GameServerOutputDTO)
  @ValidateNested()
  gameServer: typeof GameServerOutputDTO;

  @IsOptional()
  @Type(() => ModuleOutputDTO)
  @ValidateNested()
  module: typeof ModuleOutputDTO;

  @IsOptional()
  @Type(() => UserOutputDTO)
  @ValidateNested()
  user: typeof UserOutputDTO;
}

export class EventCreateDTO extends TakaroDTO<EventCreateDTO> {
  @IsEnum(EVENT_TYPES)
  eventName!: EventTypes;

  @IsOptional()
  @IsUUID()
  moduleId!: string;

  @IsOptional()
  @IsUUID()
  playerId!: string;

  @IsOptional()
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  gameserverId!: string;

  @IsOptional()
  @IsObject()
  meta: TakaroDTO<any>;
}

export class EventUpdateDTO extends TakaroDTO<EventUpdateDTO> {}

@traceableClass('service:event')
export class EventService extends TakaroService<EventModel, EventOutputDTO, EventCreateDTO, EventUpdateDTO> {
  get repo() {
    return new EventRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<EventOutputDTO>): Promise<PaginatedOutput<EventOutputDTO>> {
    const res = await this.repo.find(filters);

    res.results = res.results.map((event) => {
      if (event.gameServer) {
        if ('connectionInfo' in event.gameServer) delete event.gameServer.connectionInfo;
      }

      return event;
    });

    return res;
  }

  findOne(id: string): Promise<EventOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  async create(data: EventCreateDTO): Promise<EventOutputDTO> {
    const dto = EventMapping[data.eventName];
    if (!dto) throw new errors.BadRequestError(`Event ${data.eventName} is not supported`);

    let eventMeta = null;

    if (isTakaroDTO(data.meta)) {
      eventMeta = await new dto().construct(data.meta.toJSON());
    } else {
      eventMeta = await new dto().construct(data.meta);
    }

    await eventMeta.validate();

    const created = await this.repo.create(data);

    const hookService = new HookService(this.domainId);
    await hookService.handleEvent({
      eventType: created.eventName,
      eventData: eventMeta,
      gameServerId: created.gameserverId,
      playerId: created.playerId,
    });

    const socketServer = await getSocketServer();
    socketServer.emit(this.domainId, 'event', [created]);

    return created;
  }

  update(): Promise<EventOutputDTO> {
    throw new errors.BadRequestError('Events cannot be updated');
  }

  async delete(): Promise<string> {
    throw new errors.BadRequestError('Events cannot be deleted');
  }
}
