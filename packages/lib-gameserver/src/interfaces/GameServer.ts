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

/**
 * This is used whenever we want to target a specific player
 * We only allow a subset of IGamePlayer here because to work across gameservers we need to be generic
 */
export class IPlayerReferenceDTO extends TakaroDTO<IPlayerReferenceDTO> {
  @IsString()
  gameId: string;
}

export class IMessageOptsDTO extends TakaroDTO<IMessageOptsDTO> {
  @Type(() => IPlayerReferenceDTO)
  @ValidateNested()
  /** When specified, will send a DM to this player instead of a global message */
  recipient?: IPlayerReferenceDTO;
}

export interface IPosition {
  x: number;
  y: number;
  z: number;
}

export interface IGameServer {
  connectionInfo: unknown;
  getEventEmitter(): TakaroEmitter;

  getPlayer(id: string): Promise<IGamePlayer | null>;
  getPlayers(): Promise<IGamePlayer[]>;
  getPlayerLocation(player: IGamePlayer): Promise<IPosition | null>;

  executeConsoleCommand(rawCommand: string): Promise<CommandOutput>;
  sendMessage(message: string, opts: IMessageOptsDTO): Promise<void>;
  teleportPlayer(
    player: IPlayerReferenceDTO,
    x: number,
    y: number,
    z: number
  ): Promise<void>;

  /**
   * Try and connect to the gameserver
   * If anything goes wrong, this function will report a detailed reason
   */
  testReachability(): Promise<TestReachabilityOutput>;
}
