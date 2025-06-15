import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, traceableClass } from '@takaro/util';
import { TakaroService } from './Base.js';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { EntityRepo, EntitiesModel } from '../db/entities.js';

export class EntityOutputDTO extends TakaroModelDTO<EntityOutputDTO> {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['hostile', 'friendly', 'neutral'])
  @IsOptional()
  type?: 'hostile' | 'friendly' | 'neutral';

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsUUID()
  gameserverId: string;
}

export class EntityCreateDTO extends TakaroDTO<EntityCreateDTO> {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['hostile', 'friendly', 'neutral'])
  @IsOptional()
  type?: 'hostile' | 'friendly' | 'neutral';

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsUUID()
  gameserverId: string;
}

export class EntityUpdateDTO extends TakaroDTO<EntityUpdateDTO> {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['hostile', 'friendly', 'neutral'])
  @IsOptional()
  type?: 'hostile' | 'friendly' | 'neutral';

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

@traceableClass('service:entities')
export class EntitiesService extends TakaroService<EntitiesModel, EntityOutputDTO, EntityCreateDTO, EntityUpdateDTO> {
  get repo() {
    return new EntityRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<EntityOutputDTO>): Promise<PaginatedOutput<EntityOutputDTO>> {
    return this.repo.find(filters);
  }

  async findOne(id: string): Promise<EntityOutputDTO> {
    return this.repo.findOne(id);
  }

  async create(entity: EntityCreateDTO): Promise<EntityOutputDTO> {
    return this.repo.create(entity);
  }

  async update(id: string, entity: EntityUpdateDTO): Promise<EntityOutputDTO> {
    return this.repo.update(id, entity);
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async upsertMany(entities: EntityCreateDTO[]): Promise<void> {
    await this.repo.upsertMany(entities);
  }
}
