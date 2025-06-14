import { TakaroEmitter } from '../TakaroEmitter.js';
import { IGamePlayer, IPosition } from '@takaro/modules';
import { TakaroDTO } from '@takaro/util';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsObject,
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
export class TestReachabilityOutputDTO extends TakaroDTO<TestReachabilityOutputDTO> {
  @IsBoolean()
  connectable: boolean;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsOptional()
  @IsNumber()
  latency?: number;
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
  @IsString()
  code: string;
  @IsString()
  @IsOptional()
  description: string;
  @IsNumber()
  @IsOptional()
  amount?: number;
  @IsString()
  @IsOptional()
  quality?: string;
}

export class IMessageOptsDTO extends TakaroDTO<IMessageOptsDTO> {
  @Type(() => IPlayerReferenceDTO)
  @ValidateNested()
  /** When specified, will send a DM to this player instead of a global message */
  recipient?: IPlayerReferenceDTO;
}

export class BanDTO extends TakaroDTO<BanDTO> {
  @Type(() => IGamePlayer)
  @ValidateNested()
  player: IGamePlayer;

  @IsString()
  reason: string;

  @IsISO8601()
  @IsOptional()
  expiresAt: string | null;
}

export class MapInfoDTO extends TakaroDTO<MapInfoDTO> {
  @IsBoolean()
  enabled: boolean;
  @IsNumber()
  mapBlockSize: number;
  @IsNumber()
  maxZoom: number;
  @IsNumber()
  mapSizeX: number;
  @IsNumber()
  mapSizeY: number;
  @IsNumber()
  mapSizeZ: number;
}

enum EntityType {
  HOSTILE = 'hostile',
  FRIENDLY = 'friendly',
  NEUTRAL = 'neutral',
}

export class IEntityDTO extends TakaroDTO<IEntityDTO> {
  @IsString()
  code: string;
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  description: string;
  @IsEnum(Object.values(EntityType))
  @IsOptional()
  type: EntityType;
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class ILocationDTO extends TakaroDTO<ILocationDTO> {
  @ValidateNested()
  @Type(() => IPosition)
  position: IPosition;
  @IsNumber()
  @IsOptional()
  radius?: number; // For circular areas, radius in game units
  @IsNumber()
  @IsOptional()
  sizeX?: number; // For rectangular areas, X dimension
  @IsNumber()
  @IsOptional()
  sizeY?: number; // For rectangular areas, Y dimension
  @IsNumber()
  @IsOptional()
  sizeZ?: number; // For rectangular areas, Z dimension (height)
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  code?: string;
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export interface IGameServer {
  connectionInfo: unknown;
  getEventEmitter(): TakaroEmitter;

  getPlayer(player: IPlayerReferenceDTO): Promise<IGamePlayer | null>;
  getPlayers(): Promise<IGamePlayer[]>;
  getPlayerLocation(player: IPlayerReferenceDTO): Promise<IPosition | null>;
  getPlayerInventory(player: IPlayerReferenceDTO): Promise<IItemDTO[]>;

  giveItem(player: IPlayerReferenceDTO, item: string, amount: number, quality?: string): Promise<void>;
  listItems(): Promise<IItemDTO[]>;

  listEntities(): Promise<IEntityDTO[]>;
  listLocations(): Promise<ILocationDTO[]>;

  executeConsoleCommand(rawCommand: string): Promise<CommandOutput>;
  sendMessage(message: string, opts: IMessageOptsDTO): Promise<void>;
  teleportPlayer(player: IPlayerReferenceDTO, x: number, y: number, z: number, dimension?: string): Promise<void>;

  /**
   * Try and connect to the gameserver
   * If anything goes wrong, this function will report a detailed reason
   */
  testReachability(): Promise<TestReachabilityOutputDTO>;

  kickPlayer(player: IPlayerReferenceDTO, reason: string): Promise<void>;

  banPlayer(options: BanDTO): Promise<void>;
  unbanPlayer(player: IPlayerReferenceDTO): Promise<void>;
  listBans(): Promise<BanDTO[]>;
  shutdown(): Promise<void>;

  getMapInfo(): Promise<MapInfoDTO>;
  // Returns a base64 encoded image of the map tile
  getMapTile(x: number, y: number, z: number): Promise<string>;
}

// All actions that can be sent to the gameserver
// So the IGameServer interface, but with some internal types omitted
export type GameServerActions = keyof Omit<IGameServer, 'getEventEmitter' | 'connectionInfo'>;
// Also create a runtime array with all the actions
// This is used for class-validator
export const GAME_SERVER_ACTIONS: GameServerActions[] = [
  'getPlayer',
  'getPlayers',
  'getPlayerLocation',
  'getPlayerInventory',
  'giveItem',
  'listItems',
  'executeConsoleCommand',
  'sendMessage',
  'teleportPlayer',
  'testReachability',
  'kickPlayer',
  'banPlayer',
  'unbanPlayer',
  'listBans',
  'shutdown',
  'getMapInfo',
  'getMapTile',
];
