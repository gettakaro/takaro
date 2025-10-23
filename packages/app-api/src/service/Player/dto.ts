import {
  IsBoolean,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Matches,
  IsUUID,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { TakaroDTO, TakaroModelDTO } from '@takaro/util';
import { PlayerOnGameserverOutputDTO } from '../PlayerOnGameserverService.js';
import { Type, Exclude } from 'class-transformer';
import { PlayerRoleAssignmentOutputDTO } from '../RoleService.js';

export class PlayerOutputDTO extends TakaroModelDTO<PlayerOutputDTO> {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  steamId?: string;
  @IsString()
  @IsOptional()
  xboxLiveId?: string;
  @IsString()
  @IsOptional()
  epicOnlineServicesId?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/, {
    message: "Platform ID must be in format 'platform:id' (e.g., 'minecraft:player-uuid')",
  })
  platformId?: string;

  @IsString()
  @IsOptional()
  steamAvatar?: string;

  @IsISO8601()
  @IsOptional()
  steamAccountCreated?: string;

  @IsBoolean()
  @IsOptional()
  steamCommunityBanned?: boolean;

  @IsString()
  @IsOptional()
  steamEconomyBan?: string;

  @IsBoolean()
  @IsOptional()
  steamVacBanned?: boolean;

  @IsNumber()
  @IsOptional()
  steamsDaysSinceLastBan?: number;

  @IsNumber()
  @IsOptional()
  steamNumberOfVACBans?: number;

  @IsNumber()
  @IsOptional()
  steamLevel?: number;

  @IsNumber()
  playtimeSeconds: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PlayerOnGameserverOutputDTO)
  playerOnGameServers?: PlayerOnGameserverOutputDTO[];

  @ValidateNested({ each: true })
  @Type(() => IpHistoryOutputDTO)
  ipHistory: IpHistoryOutputDTO[];

  @ValidateNested({ each: true })
  @Type(() => NameHistoryOutputDTO)
  nameHistory: NameHistoryOutputDTO[];
}

export class NameHistoryOutputDTO extends TakaroModelDTO<NameHistoryOutputDTO> {
  @Exclude()
  playerId?: string;

  @Exclude()
  gameServerId?: string;

  @IsString()
  name: string;
}

export class IpHistoryOutputDTO extends TakaroDTO<IpHistoryOutputDTO> {
  @IsISO8601()
  createdAt: string;

  @IsString()
  ip: string;

  @IsString()
  @IsOptional()
  country: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  latitude: string;

  @IsString()
  @IsOptional()
  longitude: string;
}

export class PlayerOutputWithRolesDTO extends PlayerOutputDTO {
  @Type(() => PlayerRoleAssignmentOutputDTO)
  @ValidateNested({ each: true })
  roleAssignments: PlayerRoleAssignmentOutputDTO[];
}

export class PlayerCreateDTO extends TakaroDTO<PlayerCreateDTO> {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  steamId?: string;
  @IsString()
  @IsOptional()
  xboxLiveId?: string;
  @IsString()
  @IsOptional()
  epicOnlineServicesId?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/, {
    message: "Platform ID must be in format 'platform:id' (e.g., 'minecraft:player-uuid')",
  })
  platformId?: string;
}

export class PlayerUpdateDTO extends TakaroDTO<PlayerUpdateDTO> {
  @IsString()
  name!: string;
  @IsString()
  @IsOptional()
  steamId?: string;
  @IsString()
  @IsOptional()
  xboxLiveId?: string;
  @IsString()
  @IsOptional()
  epicOnlineServicesId?: string;
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/, {
    message: "Platform ID must be in format 'platform:id' (e.g., 'minecraft:player-uuid')",
  })
  platformId?: string;
  @IsNumber()
  @IsOptional()
  playtimeSeconds?: number;
}

export class PlayerBulkDeleteInputDTO extends TakaroDTO<PlayerBulkDeleteInputDTO> {
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  playerIds!: string[];
}

export class PlayerBulkDeleteOutputDTO extends TakaroDTO<PlayerBulkDeleteOutputDTO> {
  @IsNumber()
  deleted!: number;

  @IsNumber()
  failed!: number;

  @ValidateNested({ each: true })
  @Type(() => PlayerBulkDeleteErrorDTO)
  errors!: PlayerBulkDeleteErrorDTO[];
}

export class PlayerBulkDeleteErrorDTO extends TakaroDTO<PlayerBulkDeleteErrorDTO> {
  @IsUUID('4')
  playerId!: string;

  @IsString()
  reason!: string;
}
