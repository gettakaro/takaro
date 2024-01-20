import { TakaroDTO } from '@takaro/util';
import { IsISO8601, IsString } from 'class-validator';
import { EventTypes } from './index.js';
import { Exclude } from 'class-transformer';

export class BaseEvent<T> extends TakaroDTO<T> {
  @IsISO8601()
  timestamp: string = new Date().toISOString();

  @IsString()
  @Exclude({ toPlainOnly: true })
  type: EventTypes;
}
