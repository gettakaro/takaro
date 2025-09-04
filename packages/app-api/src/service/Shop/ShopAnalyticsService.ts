import { TakaroService } from '../Base.js';
import { TakaroDTO, errors, traceableClass } from '@takaro/util';
import { TakaroModel } from '@takaro/db';
import { PaginatedOutput } from '../../db/base.js';
import { Redis } from '@takaro/db';
import { ShopOrderRepo } from '../../db/shopOrder.js';
import { ShopListingRepo } from '../../db/shopListing.js';
import { DateTime } from 'luxon';
import { Counter, Histogram, Registry } from 'prom-client';
import {
  ShopAnalyticsOutputDTO,
  KPIMetricsDTO,
  RevenueMetricsDTO,
  TimeSeriesDataPointDTO,
  HeatmapDataPointDTO,
  ProductMetricsDTO,
  TopItemDTO,
  CategoryPerformanceDTO,
  DeadStockItemDTO,
  OrderMetricsDTO,
  OrderStatusCountDTO,
  RecentOrderDTO,
  CustomerMetricsDTO,
  CustomerSegmentDTO,
  TopBuyerDTO,
  InsightDTO,
  ShopOrderStatus,
  ShopAnalyticsPeriod,
} from './dto.js';

export interface KPIMetrics {
  revenue: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    sparkline: number[];
  };
  ordersToday: {
    count: number;
    hourlyDistribution: Array<{ hour: number; count: number }>;
    busiestHour: number;
    weeklyAverage: number;
  };
  activeCustomers: {
    total: number;
    new: number;
    returning: number;
    growth: number;
  };
  averageOrderValue: {
    current: number;
    previous: number;
    min: number;
    max: number;
    topItems: Array<{ name: string; contribution: number }>;
  };
}

export interface RevenueMetrics {
  timeSeries: Array<{
    timestamp: number;
    value: number;
    orders: number;
  }>;
  byHour: number[][];
  total: number;
  growth: number;
}

export interface ProductMetrics {
  topSelling: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    percentOfTotal: number;
    lastSold: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    revenue: number;
    orderCount: number;
    percentOfTotal: number;
  }>;
  noSales:
    | Array<{
        id: string;
        name: string;
        daysSinceCreated: number;
      }>
    | number;
  totalCount: number;
}

export interface OrderMetrics {
  statusFlow: {
    paid: number;
    completed: number;
    canceled: number;
  };
  recent: Array<{
    id?: string;
    playerId: string;
    playerName: string;
    itemName: string;
    price: number;
    timestamp: string;
    status?: ShopOrderStatus;
  }>;
  dailyCounts: Array<{ date: string; count: number }>;
}

export interface CustomerMetrics {
  segments: {
    new: number;
    returning: number;
    frequent: number;
  };
  topBuyers: Array<{
    playerId: string;
    name: string;
    totalSpent: number;
    orderCount: number;
    lastPurchase: string;
  }>;
  uniqueCount: number;
  repeatPurchaseRate: number;
}

// Performance metrics
export const shopAnalyticsMetricsRegistry = new Registry();
const analyticsMetrics = {
  cacheHits: new Counter({
    name: 'takaro_shop_analytics_cache_hits_total',
    help: 'Total number of cache hits for shop analytics',
    labelNames: ['domain'],
    registers: [shopAnalyticsMetricsRegistry],
  }),
  cacheMisses: new Counter({
    name: 'takaro_shop_analytics_cache_misses_total',
    help: 'Total number of cache misses for shop analytics',
    labelNames: ['domain'],
    registers: [shopAnalyticsMetricsRegistry],
  }),
  generationTime: new Histogram({
    name: 'takaro_shop_analytics_generation_duration_seconds',
    help: 'Time taken to generate shop analytics',
    labelNames: ['domain', 'operation'],
    buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [shopAnalyticsMetricsRegistry],
  }),
  queryTime: new Histogram({
    name: 'takaro_shop_analytics_query_duration_seconds',
    help: 'Time taken for database queries in shop analytics',
    labelNames: ['domain', 'query_type'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2],
    registers: [shopAnalyticsMetricsRegistry],
  }),
};

@traceableClass('service:shopAnalytics')
export class ShopAnalyticsService extends TakaroService<
  TakaroModel,
  TakaroDTO<void>,
  TakaroDTO<void>,
  TakaroDTO<void>
