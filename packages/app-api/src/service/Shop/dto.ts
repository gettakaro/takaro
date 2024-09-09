import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  ValidateNested,
  Min,
  IsISO8601,
  IsBoolean,
} from 'class-validator';
import { TakaroModelDTO, TakaroDTO } from '@takaro/util';
import { Type } from 'class-transformer';
import { ItemsOutputDTO } from '../ItemsService.js';

class ShopListingItemMetaOutputDTO extends TakaroModelDTO<ShopListingItemMetaOutputDTO> {
  @IsNumber()
  amount: number;
  @IsString()
  @IsOptional()
  quality?: string;
  @ValidateNested()
  @Type(() => ItemsOutputDTO)
  item: ItemsOutputDTO;
}

class ShopListingItemMetaInputDTO extends TakaroDTO<ShopListingItemMetaOutputDTO> {
  @IsNumber()
  amount: number;
  @IsString()
  @IsOptional()
  quality?: string;
  @IsUUID('4')
  itemId: string;
}

export class ShopListingOutputDTO extends TakaroModelDTO<ShopListingOutputDTO> {
  @IsUUID()
  id!: string;
  @IsUUID()
  gameServerId!: string;
  @ValidateNested({ each: true })
  @Type(() => ShopListingItemMetaOutputDTO)
  items: ShopListingItemMetaOutputDTO[];
  @IsNumber()
  price!: number;
  @IsString()
  @IsOptional()
  name?: string;
  @IsISO8601()
  @IsOptional()
  deletedAt?: Date;
  @IsBoolean()
  draft: boolean;
}

export class ShopListingCreateDTO<T = void> extends TakaroDTO<T> {
  @IsUUID()
  gameServerId!: string;
  @ValidateNested({ each: true })
  @Type(() => ShopListingItemMetaInputDTO)
  items: ShopListingItemMetaInputDTO[];
  @IsNumber()
  price!: number;
  @IsString()
  @IsOptional()
  name?: string;
  @IsBoolean()
  @IsOptional()
  draft?: boolean;
}

export class ShopListingUpdateDTO extends TakaroDTO<ShopListingUpdateDTO> {
  @IsUUID()
  @IsOptional()
  gameServerId!: string;
  @ValidateNested({ each: true })
  @Type(() => ShopListingItemMetaInputDTO)
  @IsOptional()
  items: ShopListingItemMetaInputDTO[];
  @IsNumber()
  @IsOptional()
  price!: number;
  @IsString()
  @IsOptional()
  name?: string;
  @IsBoolean()
  @IsOptional()
  draft?: boolean;
}

export enum ShopOrderStatus {
  COMPLETED = 'COMPLETED',
  PAID = 'PAID',
  CANCELED = 'CANCELED',
}

export class ShopOrderOutputDTO extends TakaroModelDTO<ShopOrderOutputDTO> {
  @IsUUID()
  id: string;
  @IsUUID()
  listingId: string;
  @IsUUID()
  userId: string;
  @IsNumber()
  amount: number;
  @IsEnum(Object.values(ShopOrderStatus))
  status: string;
  @ValidateNested()
  @Type(() => ShopListingOutputDTO)
  @IsOptional()
  listing?: ShopListingOutputDTO;
}

export class ShopOrderCreateDTO<T = void> extends TakaroDTO<T> {
  @IsUUID()
  listingId: string;
  @IsUUID()
  @IsOptional()
  userId?: string;
  @Min(1)
  amount: number;
}

export class ShopOrderCreateInternalDTO extends ShopOrderCreateDTO<ShopOrderCreateInternalDTO> {
  @IsUUID()
  userId: string;
}

export class ShopOrderUpdateDTO extends TakaroDTO<ShopOrderUpdateDTO> {
  @IsEnum(Object.values(ShopOrderStatus))
  status: ShopOrderStatus;
}
