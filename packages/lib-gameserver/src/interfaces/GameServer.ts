import { TakaroEmitter } from '../TakaroEmitter.js';
import { IGamePlayer } from './GamePlayer.js';
import { TakaroDTO } from '@takaro/util';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CommandOutput extends TakaroDTO<CommandOutput> {
  @IsString()
  rawResult: string;
  @IsBoolean()
  success: boolean;
  @IsOptional()
  @IsString()
  errorMessage?: string;
}
export class TestReachabilityOutput extends TakaroDTO<TestReachabilityOutput> {
  @IsBoolean()
  connectable: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class IMessageOptsDTO extends TakaroDTO<IMessageOptsDTO> {
  @Type(() => IGamePlayer)
  @ValidateNested()
  /** When specified, will send a DM to this player instead of a global message */
  recipient?: IGamePlayer;
}

export interface IGameServer {
  connectionInfo: unknown;

  getPlayer(id: string): Promise<IGamePlayer | null>;
  getPlayers(): Promise<IGamePlayer[]>;
  getEventEmitter(): TakaroEmitter;

  executeConsoleCommand(rawCommand: string): Promise<CommandOutput>;
  sendMessage(message: string, opts: IMessageOptsDTO): Promise<void>;

  /**
   * Try and connect to the gameserver
   * If anything goes wrong, this function will report a detailed reason
   */
  testReachability(): Promise<TestReachabilityOutput>;
}
