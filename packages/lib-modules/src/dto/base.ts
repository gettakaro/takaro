import { TakaroDTO } from '@takaro/util';
import { IsDate, IsString } from 'class-validator';
import { EventTypes } from './index.js';
import { Exclude } from 'class-transformer';

export class BaseEvent<T> extends TakaroDTO<T> {
  @IsDate()
  @Exclude({ toPlainOnly: true })
  timestamp: Date = new Date();

  @IsString()
  @Exclude({ toPlainOnly: true })
  type: EventTypes;
}
