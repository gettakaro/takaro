import {
  IsDate,
  IsEnum,
  IsString,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { TakaroDTO } from '@takaro/util';
import { Type } from 'class-transformer';

export enum GameEvents {
  LOG_LINE = 'log',
  PLAYER_CONNECTED = 'player-connected',
  PLAYER_DISCONNECTED = 'player-disconnected',
  CHAT_MESSAGE = 'chat-message',
}

export class IGamePlayer extends TakaroDTO<IGamePlayer> {
  /**
   * Unique identifier for this player, as used by the game
   */
  @IsString()
  gameId!: string;
  /**
   * The players username
   */
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  steamId?: string;

  @IsString()
  @IsOptional()
  epicOnlineServicesId?: string;

  @IsString()
  @IsOptional()
  xboxLiveId?: string;

  @IsString()
  @IsOptional()
  platformId?: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsNumber()
  @IsOptional()
  ping?: number;
}

export class BaseGameEvent<T> extends TakaroDTO<T> {
  @IsDate()
  timestamp: Date = new Date();

  @IsEnum(GameEvents)
  type: string;

  @IsString()
  msg: string;
}

export class EventLogLine extends BaseGameEvent<EventLogLine> {
  type = GameEvents.LOG_LINE;
}

export class EventPlayerConnected extends BaseGameEvent<EventPlayerConnected> {
  type = GameEvents.PLAYER_CONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player: IGamePlayer;
}

export class EventPlayerDisconnected extends BaseGameEvent<EventPlayerDisconnected> {
  type = GameEvents.PLAYER_DISCONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player: IGamePlayer;
}

export class EventChatMessage extends BaseGameEvent<EventChatMessage> {
  type = GameEvents.CHAT_MESSAGE;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player?: IGamePlayer;

  declare msg: string;
}
