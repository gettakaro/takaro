import { TakaroModelDTO, TakaroDTO } from '@takaro/util';
import { IsBoolean, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

export class BanOutputDTO extends TakaroModelDTO<BanOutputDTO> {
  @IsUUID('4')
  id: string;
  @IsUUID('4')
  gameServerId: string;
  @IsUUID('4')
  playerId: string;
  @IsBoolean()
  takaroManaged: boolean;
  @IsBoolean()
  isGlobal: boolean;
  @IsISO8601()
  @IsOptional()
  until: string;
  @IsString()
  @IsOptional()
  reason: string;
}

export class BanCreateDTO extends TakaroDTO<BanCreateDTO> {
  @IsUUID('4')
  @IsOptional()
  gameServerId?: string;
  @IsUUID('4')
  playerId: string;
  @IsBoolean()
  @IsOptional()
  takaroManaged: boolean;
  @IsBoolean()
  @IsOptional()
  isGlobal: boolean;
  @IsISO8601()
  @IsOptional()
  until?: string;
  @IsString()
  @IsOptional()
  reason?: string;
}

export class BanUpdateDTO extends TakaroDTO<BanUpdateDTO> {
  @IsUUID('4')
  gameServerId: string;
  @IsUUID('4')
  playerId: string;
  @IsBoolean()
  @IsOptional()
  takaroManaged: boolean;
  @IsBoolean()
  @IsOptional()
  isGlobal: boolean;
  @IsISO8601()
  @IsOptional()
  until?: string;
  @IsString()
  @IsOptional()
  reason?: string;
}
