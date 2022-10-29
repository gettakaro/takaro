import { TakaroService } from './Base';

import { IsEnum, IsString, IsUUID } from 'class-validator';
import {
  FunctionModel,
  FunctionRepo,
  ItemsThatCanBeAssignedAFunction,
} from '../db/function';
import { TakaroDTO } from '@takaro/http';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base';

export class FunctionOutputDTO extends TakaroDTO<FunctionOutputDTO> {
  @IsUUID()
  id!: string;
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

export class AssignFunctionDTO {
  @IsEnum(ItemsThatCanBeAssignedAFunction)
  type!: ItemsThatCanBeAssignedAFunction;

  @IsUUID('4')
  itemId!: string;

  @IsUUID('4')
  functionId!: string;
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

  delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async assign(data: AssignFunctionDTO) {
    return this.repo.assign(data.type, data.itemId, data.functionId);
  }

  async unAssign(itemId: string, functionId: string) {
    return this.repo.unAssign(itemId, functionId);
  }

  async getRelatedFunctions(itemId: string, onlyIds = true) {
    return this.repo.getRelatedFunctions(itemId, onlyIds);
  }
}
