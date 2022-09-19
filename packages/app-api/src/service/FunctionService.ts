import { TakaroService } from './Base';

import { IsEnum, IsString, IsUUID } from 'class-validator';
import {
  FunctionModel,
  FunctionRepo,
  ItemsThatCanBeAssignedAFunction,
} from '../db/function';

export class FunctionOutputDTO {
  @IsUUID()
  id!: string;
  @IsString()
  code!: string;
}

export class FunctionCreateDTO {
  @IsString()
  code!: string;
}

export class UpdateFunctionDTO {
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

export class FunctionService extends TakaroService<FunctionModel> {
  get repo() {
    return new FunctionRepo(this.domainId);
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
