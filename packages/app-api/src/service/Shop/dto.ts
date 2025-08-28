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
  MaxLength,
} from 'class-validator';
import { TakaroModelDTO, TakaroDTO } from '@takaro/util';
import { Type } from 'class-transformer';
import { ItemsOutputDTO } from '../ItemsService.js';

export class ShopListingItemMetaOutputDTO extends TakaroModelDTO<ShopListingItemMetaOutputDTO> {
  @IsNumber()
  amount: number;
  @IsString()
  @IsOptional()
  quality?: string;
  @ValidateNested()
  @Type(() => ItemsOutputDTO)
  item: ItemsOutputDTO;
}

export class ShopListingItemMetaInputDTO extends TakaroDTO<ShopListingItemMetaInputDTO> {
  @IsNumber()
  amount: number;
  @IsString()
  @IsOptional()
  quality?: string;
  @IsString()
  @IsOptional()
  code?: string;
  @IsUUID('4')
  @IsOptional()
  itemId?: string;
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
  name: string;
  @IsString()
  @IsOptional()
  icon?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsISO8601()
  @IsOptional()
  deletedAt?: Date;
  @IsBoolean()
  draft: boolean;
  @ValidateNested({ each: true })
  @Type(() => ShopCategoryOutputDTO)
  @IsOptional()
  categories?: ShopCategoryOutputDTO[];
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
  name: string;
  @IsString()
  @IsOptional()
  icon?: string;
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
  @IsBoolean()
  @IsOptional()
  draft?: boolean;
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];
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
  @IsString()
  @IsOptional()
  icon?: string;
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
  @IsBoolean()
  @IsOptional()
  draft?: boolean;
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];
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
  playerId: string;
  @IsUUID()
  gameServerId: string;
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
  playerId?: string;
  @Min(1)
  amount: number;
}

export class ShopOrderCreateInternalDTO extends ShopOrderCreateDTO<ShopOrderCreateInternalDTO> {
  @IsUUID()
  playerId: string;
  @IsUUID()
  gameServerId: string;
}

export class ShopOrderUpdateDTO extends TakaroDTO<ShopOrderUpdateDTO> {
  @IsEnum(Object.values(ShopOrderStatus))
  status: ShopOrderStatus;
}

export class ShopImportOptions extends TakaroDTO<ShopImportOptions> {
  @IsOptional()
  @IsBoolean()
  replace: boolean;
  @IsOptional()
  @IsBoolean()
  draft: boolean;
  @IsUUID('4')
  gameServerId: string;
}

export class ShopCategoryOutputDTO extends TakaroModelDTO<ShopCategoryOutputDTO> {
  @IsUUID()
  id: string;
  @IsString()
  name: string;
  @IsString()
  emoji: string;
  @IsUUID()
  @IsOptional()
  parentId?: string | null;
  @ValidateNested()
  @Type(() => ShopCategoryOutputDTO)
  @IsOptional()
  parent?: ShopCategoryOutputDTO;
  @ValidateNested({ each: true })
  @Type(() => ShopCategoryOutputDTO)
  @IsOptional()
  children?: ShopCategoryOutputDTO[];
  @ValidateNested({ each: true })
  @Type(() => ShopListingOutputDTO)
  @IsOptional()
  listings?: ShopListingOutputDTO[];
  @IsNumber()
  @IsOptional()
  listingCount?: number;
}

export class ShopCategoryCreateDTO extends TakaroDTO<ShopCategoryCreateDTO> {
  @IsString()
  name: string;
  @IsString()
  emoji: string;
  @IsUUID()
  @IsOptional()
  parentId?: string | null;
}

export class ShopCategoryUpdateDTO extends TakaroDTO<ShopCategoryUpdateDTO> {
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  emoji?: string;
  @IsUUID()
  @IsOptional()
  parentId?: string | null;
}

export class ShopCategoryMoveDTO extends TakaroDTO<ShopCategoryMoveDTO> {
  @IsUUID()
  @IsOptional()
  parentId?: string | null;
}

export class ShopCategoryBulkAssignDTO extends TakaroDTO<ShopCategoryBulkAssignDTO> {
  @IsUUID('4', { each: true })
  listingIds: string[];
  @IsUUID('4', { each: true })
  @IsOptional()
  addCategoryIds?: string[];
  @IsUUID('4', { each: true })
  @IsOptional()
  removeCategoryIds?: string[];
}
