import { TakaroService } from './Base';

import { IsString } from 'class-validator';
import { FunctionModel, FunctionRepo } from '../db/function';
import { TakaroDTO, TakaroModelDTO } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base';

export class FunctionOutputDTO extends TakaroModelDTO<FunctionOutputDTO> {
  @IsString()
  code!: string;
}

export class FunctionCreateDTO extends TakaroDTO<FunctionCreateDTO> {
  @IsString()
  code!: string;
}

export class FunctionUpdateDTO extends TakaroDTO<FunctionUpdateDTO> {
  @IsString()
  code!: string;
}

export class FunctionService extends TakaroService<
  FunctionModel,
  FunctionOutputDTO,
  FunctionCreateDTO,
  FunctionUpdateDTO
> {
  get repo() {
    return new FunctionRepo(this.domainId);
  }

  find(
    filters: ITakaroQuery<FunctionOutputDTO>
  ): Promise<PaginatedOutput<FunctionOutputDTO>> {
    return this.repo.find(filters);
  }

  findOne(id: string): Promise<FunctionOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  create(data: FunctionCreateDTO): Promise<FunctionOutputDTO> {
    return this.repo.create(data);
  }

  update(id: string, item: FunctionUpdateDTO): Promise<FunctionOutputDTO> {
    return this.repo.update(id, item);
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }
}
