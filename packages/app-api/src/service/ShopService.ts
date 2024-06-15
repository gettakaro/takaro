import { TakaroService } from './Base.js';
import { ShopListingModel, ShopListingRepo } from '../db/shop.js';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, errors, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';

export class ShopListingOutputDTO extends TakaroModelDTO<ShopListingOutputDTO> {
  @IsUUID()
  id!: string;

  @IsUUID()
  gameServerId!: string;

  @IsUUID()
  @IsOptional()
  itemId?: string;

  @IsUUID()
  @IsOptional()
  functionId?: string;

  @IsNumber()
  price!: number;

  @IsString()
  @IsOptional()
  name?: string;
}

export class ShopListingCreateDTO extends TakaroDTO<ShopListingCreateDTO> {
  @IsUUID()
  gameServerId!: string;

  @IsUUID()
  @IsOptional()
  itemId?: string;

  @IsUUID()
  @IsOptional()
  functionId?: string;

  @IsNumber()
  price!: number;

  @IsString()
  @IsOptional()
  name?: string;
}

export class ShopListingUpdateDTO extends TakaroDTO<ShopListingUpdateDTO> {
  @IsUUID()
  gameServerId!: string;
  @IsUUID()
  @IsOptional()
  itemId?: string;
  @IsUUID()
  @IsOptional()
  functionId?: string;
  @IsNumber()
  price!: number;
  @IsString()
  name?: string;
}

@traceableClass('service:shopListing')
export class ShopListingService extends TakaroService<
  ShopListingModel,
  ShopListingOutputDTO,
  ShopListingCreateDTO,
  ShopListingUpdateDTO
> {
  get repo() {
    return new ShopListingRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<ShopListingOutputDTO>): Promise<PaginatedOutput<ShopListingOutputDTO>> {
    const listings = await this.repo.find(filters);
    return listings;
  }

  async findOne(id: string): Promise<ShopListingOutputDTO> {
    const listing = await this.repo.findOne(id);
    if (!listing) throw new errors.NotFoundError(`Shop listing with id ${id} not found`);
    return listing;
  }

  async create(item: ShopListingCreateDTO): Promise<ShopListingOutputDTO> {
    const created = await this.repo.create(item);
    return created;
  }

  async update(id: string, item: ShopListingUpdateDTO): Promise<ShopListingOutputDTO> {
    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string): Promise<string> {
    await this.repo.delete(id);
    return id;
  }
}
