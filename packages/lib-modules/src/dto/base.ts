import { TakaroDTO } from '@takaro/util';
import { IsDate, IsString } from 'class-validator';
import { EventTypes } from './index.js';

export class BaseEvent<T> extends TakaroDTO<T> {
  @IsDate()
  timestamp: Date = new Date();

  @IsString()
  type: EventTypes;
}
