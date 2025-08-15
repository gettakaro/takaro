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
  IsArray,
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

// Analytics DTOs
export class ShopAnalyticsInputDTO extends TakaroDTO<ShopAnalyticsInputDTO> {
  @IsUUID('4', { each: true })
  @IsOptional()
  gameServerIds?: string[];

  @IsISO8601()
  @IsOptional()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  endDate?: string;
}

export class KPIMetricsDTO extends TakaroDTO<KPIMetricsDTO> {
  @IsNumber()
  totalRevenue: number;

  @IsNumber()
  revenueChange: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  revenueSparkline?: number[];

  @IsNumber()
  ordersToday: number;

  @IsNumber()
  ordersChange: number;

  @IsNumber()
  activeCustomers: number;

  @IsNumber()
  customersChange: number;

  @IsNumber()
  averageOrderValue: number;

  @IsNumber()
  aovChange: number;
}

export class RevenueMetricsDTO extends TakaroDTO<RevenueMetricsDTO> {
  @ValidateNested({ each: true })
  @Type(() => TimeSeriesDataPointDTO)
  timeSeries: TimeSeriesDataPointDTO[];

  @ValidateNested({ each: true })
  @Type(() => HeatmapDataPointDTO)
  heatmap: HeatmapDataPointDTO[];

  @IsNumber()
  growth: number;

  @IsString()
  peakHour: string;

  @IsString()
  peakDay: string;
}

export class TimeSeriesDataPointDTO extends TakaroDTO<TimeSeriesDataPointDTO> {
  @IsString()
  date: string;

  @IsNumber()
  value: number;

  @IsNumber()
  @IsOptional()
  comparison?: number;
}

export class HeatmapDataPointDTO extends TakaroDTO<HeatmapDataPointDTO> {
  @IsNumber()
  day: number;

  @IsNumber()
  hour: number;

  @IsNumber()
  value: number;
}

export class ProductMetricsDTO extends TakaroDTO<ProductMetricsDTO> {
  @ValidateNested({ each: true })
  @Type(() => TopItemDTO)
  topItems: TopItemDTO[];

  @ValidateNested({ each: true })
  @Type(() => CategoryPerformanceDTO)
  categories: CategoryPerformanceDTO[];

  @IsNumber()
  deadStock: number;

  @IsNumber()
  totalProducts: number;
}

export class TopItemDTO extends TakaroDTO<TopItemDTO> {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  revenue: number;

  @IsNumber()
  percentage: number;
}

export class CategoryPerformanceDTO extends TakaroDTO<CategoryPerformanceDTO> {
  @IsString()
  name: string;

  @IsNumber()
  revenue: number;

  @IsNumber()
  orders: number;

  @IsNumber()
  percentage: number;
}

export class OrderMetricsDTO extends TakaroDTO<OrderMetricsDTO> {
  @ValidateNested({ each: true })
  @Type(() => OrderStatusCountDTO)
  statusBreakdown: OrderStatusCountDTO[];

  @ValidateNested({ each: true })
  @Type(() => RecentOrderDTO)
  recentOrders: RecentOrderDTO[];

  @IsNumber()
  totalOrders: number;

  @IsNumber()
  completionRate: number;
}

export class OrderStatusCountDTO extends TakaroDTO<OrderStatusCountDTO> {
  @IsEnum(ShopOrderStatus)
  status: ShopOrderStatus;

  @IsNumber()
  count: number;

  @IsNumber()
  percentage: number;
}

export class RecentOrderDTO extends TakaroDTO<RecentOrderDTO> {
  @IsString()
  id: string;

  @IsString()
  playerName: string;

  @IsString()
  itemName: string;

  @IsNumber()
  value: number;

  @IsString()
  time: string;

  @IsEnum(ShopOrderStatus)
  status: ShopOrderStatus;
}

export class CustomerMetricsDTO extends TakaroDTO<CustomerMetricsDTO> {
  @ValidateNested({ each: true })
  @Type(() => CustomerSegmentDTO)
  segments: CustomerSegmentDTO[];

  @ValidateNested({ each: true })
  @Type(() => TopBuyerDTO)
  topBuyers: TopBuyerDTO[];

  @IsNumber()
  repeatRate: number;

  @IsNumber()
  newCustomers: number;

  @IsNumber()
  totalCustomers: number;
}

export class CustomerSegmentDTO extends TakaroDTO<CustomerSegmentDTO> {
  @IsString()
  name: string;

  @IsNumber()
  count: number;

  @IsNumber()
  percentage: number;

  @IsString()
  color: string;
}

export class TopBuyerDTO extends TakaroDTO<TopBuyerDTO> {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  totalSpent: number;

  @IsNumber()
  orderCount: number;

  @IsString()
  lastPurchase: string;
}

export class InsightDTO extends TakaroDTO<InsightDTO> {
  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  icon: string;
}

export class ShopAnalyticsOutputDTO extends TakaroDTO<ShopAnalyticsOutputDTO> {
  @ValidateNested()
  @Type(() => KPIMetricsDTO)
  kpis: KPIMetricsDTO;

  @ValidateNested()
  @Type(() => RevenueMetricsDTO)
  revenue: RevenueMetricsDTO;

  @ValidateNested()
  @Type(() => ProductMetricsDTO)
  products: ProductMetricsDTO;

  @ValidateNested()
  @Type(() => OrderMetricsDTO)
  orders: OrderMetricsDTO;

  @ValidateNested()
  @Type(() => CustomerMetricsDTO)
  customers: CustomerMetricsDTO;

  @ValidateNested({ each: true })
  @Type(() => InsightDTO)
  insights: InsightDTO[];

  @IsString()
  lastUpdated: string;

  @IsString()
  dateRange: string;

  @IsString({ each: true })
  @IsOptional()
  gameServerIds?: string[];
}
