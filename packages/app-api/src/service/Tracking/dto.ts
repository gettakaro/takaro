import { IsUUID, IsNumber, IsISO8601, IsOptional, IsString } from 'class-validator';
import { TakaroDTO, TakaroModelDTO } from '@takaro/util';

export class PlayerLocationOutputDTO extends TakaroModelDTO<PlayerLocationOutputDTO> {
  @IsUUID('4')
  id: string;
  @IsUUID('4')
  playerId: string;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  x: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  y: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  z: number;
  @IsISO8601()
  createdAt: string;
}

export class PlayerMovementHistoryInputDTO extends TakaroDTO<PlayerMovementHistoryInputDTO> {
  @IsUUID('4', { each: true })
  @IsOptional()
  playerId?: string[];
  @IsISO8601()
  @IsOptional()
  startDate?: string;
  @IsISO8601()
  @IsOptional()
  endDate?: string;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsOptional()
  limit?: number;
}

export class BoundingBoxSearchInputDTO extends TakaroDTO<BoundingBoxSearchInputDTO> {
  @IsNumber({ allowNaN: false, allowInfinity: false })
  minX: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  maxX: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  minY: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  maxY: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  minZ: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  maxZ: number;
  @IsISO8601()
  @IsOptional()
  startDate?: string;
  @IsISO8601()
  @IsOptional()
  endDate?: string;
  @IsUUID('4')
  gameserverId: string;
}

export class RadiusSearchInputDTO extends TakaroDTO<RadiusSearchInputDTO> {
  @IsNumber({ allowNaN: false, allowInfinity: false })
  x: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  y: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  z: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  radius: number;
  @IsISO8601()
  @IsOptional()
  startDate?: string;
  @IsISO8601()
  @IsOptional()
  endDate?: string;
  @IsUUID('4')
  gameserverId: string;
}

export class PlayerInventoryOutputDTO extends TakaroModelDTO<PlayerInventoryOutputDTO> {
  @IsUUID('4')
  playerId: string;
  @IsUUID('4')
  itemId: string;
  @IsString()
  itemName: string;
  @IsString()
  itemCode: string;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  quantity: number;
  @IsString()
  @IsOptional()
  quality?: string;
  @IsISO8601()
  createdAt: string;
}

export class PlayerInventoryHistoryInputDTO extends TakaroDTO<PlayerInventoryHistoryInputDTO> {
  @IsUUID('4')
  playerId: string;
  @IsISO8601()
  startDate: string;
  @IsISO8601()
  endDate: string;
}

export class PlayersByItemInputDTO extends TakaroDTO<PlayersByItemInputDTO> {
  @IsUUID('4')
  itemId: string;
  @IsISO8601()
  @IsOptional()
  startDate?: string;
  @IsISO8601()
  @IsOptional()
  endDate?: string;
}

export class PlayerItemHistoryOutputDTO extends TakaroModelDTO<PlayerItemHistoryOutputDTO> {
  @IsUUID('4')
  playerId: string;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  quantity: number;
  @IsISO8601()
  createdAt: string;
}
