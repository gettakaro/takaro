import { IsBoolean, IsEmail, IsISO8601, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';
import { TakaroDTO, TakaroModelDTO } from '@takaro/util';
import { UserAssignmentOutputDTO } from '../RoleService.js';
import { Type } from 'class-transformer';
import { PlayerOutputWithRolesDTO } from '../Player/dto.js';
import type { PlayerOutputWithRolesDTO as PlayerOutputWithRolesDTOType } from '../Player/dto.js';

export class UserOutputDTO extends TakaroModelDTO<UserOutputDTO> {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  email?: string;
  @IsString()
  idpId: string;
  @IsString()
  @IsOptional()
  discordId?: string;
  @IsString()
  @IsOptional()
  steamId?: string;
  @IsISO8601()
  lastSeen: string;
  @IsUUID()
  @IsOptional()
  playerId?: string;
  @Type(() => PlayerOutputWithRolesDTO)
  @ValidateNested()
  player?: PlayerOutputWithRolesDTOType;
  @IsBoolean()
  isDashboardUser: boolean;
}

export class UserOutputWithRolesDTO extends UserOutputDTO {
  @Type(() => UserAssignmentOutputDTO)
  @ValidateNested({ each: true })
  roles: UserAssignmentOutputDTO[];
}
export class UserCreateInputDTO extends TakaroDTO<UserCreateInputDTO> {
  @Length(3, 50)
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  password?: string;

  @IsString()
  @IsOptional()
  idpId?: string;

  @IsBoolean()
  @IsOptional()
  isDashboardUser?: boolean;
}

export class UserUpdateDTO extends TakaroDTO<UserUpdateDTO> {
  @IsString()
  @Length(3, 50)
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isDashboardUser?: boolean;
}

export class UserUpdateAuthDTO extends TakaroDTO<UserUpdateAuthDTO> {
  @IsString()
  @IsOptional()
  @Length(18, 18)
  discordId?: string;

  @IsString()
  @IsOptional()
  @Length(17, 17)
  steamId?: string;

  @IsISO8601()
  @IsOptional()
  lastSeen?: string;
}

/**
 * Internal-only DTO for creating users with OAuth provider IDs.
 * This should NEVER be exposed via public API endpoints.
 * Only used internally by AuthService when creating users from Ory identities.
 */
export class UserCreateInternalDTO extends UserCreateInputDTO {
  @IsString()
  @IsOptional()
  @Length(18, 18)
  discordId?: string;

  @IsString()
  @IsOptional()
  @Length(17, 17)
  steamId?: string;
}
