import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, traceableClass } from '@takaro/util';
import { TakaroService } from './Base.js';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { ItemRepo, ItemsModel } from '../db/items.js';

export class ItemsOutputDTO extends TakaroModelDTO<ItemsOutputDTO> {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  iconId: string;

  @IsString()
  @IsOptional()
  iconBase64: string;

  @IsBoolean()
  iconOverride: boolean;

  @IsUUID()
  gameserverId: string;
}

export class ItemCreateDTO extends TakaroDTO<ItemCreateDTO> {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  iconId: string;

  @IsString()
  @IsOptional()
  iconBase64: string;

  @IsBoolean()
  @IsOptional()
  iconOverride: boolean;

  @IsUUID()
  gameserverId: string;
}

export class ItemUpdateDTO extends TakaroDTO<ItemUpdateDTO> {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  code: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  iconId: string;

  @IsString()
  @IsOptional()
  iconBase64: string;

  @IsBoolean()
  @IsOptional()
  iconOverride: boolean;
}

@traceableClass('service:items')
export class ItemsService extends TakaroService<ItemsModel, ItemsOutputDTO, ItemCreateDTO, ItemUpdateDTO> {
  get repo() {
    return new ItemRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<ItemsOutputDTO>): Promise<PaginatedOutput<ItemsOutputDTO>> {
    return this.repo.find(filters);
  }

  async findOne(id: string): Promise<ItemsOutputDTO> {
    return this.repo.findOne(id);
  }

  async create(item: ItemCreateDTO): Promise<ItemsOutputDTO> {
    return this.repo.create(item);
  }

  async update(id: string, item: ItemUpdateDTO): Promise<ItemsOutputDTO> {
    return this.repo.update(id, item);
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async upsertMany(items: ItemCreateDTO[]): Promise<void> {
    await this.repo.upsertMany(items);
  }
}
