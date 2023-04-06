import { IsString } from 'class-validator';
import { TakaroDTO, TakaroModelDTO } from '@takaro/util';
import { TakaroService } from './Base.js';
import { VariableRepo, VariablesModel } from '../db/variable.js';
import { ITakaroQuery } from '@takaro/db';
import { ITakaroRepo, PaginatedOutput } from '../db/base.js';

export class VariableOutputDTO extends TakaroModelDTO<VariableOutputDTO> {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class VariableCreateDTO extends TakaroDTO<VariableCreateDTO> {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class VariableUpdateDTO extends TakaroDTO<VariableUpdateDTO> {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class VariablesService extends TakaroService<
  VariablesModel,
  VariableOutputDTO,
  VariableCreateDTO,
  VariableUpdateDTO
> {
  get repo(): ITakaroRepo<
    VariablesModel,
    VariableOutputDTO,
    VariableCreateDTO,
    VariableUpdateDTO
  > {
    return new VariableRepo(this.domainId);
  }

  async find(
    filters: ITakaroQuery<VariableOutputDTO>
  ): Promise<PaginatedOutput<VariableOutputDTO>> {
    return this.repo.find(filters);
  }

  async findOne(id: string): Promise<VariableOutputDTO> {
    return this.repo.findOne(id);
  }

  async create(item: VariableCreateDTO): Promise<VariableOutputDTO> {
    return this.repo.create(item);
  }

  async update(
    id: string,
    item: VariableUpdateDTO
  ): Promise<VariableOutputDTO> {
    return this.repo.update(id, item);
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }
}
