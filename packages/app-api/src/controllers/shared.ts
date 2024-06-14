import { IsOptional, IsISO8601 } from 'class-validator';

export class RangeFilterCreatedAndUpdatedAt {
  @IsOptional()
  @IsISO8601()
  createdAt!: string;

  @IsOptional()
  @IsISO8601()
  updatedAt!: string;
}
