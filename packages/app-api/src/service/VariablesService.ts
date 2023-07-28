import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, traceableClass } from '@takaro/util';
import { TakaroService } from './Base.js';
import { VariableRepo, VariablesModel } from '../db/variable.js';
import { ITakaroQuery } from '@takaro/db';
import { ITakaroRepo, PaginatedOutput } from '../db/base.js';
import { GameServerOutputDTO } from './GameServerService.js';
import { Type } from 'class-transformer';
import { ModuleOutputDTO } from './ModuleService.js';
import { PlayerOutputDTO } from './PlayerService.js';

export class VariableOutputDTO extends TakaroModelDTO<VariableOutputDTO> {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsUUID()
  @IsOptional()
  gameServerId?: string;

  @IsUUID()
  @IsOptional()
  playerId?: string;

  @IsOptional()
  @IsUUID()
  moduleId!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GameServerOutputDTO)
  gameServer?: GameServerOutputDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleOutputDTO)
  module?: ModuleOutputDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlayerOutputDTO)
  player?: PlayerOutputDTO;
}

export class VariableCreateDTO extends TakaroDTO<VariableCreateDTO> {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsUUID()
  @IsOptional()
  gameServerId?: string;

  @IsUUID()
  @IsOptional()
  playerId?: string;

  @IsOptional()
  @IsUUID()
  moduleId!: string;
}

export class VariableUpdateDTO extends TakaroDTO<VariableUpdateDTO> {
  @IsString()
  @IsOptional()
  key: string;

  @IsString()
  value: string;

  @IsUUID()
  @IsOptional()
  gameServerId?: string;

  @IsUUID()
  @IsOptional()
  playerId?: string;

  @IsOptional()
  @IsUUID()
  moduleId!: string;
}

@traceableClass('service:variable')
export class VariablesService extends TakaroService<
  VariablesModel,
  VariableOutputDTO,
  VariableCreateDTO,
  VariableUpdateDTO
> {
  get repo(): ITakaroRepo<VariablesModel, VariableOutputDTO, VariableCreateDTO, VariableUpdateDTO> {
    return new VariableRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<VariableOutputDTO>): Promise<PaginatedOutput<VariableOutputDTO>> {
    return this.repo.find(filters);
  }

  async findOne(id: string): Promise<VariableOutputDTO> {
    return this.repo.findOne(id);
  }

  async create(item: VariableCreateDTO): Promise<VariableOutputDTO> {
    return this.repo.create(item);
  }

  async update(id: string, item: VariableUpdateDTO): Promise<VariableOutputDTO> {
    return this.repo.update(id, item);
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }
}
