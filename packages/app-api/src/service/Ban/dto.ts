import { TakaroModelDTO, TakaroDTO } from '@takaro/util';
import { IsBoolean, IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class BanOutputDTO extends TakaroModelDTO<BanOutputDTO> {
  @IsUUID('4')
  id: string;
  @IsUUID('4')
  gameServerId: string;
  @IsUUID('4')
  playerId: string;
  @IsBoolean()
  takaroManaged: boolean;
  @IsISO8601()
  @IsOptional()
  until: Date;
}

export class BanCreateDTO extends TakaroDTO<BanCreateDTO> {}
export class BanUpdateDTO extends TakaroDTO<BanUpdateDTO> {}
