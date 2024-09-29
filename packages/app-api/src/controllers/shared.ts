import { IsOptional, IsISO8601, IsNumber, IsUUID } from 'class-validator';

export class RangeFilterCreatedAndUpdatedAt {
  [key: string]: string | number | undefined;

  @IsOptional()
  @IsISO8601()
  createdAt?: string | undefined;

  @IsOptional()
  @IsISO8601()
  updatedAt?: string | undefined;
}

export class PaginationParams {
  @IsOptional()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsNumber()
  limit: number;
}

export class AllowedFilters {
  [key: string]: unknown[] | string[] | boolean | null | undefined;

  @IsOptional()
  @IsUUID(4, { each: true })
  id?: string[] | undefined;
}
