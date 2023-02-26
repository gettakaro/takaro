import { TakaroEmitter } from '../TakaroEmitter';
import { IGamePlayer } from './GamePlayer';
import { TakaroDTO } from '@takaro/util';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

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

export interface IGameServer {
  connectionInfo: unknown;

  getPlayer(id: string): Promise<IGamePlayer | null>;
  getPlayers(): Promise<IGamePlayer[]>;
  getEventEmitter(): TakaroEmitter;

  executeConsoleCommand(rawCommand: string): Promise<CommandOutput>;

  /**
   * Try and connect to the gameserver
   * If anything goes wrong, this function will report a detailed reason
   */
  testReachability(): Promise<TestReachabilityOutput>;
}
