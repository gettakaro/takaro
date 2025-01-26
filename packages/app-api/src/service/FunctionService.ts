import { TakaroService } from './Base.js';

import { IsOptional, IsString, IsUUID } from 'class-validator';
import { FunctionModel, FunctionRepo } from '../db/function.js';
import { TakaroDTO, TakaroModelDTO, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';

export class FunctionOutputDTO extends TakaroModelDTO<FunctionOutputDTO> {
  @IsString()
  code: string;
  @IsString()
  @IsOptional()
  name: string;
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
  @IsUUID()
  @IsOptional()
  versionId?: string;
}

export class FunctionUpdateDTO extends TakaroDTO<FunctionUpdateDTO> {
  @IsString()
  @IsOptional()
  code: string;
  @IsString()
  @IsOptional()
  name: string;
}

const defaultFunctionCode = `import { data, takaro } from '@takaro/helpers';
async function main() {
    const {} = data;
}
await main();`;

@traceableClass('service:function')
export class FunctionService extends TakaroService<
  FunctionModel,
  FunctionOutputDTO,
  FunctionCreateDTO,
  FunctionUpdateDTO
> {
  get repo() {
    return new FunctionRepo(this.domainId);
  }

  find(filters: ITakaroQuery<FunctionOutputDTO>): Promise<PaginatedOutput<FunctionOutputDTO>> {
    return this.repo.find(filters);
  }

  findOne(id: string): Promise<FunctionOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  create(data: FunctionCreateDTO): Promise<FunctionOutputDTO> {
    if (!data.code) data.code = defaultFunctionCode;
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
