import { TakaroService } from './Base.js';

import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, errors, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { EventModel, EventRepo } from '../db/event.js';
import { getSocketServer } from '../lib/socketServer.js';

export class EventOutputDTO extends TakaroModelDTO<EventOutputDTO> {
  @IsString()
  eventName!: string;

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
  meta: Record<string, unknown>;
}

export class EventCreateDTO extends TakaroDTO<EventCreateDTO> {
  @IsString()
  eventName!: string;

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
  meta: Record<string, unknown>;
}

export class EventUpdateDTO extends TakaroDTO<EventUpdateDTO> {}

@traceableClass('service:event')
export class EventService extends TakaroService<EventModel, EventOutputDTO, EventCreateDTO, EventUpdateDTO> {
  get repo() {
    return new EventRepo(this.domainId);
  }

  find(filters: ITakaroQuery<EventOutputDTO>): Promise<PaginatedOutput<EventOutputDTO>> {
    return this.repo.find(filters);
  }

  findOne(id: string): Promise<EventOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  async create(data: EventCreateDTO): Promise<EventOutputDTO> {
    const created = await this.repo.create(data);

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
