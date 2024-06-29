import { IsUUID, IsOptional, IsNumber, IsString, IsEnum, ValidateNested } from 'class-validator';
import { TakaroModelDTO, TakaroDTO } from '@takaro/util';
import { Type } from 'class-transformer';
import { ItemsOutputDTO } from '../ItemsService.js';

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
  @ValidateNested()
  @Type(() => ItemsOutputDTO)
  item?: ItemsOutputDTO;
}

export class ShopListingCreateDTO<T = void> extends TakaroDTO<T> {
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
}

export class ShopOrderCreateDTO<T = void> extends TakaroDTO<T> {
  @IsUUID()
  listingId: string;
  @IsNumber()
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
