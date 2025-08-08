import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { TakaroDTO, TakaroModelDTO } from '@takaro/util';

export class FunctionOutputDTO extends TakaroModelDTO<FunctionOutputDTO> {
  @IsString()
  code: string;
  @IsString()
  @IsOptional()
  name: string;
  @IsString()
  @IsOptional()
  @Length(1, 131072)
  description?: string;
  @IsUUID()
  @IsOptional()
  versionId?: string;
}

export class FunctionCreateDTO extends TakaroDTO<FunctionCreateDTO> {
  @IsString()
  @IsOptional()
  code?: string;
  @IsString()
  @IsOptional()
  name: string;
  @IsString()
  @IsOptional()
  @Length(1, 131072)
  description?: string;
  @IsUUID()
  @IsOptional()
  versionId?: string;
}

export class FunctionUpdateDTO extends TakaroDTO<FunctionUpdateDTO> {
  @IsString()
  @IsOptional()
  name: string;
  @IsString()
  @IsOptional()
  @Length(1, 131072)
  description?: string;
  @IsString()
  @IsOptional()
  code: string;
}
