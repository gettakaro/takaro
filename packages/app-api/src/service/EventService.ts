import { TakaroService } from './Base.js';

import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, errors, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { EventModel, EventRepo } from '../db/event.js';

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
  gameserverId!: string;

  @IsOptional()
  @IsObject()
  meta: Record<string, string>;
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
  gameserverId!: string;

  @IsOptional()
  @IsObject()
  meta: Record<string, string>;
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

  create(data: EventCreateDTO): Promise<EventOutputDTO> {
    return this.repo.create(data);
  }

  update(): Promise<EventOutputDTO> {
    throw new errors.BadRequestError('Events cannot be updated');
  }

  async delete(): Promise<string> {
    throw new errors.BadRequestError('Events cannot be deleted');
  }
}