> {
  private orderRepo: ShopOrderRepo;
  private listingRepo: ShopListingRepo;
  private redisClient: Awaited<ReturnType<typeof Redis.getClient>> | null = null;
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second in milliseconds

  constructor(domainId: string) {
    super(domainId);
    this.orderRepo = new ShopOrderRepo(domainId);
    this.listingRepo = new ShopListingRepo(domainId);
  }

  /**
   * Helper to run EXPLAIN ANALYZE in development mode
   */
  private async explainQuery(knex: any, query: any, queryName: string): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      try {
        const explainResult = await knex.raw(`EXPLAIN ANALYZE ${query.toString()}`);
        this.log.debug(`EXPLAIN ANALYZE for ${queryName}`, {
          query: query.toString(),
          plan: explainResult.rows,
        });
      } catch (err) {
        this.log.warn(`Failed to run EXPLAIN ANALYZE for ${queryName}`, { error: err });
      }
    }
  }

  // Required abstract methods from TakaroService
  get repo() {
    return {} as any;
  }
  find(): Promise<PaginatedOutput<TakaroDTO<void>>> {
    throw new errors.NotImplementedError();
  }
  findOne(): Promise<TakaroDTO<void>> {
    throw new errors.NotImplementedError();
  }
  create(): Promise<TakaroDTO<void>> {
    throw new errors.NotImplementedError();
  }
  update(): Promise<TakaroDTO<void>> {
    throw new errors.NotImplementedError();
  }
  delete(): Promise<string> {
    throw new errors.NotImplementedError();
  }

  /**
   * Main entry point for getting shop analytics
   */
  async getAnalytics(
    gameServerIds?: string[],
    period: ShopAnalyticsPeriod = ShopAnalyticsPeriod.LAST_30_DAYS,
  ): Promise<ShopAnalyticsOutputDTO> {
    const overallTimer = analyticsMetrics.generationTime.startTimer({
      domain: this.domainId,
      operation: 'getAnalytics',
    });

    try {
      // Calculate dates from period
      const end = DateTime.now().toISO();
      let start: string;

      switch (period) {
        case ShopAnalyticsPeriod.LAST_24_HOURS:
          start = DateTime.now().minus({ days: 1 }).toISO();
          break;
        case ShopAnalyticsPeriod.LAST_7_DAYS:
          start = DateTime.now().minus({ days: 7 }).toISO();
          break;
        case ShopAnalyticsPeriod.LAST_30_DAYS:
          start = DateTime.now().minus({ days: 30 }).toISO();
          break;
        case ShopAnalyticsPeriod.LAST_90_DAYS:
          start = DateTime.now().minus({ days: 90 }).toISO();
          break;
        default:
          start = DateTime.now().minus({ days: 30 }).toISO();
      }

      // Try to get from cache first
      const cacheKey = this.generateCacheKey(gameServerIds, period);
      const cached = await this.getCachedAnalytics(cacheKey);
      if (cached) {
        analyticsMetrics.cacheHits.inc({ domain: this.domainId });
        this.log.debug('Analytics cache hit', { cacheKey });
        return cached;
      }

      analyticsMetrics.cacheMisses.inc({ domain: this.domainId });
      this.log.debug('Analytics cache miss, generating fresh data', { cacheKey });

      // Generate fresh analytics with timing
      const generationTimer = analyticsMetrics.generationTime.startTimer({
        domain: this.domainId,
        operation: 'generateAnalytics',
      });

      const analytics = await this.generateAnalytics(gameServerIds, start, end);
      generationTimer();

      // Cache the results
      await this.cacheAnalytics(cacheKey, analytics);

      return analytics;
    } finally {
      overallTimer();
    }
  }

  /**
   * Generate fresh analytics from database
   */
  private async generateAnalytics(
    gameServerIds: string[] | undefined,
    startDate: string,
    endDate: string,
  ): Promise<ShopAnalyticsOutputDTO> {
    const [kpis, revenue, products, orders, customers] = await Promise.all([
      this.calculateKPIs(gameServerIds, startDate, endDate),
      this.calculateRevenue(gameServerIds, startDate, endDate),
      this.calculateProducts(gameServerIds, startDate, endDate),
      this.calculateOrders(gameServerIds, startDate, endDate),
      this.calculateCustomers(gameServerIds, startDate, endDate),
    ]);

    const insights = await this.generateInsights({
      kpis,
      revenue,
      products,
      orders,
      customers,
    });

    // Transform revenue byHour array to heatmap format
    // Note: Frontend expects Monday as index 0, but PostgreSQL DOW gives Sunday as 0
    // So we need to convert: DOW 0 (Sunday) → index 6, DOW 1-6 (Mon-Sat) → index 0-5
    const heatmapData: HeatmapDataPointDTO[] = [];
    revenue.byHour.forEach((dayData, dayIndex) => {
      dayData.forEach((value, hourIndex) => {
        if (value > 0) {
          // Convert from PostgreSQL DOW (0=Sunday) to frontend index (0=Monday)
          const frontendDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
          heatmapData.push(
            new HeatmapDataPointDTO({
              day: frontendDayIndex,
              hour: hourIndex,
              value: value,
            }),
          );
        }
      });
    });

    // Find peak hour and day from heatmap
    let maxValue = 0;
    let peakHour = 0;
    let peakDay = 0;
    revenue.byHour.forEach((dayData, dayIndex) => {
      dayData.forEach((value, hourIndex) => {
        if (value > maxValue) {
          maxValue = value;
          peakHour = hourIndex;
          peakDay = dayIndex;
        }
      });
    });
    // Day names matching PostgreSQL DOW order (0=Sunday, 1=Monday, etc.)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Calculate AOV change
    const aovChange =
      kpis.averageOrderValue.previous > 0
        ? ((kpis.averageOrderValue.current - kpis.averageOrderValue.previous) / kpis.averageOrderValue.previous) * 100
        : 0;

    // Transform order status flow to breakdown with percentages
    const totalOrderStatuses = orders.statusFlow.paid + orders.statusFlow.completed + orders.statusFlow.canceled;
    const statusBreakdown: OrderStatusCountDTO[] = [
      new OrderStatusCountDTO({
        status: ShopOrderStatus.PAID,
        count: orders.statusFlow.paid,
        percentage: totalOrderStatuses > 0 ? (orders.statusFlow.paid / totalOrderStatuses) * 100 : 0,
      }),
      new OrderStatusCountDTO({
        status: ShopOrderStatus.COMPLETED,
        count: orders.statusFlow.completed,
        percentage: totalOrderStatuses > 0 ? (orders.statusFlow.completed / totalOrderStatuses) * 100 : 0,
      }),
      new OrderStatusCountDTO({
        status: ShopOrderStatus.CANCELED,
        count: orders.statusFlow.canceled,
        percentage: totalOrderStatuses > 0 ? (orders.statusFlow.canceled / totalOrderStatuses) * 100 : 0,
      }),
    ];

    // Calculate total orders and completion rate
    const totalOrders = orders.statusFlow.paid + orders.statusFlow.completed + orders.statusFlow.canceled;
    const completionRate = totalOrders > 0 ? (orders.statusFlow.completed / totalOrders) * 100 : 0;

    // Transform customer segments
    const totalSegments = customers.segments.new + customers.segments.returning + customers.segments.frequent;
    const customerSegments: CustomerSegmentDTO[] = [
      new CustomerSegmentDTO({
        name: 'New',
        count: customers.segments.new,
        percentage: totalSegments > 0 ? (customers.segments.new / totalSegments) * 100 : 0,
        color: '#4CAF50',
      }),
      new CustomerSegmentDTO({
        name: 'Returning',
        count: customers.segments.returning,
        percentage: totalSegments > 0 ? (customers.segments.returning / totalSegments) * 100 : 0,
        color: '#2196F3',
      }),
      new CustomerSegmentDTO({
        name: 'Frequent',
        count: customers.segments.frequent,
        percentage: totalSegments > 0 ? (customers.segments.frequent / totalSegments) * 100 : 0,
        color: '#FF9800',
      }),
    ];

    return new ShopAnalyticsOutputDTO({
      kpis: new KPIMetricsDTO({
        totalRevenue: kpis.revenue.current,
        revenueChange: kpis.revenue.changePercent,
        revenueSparkline: kpis.revenue.sparkline,
        ordersToday: kpis.ordersToday.count,
        ordersChange:
          ((kpis.ordersToday.count - kpis.ordersToday.weeklyAverage) / kpis.ordersToday.weeklyAverage) * 100,
        activeCustomers: kpis.activeCustomers.total,
        customersChange: kpis.activeCustomers.growth,
        averageOrderValue: kpis.averageOrderValue.current,
        aovChange: aovChange,
      }),
      revenue: new RevenueMetricsDTO({
        timeSeries: revenue.timeSeries.map(
          (point) =>
            new TimeSeriesDataPointDTO({
              date: new Date(point.timestamp).toISOString(),
              value: point.value,
              comparison: point.orders,
            }),
        ),
        heatmap: heatmapData,
        growth: revenue.growth,
        peakHour: `${peakHour}:00`,
        peakDay: dayNames[peakDay],
      }),
      products: new ProductMetricsDTO({
        topItems: products.topSelling.map(
          (item) =>
            new TopItemDTO({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              revenue: item.revenue,
              percentage: item.percentOfTotal,
            }),
        ),
        categories: products.categories.map(
          (cat) =>
            new CategoryPerformanceDTO({
              name: cat.name || 'Uncategorized',
              revenue: cat.revenue,
              orders: cat.orderCount,
              percentage: cat.percentOfTotal,
            }),
        ),
        deadStock: typeof products.noSales === 'number' ? products.noSales : products.noSales.length,
        deadStockItems:
          typeof products.noSales !== 'number'
            ? products.noSales.map(
                (item) =>
                  new DeadStockItemDTO({
                    id: item.id,
                    name: item.name,
                    daysSinceCreated: item.daysSinceCreated,
                  }),
              )
            : undefined,
        totalProducts: products.totalCount,
      }),
      orders: new OrderMetricsDTO({
        statusBreakdown: statusBreakdown,
        recentOrders: orders.recent.map(
          (order) =>
            new RecentOrderDTO({
              id: order.id || '',
              playerName: order.playerName,
              itemName: order.itemName,
              value: order.price,
              time: order.timestamp,
              status: order.status || ShopOrderStatus.PAID,
            }),
        ),
        totalOrders: totalOrders,
        completionRate: completionRate,
      }),
      customers: new CustomerMetricsDTO({
        segments: customerSegments,
        topBuyers: customers.topBuyers.map(
          (buyer) =>
            new TopBuyerDTO({
              id: buyer.playerId,
              name: buyer.name,
              totalSpent: buyer.totalSpent,
              orderCount: buyer.orderCount,
              lastPurchase: buyer.lastPurchase,
            }),
        ),
        repeatRate: customers.repeatPurchaseRate,
        newCustomers: customers.segments.new,
        totalCustomers: customers.uniqueCount,
      }),
      insights: insights.map((insight) => new InsightDTO(insight)),
      lastUpdated: DateTime.now().toISO()!,
      dateRange: `${startDate} to ${endDate}`,
      gameServerIds: gameServerIds,
    });
  }

  /**
   * Calculate KPI metrics
   */
  private async calculateKPIs(
    gameServerIds: string[] | undefined,
    startDate: string,
    endDate: string,
  ): Promise<KPIMetrics> {
    const queryTimer = analyticsMetrics.queryTime.startTimer({
      domain: this.domainId,
      query_type: 'kpis',
    });
    const queryStartTime = Date.now();

    try {
      const { knex } = await this.orderRepo.getModel();

      // Calculate date ranges
      const currentStart = DateTime.fromISO(startDate);
      const currentEnd = DateTime.fromISO(endDate);
      const periodLength = currentEnd.diff(currentStart, 'days').days;
      const previousStart = currentStart.minus({ days: periodLength });
      const previousEnd = currentStart;

      // Revenue calculations
      // OPTIMIZATION: Uses idx_shoporder_analytics for domain+status filter
      // and idx_shoporder_listing_date for efficient joins
      const revenueQuery = this.getBaseOrderQuery(knex).select(knex.raw('SUM(o.amount * l.price) as total'));

      this.applyGameServerFilter(revenueQuery, gameServerIds);

      const [currentRevenue, previousRevenue] = await Promise.all([
        revenueQuery.clone().whereBetween('o.createdAt', [currentStart.toJSDate(), currentEnd.toJSDate()]).first(),
        revenueQuery.clone().whereBetween('o.createdAt', [previousStart.toJSDate(), previousEnd.toJSDate()]).first(),
      ]);

      const revenueCurrent = Number(currentRevenue?.total || 0);
      const revenuePrevious = Number(previousRevenue?.total || 0);
      const revenueChange = revenueCurrent - revenuePrevious;
      const revenueChangePercent = revenuePrevious > 0 ? (revenueChange / revenuePrevious) * 100 : 0;

      // Generate sparkline for last 7 days
      const sparklineQuery = this.getBaseOrderQuery(knex).whereBetween('o.createdAt', [
        DateTime.now().minus({ days: 7 }).toJSDate(),
        DateTime.now().toJSDate(),
      ]);
      this.applyGameServerFilter(sparklineQuery, gameServerIds);
      const sparklineData = await sparklineQuery
        .select(knex.raw('DATE(o."createdAt") as date'), knex.raw('SUM(o.amount * l.price) as total'))
        .groupBy('date')
        .orderBy('date');

      const sparkline = Array(7).fill(0);
      sparklineData.forEach((row: any) => {
        const dayIndex = DateTime.fromJSDate(row.date).diff(DateTime.now().minus({ days: 7 }), 'days').days;
        if (dayIndex >= 0 && dayIndex < 7) {
          sparkline[Math.floor(dayIndex)] = Number(row.total);
        }
      });

      // Orders today calculations
      const todayStart = DateTime.now().startOf('day');
      const todayEnd = DateTime.now().endOf('day');

      const ordersTodayQuery = this.getBaseOrderQuery(knex)
        .whereBetween('o.createdAt', [todayStart.toJSDate(), todayEnd.toJSDate()])
        .count('o.id as count');
      this.applyGameServerFilter(ordersTodayQuery, gameServerIds);
      const ordersToday = await ordersTodayQuery.first();

      const hourlyDistributionQuery = this.getBaseOrderQuery(knex)
        .whereBetween('o.createdAt', [todayStart.toJSDate(), todayEnd.toJSDate()])
        .select(knex.raw('EXTRACT(HOUR FROM o."createdAt") as hour'), knex.raw('COUNT(*) as count'))
        .groupBy('hour')
        .orderBy('hour');
      this.applyGameServerFilter(hourlyDistributionQuery, gameServerIds);
      const hourlyDistribution = await hourlyDistributionQuery;

      const hourlyData = Array(24)
        .fill(null)
        .map((_, i) => ({ hour: i, count: 0 }));
      hourlyDistribution.forEach((row: any) => {
        hourlyData[row.hour] = { hour: row.hour, count: Number(row.count) };
      });

      const busiestHour = hourlyData.reduce((max, curr) => (curr.count > max.count ? curr : max), hourlyData[0]).hour;

      // Weekly average
      const weeklyOrdersQuery = this.getBaseOrderQuery(knex)
        .whereBetween('o.createdAt', [DateTime.now().minus({ days: 7 }).toJSDate(), DateTime.now().toJSDate()])
        .count('o.id as count');
      this.applyGameServerFilter(weeklyOrdersQuery, gameServerIds);
      const weeklyOrders = await weeklyOrdersQuery.first();

      const weeklyAverage = Math.round(Number(weeklyOrders?.count || 0) / 7);

      // Customer calculations
      const customerStatsQuery = this.getBaseOrderQuery(knex).whereBetween('o.createdAt', [
        currentStart.toJSDate(),
        currentEnd.toJSDate(),
      ]);
      this.applyGameServerFilter(customerStatsQuery, gameServerIds);
      const customerStats = await customerStatsQuery
        .select(
          knex.raw('COUNT(DISTINCT o."playerId") as unique_customers'),
          knex.raw('COUNT(DISTINCT CASE WHEN player_orders.order_count = 1 THEN o."playerId" END) as new_customers'),
          knex.raw(
            'COUNT(DISTINCT CASE WHEN player_orders.order_count > 1 THEN o."playerId" END) as returning_customers',
          ),
        )
        .leftJoin(
          knex('shopOrder')
            .select('playerId')
            .count('id as order_count')
            .where('domain', this.domainId)
            .whereIn('status', ['COMPLETED', 'PAID'])
            .groupBy('playerId')
            .as('player_orders'),
          'o.playerId',
          'player_orders.playerId',
        )
        .first();

      const previousCustomersQuery = this.getBaseOrderQuery(knex).whereBetween('o.createdAt', [
        previousStart.toJSDate(),
        previousEnd.toJSDate(),
      ]);
      this.applyGameServerFilter(previousCustomersQuery, gameServerIds);
      const previousCustomers = await previousCustomersQuery.countDistinct('o.playerId as count').first();

      const totalCustomers = Number(customerStats?.unique_customers || 0);
      const previousCustomerCount = Number(previousCustomers?.count || 0);
      const customerGrowth =
        previousCustomerCount > 0 ? ((totalCustomers - previousCustomerCount) / previousCustomerCount) * 100 : 0;

      // Average order value calculations
      const orderValuesQuery = this.getBaseOrderQuery(knex).whereBetween('o.createdAt', [
        currentStart.toJSDate(),
        currentEnd.toJSDate(),
      ]);
      this.applyGameServerFilter(orderValuesQuery, gameServerIds);
      const orderValues = await orderValuesQuery
        .select(
          knex.raw('AVG(o.amount * l.price) as avg_value'),
          knex.raw('MIN(o.amount * l.price) as min_value'),
          knex.raw('MAX(o.amount * l.price) as max_value'),
        )
        .first();

      const previousAOVQuery = this.getBaseOrderQuery(knex).whereBetween('o.createdAt', [
        previousStart.toJSDate(),
        previousEnd.toJSDate(),
      ]);
      this.applyGameServerFilter(previousAOVQuery, gameServerIds);
      const previousAOV = await previousAOVQuery.avg({ avg: knex.raw('o.amount * l.price') }).first();

      // Top contributing items to AOV
      const topItemsQuery = this.getBaseOrderQuery(knex).whereBetween('o.createdAt', [
        currentStart.toJSDate(),
        currentEnd.toJSDate(),
      ]);
      this.applyGameServerFilter(topItemsQuery, gameServerIds);
      const topItems = await topItemsQuery
        .select('l.name', knex.raw('SUM(o.amount * l.price) as contribution'))
        .groupBy('l.id', 'l.name')
        .orderBy('contribution', 'desc')
        .limit(3);

      return {
        revenue: {
          current: revenueCurrent,
          previous: revenuePrevious,
          change: revenueChange,
          changePercent: revenueChangePercent,
          sparkline,
        },
        ordersToday: {
          count: Number(ordersToday?.count || 0),
          hourlyDistribution: hourlyData,
          busiestHour,
          weeklyAverage,
        },
        activeCustomers: {
          total: totalCustomers,
          new: Number(customerStats?.new_customers || 0),
          returning: Number(customerStats?.returning_customers || 0),
          growth: customerGrowth,
        },
        averageOrderValue: {
          current: Number(orderValues?.avg_value || 0),
          previous: Number(previousAOV?.avg || 0),
          min: Number(orderValues?.min_value || 0),
          max: Number(orderValues?.max_value || 0),
          topItems: topItems.map((item: any) => ({
            name: item.name,
            contribution: Number(item.contribution),
          })),
        },
      };
    } finally {
      queryTimer();
      const queryDuration = Date.now() - queryStartTime;
      if (queryDuration > this.SLOW_QUERY_THRESHOLD) {
        this.log.warn('Slow query detected in calculateKPIs', {
          duration: queryDuration,
          gameServerIds,
          dateRange: { startDate, endDate },
        });
      }
    }
  }

  /**
   * Calculate revenue metrics
   */
  private async calculateRevenue(
    gameServerIds: string[] | undefined,
    startDate: string,
    endDate: string,
  ): Promise<RevenueMetrics> {
    const queryTimer = analyticsMetrics.queryTime.startTimer({
      domain: this.domainId,
      query_type: 'revenue',
    });
    const queryStartTime = Date.now();

    try {
      const { knex } = await this.orderRepo.getModel();

      const currentStart = DateTime.fromISO(startDate);
      const currentEnd = DateTime.fromISO(endDate);
      const periodLength = currentEnd.diff(currentStart, 'days').days;

      // Determine grouping based on period length
      let dateFormat: string;
      if (periodLength <= 7) {
        dateFormat = 'DATE(o."createdAt")';
      } else if (periodLength <= 30) {
        dateFormat = 'DATE(o."createdAt")';
      } else if (periodLength <= 90) {
        dateFormat = `DATE_TRUNC('week', o."createdAt")`;
      } else {
        dateFormat = `DATE_TRUNC('month', o."createdAt")`;
      }

      // Get time series data
      const timeSeriesQuery = this.getBaseOrderQuery(knex)
        .whereBetween('o.createdAt', [currentStart.toJSDate(), currentEnd.toJSDate()])
        .select(
          knex.raw(`${dateFormat} as timestamp`),
          knex.raw('SUM(o.amount * l.price) as value'),
          knex.raw('COUNT(o.id) as orders'),
        )
        .groupBy(knex.raw(dateFormat))
        .orderBy('timestamp');

      this.applyGameServerFilter(timeSeriesQuery, gameServerIds);

      const timeSeriesData = await timeSeriesQuery;

      // Calculate hourly heatmap (7 days x 24 hours)
      const heatmapQuery = this.getBaseOrderQuery(knex)
        .whereBetween('o.createdAt', [currentStart.toJSDate(), currentEnd.toJSDate()])
        .select(
          knex.raw('EXTRACT(DOW FROM o."createdAt") as day_of_week'),
          knex.raw('EXTRACT(HOUR FROM o."createdAt") as hour'),
          knex.raw('SUM(o.amount * l.price) as revenue'),
        )
        .groupBy('day_of_week', 'hour');

      this.applyGameServerFilter(heatmapQuery, gameServerIds);

      const heatmapData = await heatmapQuery;

      // Initialize 7x24 array
      const byHour: number[][] = Array(7)
        .fill(null)
        .map(() => Array(24).fill(0));
      heatmapData.forEach((row: any) => {
        const dayIndex = Number(row.day_of_week);
        const hourIndex = Number(row.hour);
        if (dayIndex >= 0 && dayIndex < 7 && hourIndex >= 0 && hourIndex < 24) {
          byHour[dayIndex][hourIndex] = Number(row.revenue);
        }
      });

      // Calculate total revenue
      const totalQuery = this.getBaseOrderQuery(knex)
        .whereBetween('o.createdAt', [currentStart.toJSDate(), currentEnd.toJSDate()])
        .sum({ total: knex.raw('o.amount * l.price') })
        .first();

      this.applyGameServerFilter(totalQuery, gameServerIds);

      const totalRevenue = await totalQuery;

      // Calculate growth vs previous period
      const previousStart = currentStart.minus({ days: periodLength });
      const previousEnd = currentStart;

      const previousQuery = this.getBaseOrderQuery(knex)
        .whereBetween('o.createdAt', [previousStart.toJSDate(), previousEnd.toJSDate()])
        .sum({ total: knex.raw('o.amount * l.price') })
        .first();

      this.applyGameServerFilter(previousQuery, gameServerIds);

      const previousRevenue = await previousQuery;

      const current = Number(totalRevenue?.total || 0);
      const previous = Number(previousRevenue?.total || 0);
      const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;

      return {
        timeSeries: timeSeriesData.map((row: any) => ({
          timestamp: new Date(row.timestamp).getTime(),
          value: Number(row.value),
          orders: Number(row.orders),
        })),
        byHour,
        total: current,
        growth,
      };
    } finally {
      queryTimer();
      const queryDuration = Date.now() - queryStartTime;
      if (queryDuration > this.SLOW_QUERY_THRESHOLD) {
        this.log.warn('Slow query detected in calculateRevenue', {
          duration: queryDuration,
          gameServerIds,
          dateRange: { startDate, endDate },
        });
      }
    }
  }

  /**
   * Calculate product metrics
   */
  private async calculateProducts(
    gameServerIds: string[] | undefined,
    startDate: string,
    endDate: string,
  ): Promise<ProductMetrics> {
    const { knex } = await this.orderRepo.getModel();

    // Get top selling products
    const topSellingQuery = this.getBaseOrderQuery(knex)
      .whereBetween('o.createdAt', [DateTime.fromISO(startDate).toJSDate(), DateTime.fromISO(endDate).toJSDate()])
      .select(
        'l.id',
        'l.name',
        knex.raw('SUM(o.amount) as quantity'),
        knex.raw('SUM(o.amount * l.price) as revenue'),
        knex.raw('MAX(o."createdAt") as last_sold'),
      )
      .groupBy('l.id', 'l.name')
      .orderBy('revenue', 'desc')
      .limit(10);

    this.applyGameServerFilter(topSellingQuery, gameServerIds);

    const topSelling = await topSellingQuery;

    // Calculate total revenue for percentage calculations
    const totalRevenueQuery = this.getBaseOrderQuery(knex)
      .whereBetween('o.createdAt', [DateTime.fromISO(startDate).toJSDate(), DateTime.fromISO(endDate).toJSDate()])
      .sum({ total: knex.raw('o.amount * l.price') })
      .first();

    this.applyGameServerFilter(totalRevenueQuery, gameServerIds);

    const totalRevenue = Number((await totalRevenueQuery)?.total || 0);

    // Get category performance
    const categoryQuery = this.getBaseOrderQuery(knex)
      .leftJoin('shopListingCategory as slc', 'l.id', 'slc.shopListingId')
      .leftJoin('shopCategory as sc', 'slc.shopCategoryId', 'sc.id')
      .whereBetween('o.createdAt', [DateTime.fromISO(startDate).toJSDate(), DateTime.fromISO(endDate).toJSDate()])
      .select(
        'sc.id',
        'sc.name',
        knex.raw('SUM(o.amount * l.price) as revenue'),
        knex.raw('COUNT(DISTINCT o.id) as order_count'),
      )
      .groupBy('sc.id', 'sc.name')
      .orderBy('revenue', 'desc');

    this.applyGameServerFilter(categoryQuery, gameServerIds);

    const categories = await categoryQuery;

    // Get listings with no sales
    const noSalesQuery = knex('shopListing as l')
      .where('l.domain', this.domainId)
      .whereNull('l.deletedAt')
      .whereNotExists(function () {
        this.select('o.id')
          .from('shopOrder as o')
          .whereRaw('o."listingId" = l.id')
          .whereBetween('o.createdAt', [DateTime.fromISO(startDate).toJSDate(), DateTime.fromISO(endDate).toJSDate()])
          .whereIn('o.status', ['COMPLETED', 'PAID']);
      })
      .select('l.id', 'l.name', knex.raw(`DATE_PART('day', NOW() - l."createdAt") as days_since_created`))
      .orderBy('days_since_created', 'desc')
      .limit(10);

    if (gameServerIds?.length) {
      noSalesQuery.whereIn('l.gameServerId', gameServerIds);
    }

    const noSales = await noSalesQuery;

    // Get total count of products
    const totalCountQuery = knex('shopListing as l')
      .where('l.domain', this.domainId)
      .whereNull('l.deletedAt')
      .count('* as count')
      .first();

    if (gameServerIds?.length) {
      totalCountQuery.whereIn('l.gameServerId', gameServerIds);
    }

    const totalCountResult = await totalCountQuery;
    const totalCount = totalCountResult ? Number((totalCountResult as any).count || 0) : 0;

    return {
      topSelling: topSelling.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: Number(item.quantity),
        revenue: Number(item.revenue),
        percentOfTotal: totalRevenue > 0 ? (Number(item.revenue) / totalRevenue) * 100 : 0,
        lastSold: item.last_sold ? DateTime.fromJSDate(item.last_sold).toISO()! : '',
      })),
      categories: categories
        .filter((cat: any) => cat.id && cat.name)
        .map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          revenue: Number(cat.revenue),
          orderCount: Number(cat.order_count),
          percentOfTotal: totalRevenue > 0 ? (Number(cat.revenue) / totalRevenue) * 100 : 0,
        })),
      noSales: noSales.map((item: any) => ({
        id: item.id,
        name: item.name,
        daysSinceCreated: Number(item.days_since_created),
      })),
      totalCount: totalCount,
    };
  }

  /**
   * Calculate order metrics
   */
  private async calculateOrders(
    gameServerIds: string[] | undefined,
    startDate: string,
    endDate: string,
  ): Promise<OrderMetrics> {
    const { knex } = await this.orderRepo.getModel();

    // Get order status distribution
    const statusQuery = knex('shopOrder as o')
      .join('shopListing as l', 'o.listingId', 'l.id')
      .where('o.domain', this.domainId)
      .whereBetween('o.createdAt', [DateTime.fromISO(startDate).toJSDate(), DateTime.fromISO(endDate).toJSDate()])
      .select('o.status', knex.raw('COUNT(*) as count'))
      .groupBy('o.status');

    this.applyGameServerFilter(statusQuery, gameServerIds);

    const statusData = await statusQuery;

    const statusFlow = {
      paid: 0,
      completed: 0,
      canceled: 0,
    };

    statusData.forEach((row: any) => {
      if (row.status === 'PAID') statusFlow.paid = Number(row.count);
      if (row.status === 'COMPLETED') statusFlow.completed = Number(row.count);
      if (row.status === 'CANCELED') statusFlow.canceled = Number(row.count);
    });

    // Get recent orders
    const recentQuery = this.getBaseOrderQuery(knex)
      .join('players as p', 'o.playerId', 'p.id')
      .select(
        'o.id',
        'o.playerId',
        'p.name as playerName',
        'l.name as itemName',
        knex.raw('o.amount * l.price as price'),
        'o.createdAt as timestamp',
        'o.status',
      )
      .orderBy('o.createdAt', 'desc')
      .limit(10);

    this.applyGameServerFilter(recentQuery, gameServerIds);

    const recent = await recentQuery;

    // Get daily order counts
    const dailyQuery = this.getBaseOrderQuery(knex)
      .whereBetween('o.createdAt', [DateTime.fromISO(startDate).toJSDate(), DateTime.fromISO(endDate).toJSDate()])
      .select(knex.raw('DATE(o."createdAt") as date'), knex.raw('COUNT(*) as count'))
      .groupBy('date')
      .orderBy('date');

    this.applyGameServerFilter(dailyQuery, gameServerIds);

    const dailyCounts = await dailyQuery;

    return {
      statusFlow,
      recent: recent.map((order: any) => ({
        id: order.id,
        playerId: order.playerId,
        playerName: order.playerName,
        itemName: order.itemName,
        price: Number(order.price),
        timestamp: DateTime.fromJSDate(order.timestamp).toISO()!,
        status: order.status as ShopOrderStatus,
      })),
      dailyCounts: dailyCounts.map((day: any) => ({
        date: DateTime.fromJSDate(day.date).toISODate()!,
        count: Number(day.count),
      })),
    };
  }

  /**
   * Calculate customer metrics
   */
  private async calculateCustomers(
    gameServerIds: string[] | undefined,
    startDate: string,
    endDate: string,
  ): Promise<CustomerMetrics> {
    const { knex } = await this.orderRepo.getModel();

    const startDt = DateTime.fromISO(startDate);
    const endDt = DateTime.fromISO(endDate);

    // Look back 6 months from start date to understand customer history
    const historyStartDate = startDt.minus({ months: 6 }).toJSDate();

    // Get all customer orders in current period + 6 months history
    const allCustomerOrdersQuery = this.getBaseOrderQuery(knex)
      .where('o.createdAt', '>=', historyStartDate)
      .where('o.createdAt', '<=', endDt.toJSDate())
      .select('o.playerId', 'o.createdAt', knex.raw('DATE_TRUNC(\'month\', o."createdAt") as order_month'));

    this.applyGameServerFilter(allCustomerOrdersQuery, gameServerIds);

    const allOrders = await allCustomerOrdersQuery;

    // Group orders by customer and month
    const customerPurchasePatterns = new Map<string, Set<string>>();
    const customersInCurrentPeriod = new Set<string>();
    const customersBeforePeriod = new Set<string>();

    allOrders.forEach((order: any) => {
      const playerId = order.playerId;
      const orderDate = DateTime.fromJSDate(order.createdAt);
      const monthKey = order.order_month;

      if (!customerPurchasePatterns.has(playerId)) {
        customerPurchasePatterns.set(playerId, new Set());
      }
      customerPurchasePatterns.get(playerId)!.add(monthKey);

      // Track if customer purchased in current period or before
      if (orderDate >= startDt && orderDate <= endDt) {
        customersInCurrentPeriod.add(playerId);
      } else {
        customersBeforePeriod.add(playerId);
      }
    });

    // Segment customers based on time-based patterns
    const segments = {
      new: 0,
      returning: 0,
      frequent: 0,
    };

    customersInCurrentPeriod.forEach((playerId) => {
      const monthsWithPurchases = customerPurchasePatterns.get(playerId)!;
      const hasHistoryBeforePeriod = customersBeforePeriod.has(playerId);

      // Convert month strings to DateTime for consecutive month checking
      const sortedMonths = Array.from(monthsWithPurchases)
        .map((m) => DateTime.fromJSDate(new Date(m)))
        .sort((a, b) => a.toMillis() - b.toMillis());

      // Check for consecutive months
      let maxConsecutiveMonths = 1;
      let currentConsecutive = 1;

      for (let i = 1; i < sortedMonths.length; i++) {
        const monthDiff = sortedMonths[i].diff(sortedMonths[i - 1], 'months').months;
        if (Math.round(monthDiff) === 1) {
          currentConsecutive++;
          maxConsecutiveMonths = Math.max(maxConsecutiveMonths, currentConsecutive);
        } else {
          currentConsecutive = 1;
        }
      }

      const totalMonthsWithPurchases = monthsWithPurchases.size;

      // Apply time-based segmentation logic
      if (!hasHistoryBeforePeriod) {
        // Customer with no purchase history before current period = NEW
        segments.new++;
      } else if (maxConsecutiveMonths >= 3 || totalMonthsWithPurchases >= 4) {
        // Customer with 3+ consecutive months OR 4+ total months = FREQUENT
        segments.frequent++;
      } else {
        // Customer with history who doesn't qualify as frequent = RETURNING
        segments.returning++;
      }
    });

    const uniqueCount = customersInCurrentPeriod.size;
    const repeatCustomers = Array.from(customersInCurrentPeriod).filter((playerId) =>
      customersBeforePeriod.has(playerId),
    ).length;
    const repeatPurchaseRate = uniqueCount > 0 ? (repeatCustomers / uniqueCount) * 100 : 0;

    // Get top buyers
    const topBuyersQuery = this.getBaseOrderQuery(knex)
      .join('players as p', 'o.playerId', 'p.id')
      .whereBetween('o.createdAt', [DateTime.fromISO(startDate).toJSDate(), DateTime.fromISO(endDate).toJSDate()])
      .select(
        'o.playerId',
        'p.name',
        knex.raw('SUM(o.amount * l.price) as total_spent'),
        knex.raw('COUNT(o.id) as order_count'),
        knex.raw('MAX(o."createdAt") as last_purchase'),
      )
      .groupBy('o.playerId', 'p.name')
      .orderBy('total_spent', 'desc')
      .limit(10);

    if (gameServerIds?.length) {
      topBuyersQuery.whereIn('l.gameServerId', gameServerIds);
    }

    const topBuyers = await topBuyersQuery;

    return {
      segments,
      topBuyers: topBuyers.map((buyer: any) => ({
        playerId: buyer.playerId,
        name: buyer.name,
        totalSpent: Number(buyer.total_spent),
        orderCount: Number(buyer.order_count),
        lastPurchase: DateTime.fromJSDate(buyer.last_purchase).toISO()!,
      })),
      uniqueCount,
      repeatPurchaseRate,
    };
  }

  /**
   * Generate insights from analytics data
   */
  private async generateInsights(data: {
    kpis: KPIMetrics;
    revenue: RevenueMetrics;
    products: ProductMetrics;
    orders: OrderMetrics;
    customers: CustomerMetrics;
  }): Promise<Array<{ type: string; title: string; description: string; value?: string; icon: string }>> {
    const insights: Array<{ type: string; title: string; description: string; value?: string; icon: string }> = [];

    // Revenue insights
    if (data.revenue.growth > 20) {
      insights.push({
        type: 'success',
        title: 'Revenue Growth',
        description: `Revenue up ${data.revenue.growth.toFixed(1)}% compared to previous period`,
        value: `${data.revenue.growth.toFixed(1)}%`,
        icon: 'TrendingUp',
      });
    } else if (data.revenue.growth < -10) {
      insights.push({
        type: 'warning',
        title: 'Revenue Decline',
        description: `Revenue down ${Math.abs(data.revenue.growth).toFixed(1)}% compared to previous period`,
        value: `${data.revenue.growth.toFixed(1)}%`,
        icon: 'TrendingDown',
      });
    }

    // Best selling product
    if (data.products.topSelling.length > 0) {
      const topProduct = data.products.topSelling[0];
      insights.push({
        type: 'info',
        title: 'Best Seller',
        description: `${topProduct.name} with ${topProduct.quantity} sales`,
        value: topProduct.revenue.toString(),
        icon: 'Trophy',
      });
    }

    // Products with no sales
    const noSalesCount =
      typeof data.products.noSales === 'number' ? data.products.noSales : data.products.noSales.length;
    if (noSalesCount > 0) {
      insights.push({
        type: 'warning',
        title: 'Slow Moving Stock',
        description: `${noSalesCount} listings have not sold recently`,
        value: noSalesCount.toString(),
        icon: 'AlertTriangle',
      });
    }

    // Peak sales hour
    if (data.kpis.ordersToday.busiestHour !== undefined) {
      const hour = data.kpis.ordersToday.busiestHour;
      insights.push({
        type: 'info',
        title: 'Peak Sales Hour',
        description: `Peak sales typically occur around ${hour}:00`,
        value: `${hour}:00`,
        icon: 'Clock',
      });
    }

    // Customer insights
    if (data.customers.segments.new > 0) {
      const repeatRate = data.customers.repeatPurchaseRate;
      insights.push({
        type: 'info',
        title: 'Customer Retention',
        description: `${data.customers.segments.new} new customers - ${repeatRate.toFixed(1)}% became repeat buyers`,
        value: `${repeatRate.toFixed(1)}%`,
        icon: 'Users',
      });
    }

    // Order completion rate
    const totalOrders =
      data.orders.statusFlow.paid + data.orders.statusFlow.completed + data.orders.statusFlow.canceled;
    if (totalOrders > 0) {
      const completionRate = ((data.orders.statusFlow.completed / totalOrders) * 100).toFixed(1);
      if (Number(completionRate) < 80) {
        insights.push({
          type: 'warning',
          title: 'Low Completion Rate',
          description: `Order completion rate is ${completionRate}% - consider investigating unclaimed orders`,
          value: `${completionRate}%`,
          icon: 'AlertCircle',
        });
      }
    }

    // Average order value trend
    if (data.kpis.averageOrderValue.current > data.kpis.averageOrderValue.previous) {
      const increase = (
        ((data.kpis.averageOrderValue.current - data.kpis.averageOrderValue.previous) /
          data.kpis.averageOrderValue.previous) *
        100
      ).toFixed(1);
      insights.push({
        type: 'success',
        title: 'AOV Increase',
        description: `Average order value increased by ${increase}%`,
        value: `${increase}%`,
        icon: 'DollarSign',
      });
    }

    return insights;
  }

  /**
   * Generate cache key from parameters
   */
  private generateCacheKey(gameServerIds: string[] | undefined, period: ShopAnalyticsPeriod): string {
    const serverKey = gameServerIds ? gameServerIds.sort().join(',') : 'all';
    return `shop:analytics:${this.domainId}:${serverKey}:${period}`;
  }

  /**
   * Get analytics from cache
   */
  private async getCachedAnalytics(cacheKey: string): Promise<ShopAnalyticsOutputDTO | null> {
    try {
      if (!this.redisClient) {
        this.redisClient = await Redis.getClient('shop-analytics');
      }

      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      this.log.error('Failed to get cached analytics', error);
    }
    return null;
  }

  /**
   * Cache analytics results
   */
  private async cacheAnalytics(cacheKey: string, analytics: ShopAnalyticsOutputDTO): Promise<void> {
    try {
      if (!this.redisClient) {
        this.redisClient = await Redis.getClient('shop-analytics');
      }

      await this.redisClient.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(analytics));
      this.log.debug('Analytics cached successfully', { cacheKey, ttl: this.CACHE_TTL });
    } catch (error) {
      this.log.error('Failed to cache analytics', error);
      // Don't throw - caching is optional
    }
  }

  /**
   * Get base query for shop orders with common joins and filters
   */
  private getBaseOrderQuery(knex: any) {
    return knex('shopOrder as o')
      .join('shopListing as l', 'o.listingId', 'l.id')
      .where('o.domain', this.domainId)
      .whereIn('o.status', ['COMPLETED', 'PAID']);
  }

  /**
   * Apply game server filter to a query if gameServerIds are provided
   */
  private applyGameServerFilter(query: any, gameServerIds?: string[]) {
    if (gameServerIds?.length) {
      query.whereIn('l.gameServerId', gameServerIds);
    }
    return query;
  }
}
