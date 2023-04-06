import { IsUUID, ValidateNested } from 'class-validator';
import { TakaroDTO } from '@takaro/util';
import { Type } from 'class-transformer';
import { APIOutput } from '@takaro/http';

export class ParamId {
  @IsUUID('4')
  id!: string;
}

export class IdUuidDTO extends TakaroDTO<IdUuidDTO> {
  @IsUUID('4')
  id!: string;
}

export class IdUuidDTOAPI extends APIOutput<IdUuidDTO> {
  @Type(() => IdUuidDTO)
  @ValidateNested()
  declare data: IdUuidDTO;
}
