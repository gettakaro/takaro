import { IsBoolean, IsEmail, IsISO8601, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';
import { TakaroDTO, TakaroModelDTO } from '@takaro/util';
import { UserAssignmentOutputDTO } from '../RoleService.js';
import { Type } from 'class-transformer';
import { PlayerOutputWithRolesDTO } from '../PlayerService.js';

export class UserOutputDTO extends TakaroModelDTO<UserOutputDTO> {
  @IsString()
  name: string;
  @IsString()
  email: string;
  @IsString()
  idpId: string;
  @IsString()
  @IsOptional()
  discordId?: string;
  @IsISO8601()
  lastSeen: string;
  @IsUUID()
  @IsOptional()
  playerId?: string;
  @Type(() => PlayerOutputWithRolesDTO)
  @ValidateNested()
  player?: PlayerOutputWithRolesDTO;
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
  email: string;

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

  @IsISO8601()
  @IsOptional()
  lastSeen?: string;
}
