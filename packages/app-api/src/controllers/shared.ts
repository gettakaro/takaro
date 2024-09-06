import { IsOptional, IsISO8601, IsNumber } from 'class-validator';

export class RangeFilterCreatedAndUpdatedAt {
  @IsOptional()
  @IsISO8601()
  createdAt!: string;

  @IsOptional()
  @IsISO8601()
  updatedAt!: string;
}

export class PaginationParams {
  @IsOptional()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsNumber()
  limit: number;
}
