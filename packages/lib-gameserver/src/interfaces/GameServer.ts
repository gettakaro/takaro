import { TakaroEmitter } from '../TakaroEmitter.js';
import { IGamePlayer } from '@takaro/modules';
import { TakaroDTO } from '@takaro/util';
import {
  IsBoolean,
  IsISO8601,
  IsNumber,
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
 * Eg, if we allow users to reference players by Steam ID, that wont work for all gameservers. Not all gameservers have Steam integration
 */
export class IPlayerReferenceDTO extends TakaroDTO<IPlayerReferenceDTO> {
  @IsString()
  gameId: string;
}

export class IItemDTO extends TakaroDTO<IItemDTO> {
  @IsString()
  name: string;
  @IsNumber()
  amount: number;
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

export class BanDTO extends TakaroDTO<BanDTO> {
  @Type(() => IPlayerReferenceDTO)
  @ValidateNested()
  player: IPlayerReferenceDTO;

  @IsString()
  reason: string;

  @IsISO8601()
  @IsOptional()
  expiresAt: string | null;
}

export interface IGameServer {
  connectionInfo: unknown;
  getEventEmitter(): TakaroEmitter;

  getPlayer(player: IPlayerReferenceDTO): Promise<IGamePlayer | null>;
  getPlayers(): Promise<IGamePlayer[]>;
  getPlayerLocation(player: IGamePlayer): Promise<IPosition | null>;

  giveItem(player: IPlayerReferenceDTO, item: IItemDTO): Promise<void>;

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

  kickPlayer(player: IPlayerReferenceDTO, reason: string): Promise<void>;

  banPlayer(options: BanDTO): Promise<void>;
  unbanPlayer(player: IPlayerReferenceDTO): Promise<void>;
  listBans(): Promise<BanDTO[]>;
}
