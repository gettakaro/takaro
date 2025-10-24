# Design: Economy Analytics Dashboard

## Layer 1: Problem & Requirements

### Problem Statement

Game server administrators need visibility into their in-game economy health to make data-driven decisions about game balance. According to industry research, achieving game economy balance requires monitoring sink (spend) and source (reward) dynamics of virtual currencies [1]. Currently, Takaro provides shop analytics but lacks comprehensive economy-wide analytics that show currency flows, wealth distribution, and module-specific economic impact.

### Current State

**Existing Systems:**
- Shop analytics at `packages/app-api/src/service/Shop/ShopAnalyticsService.ts` provides revenue, product, and customer metrics
- Currency tracking via `PlayerOnGameserver.currency` field
- Currency events: `CURRENCY_ADDED`, `CURRENCY_DEDUCTED`, `CURRENCY_RESET_ALL` tracked in event system
- Transaction support between players via `transactBetweenPlayers`
- Module attribution via `actingModuleId` in events

**Pain Points:**
- No visibility into overall economy health (inflation/deflation)
- Cannot identify which modules generate vs consume currency
- No wealth distribution analysis to detect imbalances
- Missing player behavior segmentation (earners vs spenders)
- No currency velocity tracking

### Requirements

#### Functional
- REQ-001: The system SHALL display KPI cards showing total currency circulation, net flow, average balance, and active player count
- REQ-002: The system SHALL track and display top currency sources and sinks by module with amounts and percentages
- REQ-003: The system SHALL visualize wealth distribution using adaptive binning that adjusts to server-specific currency ranges [2]
- REQ-004: The system SHALL calculate and display currency velocity as `(totalAdded - totalDeducted) / totalCurrency` (0 when totalCurrency is 0)
- REQ-005: The system SHALL identify top earners and spenders with detailed breakdowns
- REQ-006: The system SHALL support filtering by game server, player(s), source(s), and time period (24h, 7d, 30d, 90d) with multi-select capability
- REQ-007: The system SHALL provide time-series visualization of currency flows
- REQ-008: The system SHALL display CURRENCY_RESET_ALL events as annotations/markers on time-series graphs (not included in metric calculations)
- REQ-009: The system SHALL add optional `source` parameter to currency event DTOs with context-based attribution fallback
- REQ-010: The system SHALL categorize events without source attribution as "uncategorized" (legacy data that will age out)
- REQ-011: The system SHALL allow configurable time-series granularity while maintaining cache effectiveness
- REQ-012: The system SHALL identify "hoarder" players as those with balance in top 25% AND transaction count in bottom 50%

#### Non-Functional
- Performance: Analytics queries must complete within 2 seconds for 90-day periods per industry standards for dashboard responsiveness [3]
- Performance: Use Redis caching with 1-hour TTL following shop analytics pattern at ShopAnalyticsService.ts:173-174
- Performance: Leverage ECharts dirty rectangle rendering for efficient updates [4]
- Security: Require READ_PLAYERS permission for economy analytics access
- Usability: Follow existing shop analytics UX patterns for consistency per gaming analytics best practices [5]
- Usability: Provide clear instructions and tooltips following dashboard design fundamentals [5]

### Constraints

- Each game server has independent currency balancing (different scales)
- Must reuse existing event system and database schema
- Must follow established analytics service patterns from ShopAnalyticsService
- Limited to data available in events table and playerOnGameserver table
- Cannot modify existing event records retroactively

### Success Criteria

1. Administrators can identify economic imbalances within 30 seconds of opening dashboard
2. Top 5 currency sources and sinks are clearly visible with percentages
3. Wealth distribution visualization adapts automatically to server-specific currency scales
4. Page load time under 2 seconds for 30-day period
5. All currency operations have source attribution for accurate tracking

> **Decision**: Removed automated insights feature
> **Rationale**: Keep first version simple and focused on data visualization. Insights can be added in future iteration once we understand what patterns are actually useful to admins.
> **Alternative**: Original design included automated economy health insights with configurable thresholds, not implemented to maintain simplicity.

## Layer 2: Functional Specification

### User Workflows

1. **View Economy Overview**
   - Admin navigates to `/analytics/economy`
   - System loads default 30-day analytics for all servers
   - Dashboard displays: KPI cards, currency flow chart, module sources/sinks, wealth distribution
   - Outcome: Quick assessment of economy health per resource monitoring best practices [1]

2. **Investigate Economy Issue**
   - Admin notices high inflation in KPI card
   - Admin filters to specific game server and 7-day period
   - System shows module breakdown revealing "zombieKill" generating 80% of currency
   - Admin reviews top earners to identify potential exploits
   - Outcome: Root cause identified for balancing adjustment

3. **Compare Time Periods**
   - Admin selects 90-day period to see trends
   - Time series chart shows currency circulation growth
   - Module sources/sinks show shifting patterns
   - Outcome: Long-term economy health assessment

### External Interfaces

**API Endpoint:**
```
GET /analytics/economy?gameServerIds[]=<uuid>&playerIds[]=<uuid>&sources[]=<string>&period=<enum>&granularity=<enum>

Query Parameters:
- gameServerIds: UUID[] (optional, defaults to all servers)
- playerIds: UUID[] (optional, defaults to all players - multi-select for tracking specific players)
- sources: string[] (optional, defaults to all sources - multi-select for comparing specific sources like 'zombieKill', 'shopPurchase')
- period: 'last24Hours' | 'last7Days' | 'last30Days' | 'last90Days'
- granularity: 'hourly' | 'daily' | 'weekly' (optional, affects time series grouping and cache key)

Response: EconomyAnalyticsOutputDTO
{
  kpis: { totalCurrency, netFlow, avgBalance, activePlayerPct, currencyVelocity, ... },
  currencyFlow: { timeSeries, resetEvents, ... },
  modules: { topSources, topSinks, ... },
  wealthDistribution: { segments, percentiles, topPercentageMetrics, ... },
  players: { topEarners, topSpenders, hoarders, ... },
  lastUpdated: ISO8601,
  dateRange: string,
  gameServerIds?: UUID[],
  playerIds?: UUID[],
  sources?: string[]
}
```

**Frontend Route:**
- Path: `/analytics/economy`
- Component follows shop analytics pattern at `packages/web-main/src/routes/_auth/_global/analytics/shop.tsx`

### Alternatives Considered

| Option | Pros | Cons | Why Not Chosen / Future Consideration |
|--------|------|------|----------------|
| Fixed currency brackets (0-100, 100-1k, etc.) | Simple to implement | Breaks for different server scales | User explicitly noted this doesn't work due to server-specific balancing |
| Real-time WebSocket updates | Live data | High server load, complexity | Not needed - 1hr cache refresh sufficient per shop analytics |
| Separate economy events table | Faster queries | Data duplication, migration complexity | Existing events table with indexes performs adequately per shop analytics precedent |
| Client-side aggregation | Reduced server load | Privacy concerns, slow for large datasets | Following server-side pattern from shop analytics [1] |
| Stacked source visualization over time | See contribution of each source in one chart, requested by user | More complex to implement, more data to process | **NICE-TO-HAVE**: Deferred to Phase 4 or future iteration. Current design shows added vs deducted; stacked view would break down by source over time |

## Layer 3: Technical Specification

### Architecture

**Component Flow:**
```
User Request → AnalyticsController → EconomyAnalyticsService → Event/POG Repos → Database
                     ↓
                 Redis Cache (1hr TTL)
                     ↓
              EconomyAnalyticsOutputDTO → Frontend Components → ECharts Visualizations
```

**Data Sources:**
- `events` table: Currency add/deduct/reset events with source field for attribution
- `playerOnGameserver` table: Current currency balances
- Verified meta field structure: `{"type": "currency-added", "amount": 100, "source": "zombieKill"}`

### Analytics Service Architecture Pattern

#### Problem: Code Duplication Across Analytics Services

**Current State:**
- ShopAnalyticsService: 1346 lines at `packages/app-api/src/service/Shop/ShopAnalyticsService.ts`
- Proposed EconomyAnalyticsService: Would be ~1200 lines following same pattern
- Future services (PlayerAnalytics, ModuleAnalytics): Each ~1200 lines

**Duplication Analysis:**
Each analytics service duplicates ~400 lines of identical infrastructure code:
- Redis caching layer (get, set, key generation, TTL management): ~100 lines
- Prometheus metrics setup (4 metric types with labels): ~60 lines
- Period handling (enum → date ranges, previous period calc): ~80 lines
- Query helpers (EXPLAIN ANALYZE, slow query logging, filters): ~100 lines
- Utility methods (percentage changes, granularity logic): ~60 lines

**Projection:**
- 4 analytics services × 400 lines duplication = **1600 lines of duplicated code**
- Testing: Each service duplicates setup logic (~200 lines × 4 = 800 lines)
- **Total waste: ~2400 lines of copy-pasted code**

#### Solution: BaseAnalyticsService Architecture

**Core Concept:**
Abstract base class providing all shared analytics infrastructure. Each service extends the base and implements only domain-specific business logic.

**Base Class Design:**

```typescript
// packages/app-api/src/service/Analytics/BaseAnalyticsService.ts

/**
 * Abstract base class for all analytics services
 * Handles caching, metrics, period calculations, and query utilities
 *
 * Usage:
 *   class ShopAnalyticsService extends BaseAnalyticsService<ShopAnalyticsOutputDTO, ShopAnalyticsFilters> {
 *     constructor(domainId: string) {
 *       super(domainId, 'shop');
 *     }
 *     protected async generateAnalytics(filters, start, end) {
 *       // Shop-specific logic only
 *     }
 *   }
 */
export abstract class BaseAnalyticsService<
  TOutput extends BaseAnalyticsOutputDTO,
  TFilters extends BaseAnalyticsFilters = BaseAnalyticsFilters
> {
  protected readonly log = logger(this.constructor.name);
  protected redisClient: Awaited<ReturnType<typeof Redis.getClient>> | null = null;
  protected readonly CACHE_TTL = 3600; // 1 hour
  protected readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second

  protected readonly metrics: {
    cacheHits: Counter;
    cacheMisses: Counter;
    generationTime: Histogram;
    queryTime: Histogram;
  };

  constructor(
    protected readonly domainId: string,
    private readonly analyticsName: string  // 'shop', 'economy', 'player', 'module'
  ) {
    this.metrics = this.createMetrics(analyticsName);
  }

  // ===== ABSTRACT METHOD - Subclasses MUST implement =====

  /**
   * Generate fresh analytics data for the given filters and date range
   * Subclasses implement domain-specific calculation logic here
   */
  protected abstract generateAnalytics(
    filters: TFilters,
    startDate: string,
    endDate: string
  ): Promise<TOutput>;

  // ===== CONCRETE METHODS - Provided by base class =====

  /**
   * Main entry point - handles full analytics pipeline
   * 1. Calculate date ranges from period
   * 2. Check Redis cache
   * 3. Generate fresh if cache miss
   * 4. Cache result
   * 5. Track metrics
   */
  public async getAnalytics(filters: TFilters): Promise<TOutput> {
    const timer = this.metrics.generationTime.startTimer({
      domain: this.domainId,
      operation: 'getAnalytics',
    });

    try {
      // Calculate date ranges
      const { start, end } = this.calculatePeriodDates(filters.period || 'last30Days');

      // Check cache
      const cacheKey = this.generateCacheKey(filters);
      const cached = await this.getCachedAnalytics(cacheKey);
      if (cached) {
        this.metrics.cacheHits.inc({ domain: this.domainId });
        this.log.debug('Analytics cache hit', { cacheKey });
        return cached;
      }

      // Generate fresh analytics
      this.metrics.cacheMisses.inc({ domain: this.domainId });
      const genTimer = this.metrics.generationTime.startTimer({
        domain: this.domainId,
        operation: 'generateAnalytics',
      });

      const analytics = await this.generateAnalytics(filters, start, end);
      genTimer();

      // Cache result
      await this.cacheAnalytics(cacheKey, analytics);

      return analytics;
    } finally {
      timer();
    }
  }

  /**
   * Generate cache key from filters
   * Base implementation handles common filters
   * Subclasses can override to add service-specific filter dimensions
   */
  protected generateCacheKey(filters: TFilters): string {
    const parts = [
      this.analyticsName,
      'analytics',
      this.domainId,
      filters.gameServerIds?.sort().join(',') || 'all',
      filters.period || 'last30Days',
    ];

    // Optional filter dimensions (economy-specific example)
    if ((filters as any).playerIds?.length) {
      parts.push(`players:${(filters as any).playerIds.sort().join(',')}`);
    }
    if ((filters as any).sources?.length) {
      parts.push(`sources:${(filters as any).sources.sort().join(',')}`);
    }
    if ((filters as any).granularity) {
      parts.push((filters as any).granularity);
    }

    return parts.join(':');
  }

  /**
   * Calculate start/end dates and previous period from period enum
   */
  protected calculatePeriodDates(period: AnalyticsPeriod): {
    start: string;
    end: string;
    previousStart: string;
    previousEnd: string;
    periodLengthDays: number;
  } {
    const end = DateTime.now().toISO();
    let periodDays: number;

    switch (period) {
      case 'last24Hours':
        periodDays = 1;
        break;
      case 'last7Days':
        periodDays = 7;
        break;
      case 'last30Days':
        periodDays = 30;
        break;
      case 'last90Days':
        periodDays = 90;
        break;
      default:
        periodDays = 30;
    }

    const start = DateTime.now().minus({ days: periodDays }).toISO();
    const previousEnd = start;
    const previousStart = DateTime.now().minus({ days: periodDays * 2 }).toISO();

    return { start, end, previousStart, previousEnd, periodLengthDays: periodDays };
  }

  /**
   * Determine time series granularity from period length
   * Can be overridden by explicit granularity filter
   */
  protected getGranularity(
    periodDays: number,
    override?: string
  ): 'hourly' | 'daily' | 'weekly' | 'monthly' {
    if (override) return override as any;

    if (periodDays <= 1) return 'hourly';
    if (periodDays <= 30) return 'daily';
    if (periodDays <= 90) return 'weekly';
    return 'monthly';
  }

  /**
   * Run EXPLAIN ANALYZE on query in development mode
   */
  protected async explainQuery(knex: any, query: any, queryName: string): Promise<void> {
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

  /**
   * Log slow queries with filter context
   */
  protected logSlowQuery(queryName: string, duration: number, filters: TFilters): void {
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      this.log.warn(`Slow query detected in ${queryName}`, {
        duration,
        filters,
        analyticsType: this.analyticsName,
      });
    }
  }

  /**
   * Apply game server filter to Knex query
   * Handles both array and undefined cases
   */
  protected applyGameServerFilter(
    query: any,
    gameServerIds?: string[],
    column = 'gameServerId'
  ): void {
    if (gameServerIds?.length) {
      query.whereIn(column, gameServerIds);
    }
  }

  /**
   * Calculate percentage change between two values
   */
  protected calculateChange(current: number, previous: number): {
    absolute: number;
    percent: number;
  } {
    const absolute = current - previous;
    const percent = previous > 0 ? (absolute / previous) * 100 : 0;
    return { absolute, percent };
  }

  // ===== PRIVATE METHODS - Redis caching =====

  private async getCachedAnalytics(cacheKey: string): Promise<TOutput | null> {
    try {
      if (!this.redisClient) {
        this.redisClient = await Redis.getClient(`${this.analyticsName}-analytics`);
      }
      const cached = await this.redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.log.error('Failed to get cached analytics', error);
      return null;
    }
  }

  private async cacheAnalytics(cacheKey: string, analytics: TOutput): Promise<void> {
    try {
      if (!this.redisClient) {
        this.redisClient = await Redis.getClient(`${this.analyticsName}-analytics`);
      }
      await this.redisClient.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(analytics));
      this.log.debug('Analytics cached successfully', { cacheKey, ttl: this.CACHE_TTL });
    } catch (error) {
      this.log.error('Failed to cache analytics', error);
    }
  }

  private createMetrics(analyticsName: string) {
    const registry = new Registry();
    return {
      cacheHits: new Counter({
        name: `takaro_${analyticsName}_analytics_cache_hits_total`,
        help: `Total cache hits for ${analyticsName} analytics`,
        labelNames: ['domain'],
        registers: [registry],
      }),
      cacheMisses: new Counter({
        name: `takaro_${analyticsName}_analytics_cache_misses_total`,
        help: `Total cache misses for ${analyticsName} analytics`,
        labelNames: ['domain'],
        registers: [registry],
      }),
      generationTime: new Histogram({
        name: `takaro_${analyticsName}_analytics_generation_duration_seconds`,
        help: `Time taken to generate ${analyticsName} analytics`,
        labelNames: ['domain', 'operation'],
        buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        registers: [registry],
      }),
      queryTime: new Histogram({
        name: `takaro_${analyticsName}_analytics_query_duration_seconds`,
        help: `Time taken for database queries in ${analyticsName} analytics`,
        labelNames: ['domain', 'query_type'],
        buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2],
        registers: [registry],
      }),
    };
  }
}

// ===== SHARED TYPES =====

export type AnalyticsPeriod = 'last24Hours' | 'last7Days' | 'last30Days' | 'last90Days';

export interface BaseAnalyticsFilters {
  gameServerIds?: string[];
  period?: AnalyticsPeriod;
}

export abstract class BaseAnalyticsOutputDTO {
  @IsString()
  lastUpdated: string;

  @IsString()
  dateRange: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  gameServerIds?: string[];
}
```

**Service Implementation Pattern:**

```typescript
// packages/app-api/src/service/Analytics/Economy/EconomyAnalyticsService.ts

export interface EconomyAnalyticsFilters extends BaseAnalyticsFilters {
  playerIds?: string[];      // NEW: multi-select player filter
  sources?: string[];         // NEW: multi-select source filter
  granularity?: 'hourly' | 'daily' | 'weekly';  // NEW: time series granularity
}

@traceableClass('service:economyAnalytics')
export class EconomyAnalyticsService extends BaseAnalyticsService<
  EconomyAnalyticsOutputDTO,
  EconomyAnalyticsFilters
> {
  private eventRepo: EventRepo;
  private pogRepo: PlayerOnGameServerRepo;

  constructor(domainId: string) {
    super(domainId, 'economy');  // Base handles metrics setup, cache client, etc.
    this.eventRepo = new EventRepo(domainId);
    this.pogRepo = new PlayerOnGameServerRepo(domainId);
  }

  /**
   * Generate economy analytics - ONLY economy-specific logic
   * Base class handles caching, metrics, period calculation
   */
  protected async generateAnalytics(
    filters: EconomyAnalyticsFilters,
    startDate: string,
    endDate: string
  ): Promise<EconomyAnalyticsOutputDTO> {
    // Parallel calculation of all metrics
    const [kpis, currencyFlow, wealthDistribution, players] = await Promise.all([
      this.calculateKPIs(filters, startDate, endDate),
      this.calculateCurrencyFlow(filters, startDate, endDate),
      this.calculateWealthDistribution(filters),
      this.calculatePlayerMetrics(filters, startDate, endDate),
    ]);

    return new EconomyAnalyticsOutputDTO({
      kpis,
      currencyFlow,
      wealthDistribution,
      players,
      lastUpdated: DateTime.now().toISO()!,
      dateRange: `${startDate} to ${endDate}`,
      gameServerIds: filters.gameServerIds,
      playerIds: filters.playerIds,
      sources: filters.sources,
      granularity: filters.granularity,
    });
  }

  // Economy-specific calculation methods (~500 lines total)
  private async calculateKPIs(filters, start, end) { ... }
  private async calculateCurrencyFlow(filters, start, end) { ... }
  private async calculateWealthDistribution(filters) { ... }
  private async calculatePlayerMetrics(filters, start, end) { ... }
}
```

**Shop Service Refactoring:**

```typescript
// packages/app-api/src/service/Analytics/Shop/ShopAnalyticsService.ts (REFACTORED)

export interface ShopAnalyticsFilters extends BaseAnalyticsFilters {
  // Shop-specific filters can be added here if needed
}

@traceableClass('service:shopAnalytics')
export class ShopAnalyticsService extends BaseAnalyticsService<
  ShopAnalyticsOutputDTO,
  ShopAnalyticsFilters
> {
  private orderRepo: ShopOrderRepo;
  private listingRepo: ShopListingRepo;

  constructor(domainId: string) {
    super(domainId, 'shop');
    this.orderRepo = new ShopOrderRepo(domainId);
    this.listingRepo = new ShopListingRepo(domainId);
  }

  protected async generateAnalytics(
    filters: ShopAnalyticsFilters,
    startDate: string,
    endDate: string
  ): Promise<ShopAnalyticsOutputDTO> {
    // Existing parallel calculation logic
    const [kpis, revenue, products, orders, customers] = await Promise.all([...]);
    const insights = await this.generateInsights({ ... });

    // Existing DTO transformation
    return new ShopAnalyticsOutputDTO({ ... });
  }

  // All existing calculation methods remain unchanged (~700 lines)
  private async calculateKPIs(...) { ... }
  private async calculateRevenue(...) { ... }
  // etc.
}
```

**Code Reduction:**
- ShopAnalyticsService: 1346 lines → ~800 lines (546 lines saved)
- EconomyAnalyticsService: ~1200 lines → ~600 lines (600 lines saved)
- BaseAnalyticsService: ~400 lines (shared across all services)
- **Net savings: 746 lines for 2 services, scales to ~2000 lines for 4 services**

#### Test Harness Architecture

**Problem:**
Analytics integration tests duplicate setup logic across services:
- Creating test environments (domains, servers, players)
- Generating time-series test data
- Cache verification
- Common assertions (percentages sum to 100, time series sorted, etc.)

**Solution:**
Shared test harness base class with service-specific extensions.

```typescript
// packages/app-api/src/__tests__/helpers/AnalyticsTestHarness.ts

/**
 * Base test harness for analytics integration tests
 * Provides data factories, cache helpers, and assertion utilities
 */
export abstract class AnalyticsTestHarness<TSetup extends BaseAnalyticsTestSetup> {
  constructor(protected context: IntegrationTest<TSetup>) {}

  // ===== DATA FACTORIES =====

  /**
   * Generate time-series test data with configurable distribution
   */
  async generateTimeSeriesData(config: {
    type: 'orders' | 'currency' | 'events';
    count: number;
    startDate: Date;
    endDate: Date;
    distribution?: 'uniform' | 'peak-hour' | 'random';
  }): Promise<void> {
    // Creates test data spread across time period
  }

  /**
   * Create test environment (domain, servers, players)
   */
  async createTestEnvironment(config: {
    serverCount?: number;
    playerCount?: number;
  }): Promise<TestEnvironmentData> {
    // Returns { domain, servers[], players[] }
  }

  // ===== CACHE HELPERS =====

  async clearAnalyticsCache(analyticsType: string): Promise<void> {
    const redis = await Redis.getClient(`${analyticsType}-analytics`);
    const keys = await redis.keys(`${analyticsType}:analytics:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async verifyCacheHit(analyticsType: string, expectedKey: string): Promise<boolean> {
    const redis = await Redis.getClient(`${analyticsType}-analytics`);
    const value = await redis.get(expectedKey);
    return value !== null;
  }

  // ===== ASSERTION HELPERS =====

  /**
   * Verify KPI structure has all required fields
   */
  expectKPIStructure(data: any, requiredFields: string[]): void {
    requiredFields.forEach(field => {
      expect(data).to.have.property(field);
      expect(data[field]).to.not.be.undefined;
    });
  }

  /**
   * Verify percentages sum to ~100 (with tolerance)
   */
  expectPercentages(values: number[], tolerance = 1): void {
    const sum = values.reduce((a, b) => a + b, 0);
    expect(sum).to.be.closeTo(100, tolerance);
    values.forEach(v => {
      expect(v).to.be.at.least(0);
      expect(v).to.be.at.most(100);
    });
  }

  /**
   * Verify time series data structure and ordering
   */
  expectTimeSeries(data: any[], config: {
    minLength?: number;
    hasValues?: boolean;
    sortedByDate?: boolean;
  }): void {
    if (config.minLength) {
      expect(data.length).to.be.at.least(config.minLength);
    }
    if (config.hasValues) {
      expect(data.some(d => d.value > 0)).to.be.true;
    }
    if (config.sortedByDate) {
      for (let i = 1; i < data.length; i++) {
        expect(new Date(data[i].date)).to.be.at.least(new Date(data[i-1].date));
      }
    }
  }

  /**
   * Verify growth percentage calculation is correct
   */
  expectGrowthCalculation(current: number, previous: number, growth: number): void {
    const expected = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    expect(growth).to.be.closeTo(expected, 0.01);
  }
}

/**
 * Shop-specific test harness
 */
export class ShopAnalyticsTestHarness extends AnalyticsTestHarness<IShopAnalyticsTestSetup> {
  async createOrders(config: {
    listingId: string;
    count: number;
    status?: ShopOrderStatus;
    timeSpread?: 'all-now' | 'hourly' | 'daily';
  }): Promise<void> {
    // Generate shop orders with time distribution
  }

  expectRevenueMetrics(data: RevenueMetricsDTO): void {
    expect(data).to.have.property('timeSeries');
    expect(data).to.have.property('total');
    expect(data).to.have.property('growth');
    this.expectTimeSeries(data.timeSeries, { hasValues: true, sortedByDate: true });
  }
}

/**
 * Economy-specific test harness
 */
export class EconomyAnalyticsTestHarness extends AnalyticsTestHarness<IEconomyAnalyticsTestSetup> {
  /**
   * Generate currency events with weighted source distribution
   */
  async generateCurrencyEvents(config: {
    playerIds: string[];
    gameServerId: string;
    sources: Array<{ name: string; weight: number }>;  // weights sum to 1.0
    count: number;
  }): Promise<void> {
    for (const source of config.sources) {
      const eventsForSource = Math.floor(config.count * source.weight);
      for (let i = 0; i < eventsForSource; i++) {
        const playerId = config.playerIds[i % config.playerIds.length];
        const amount = Math.floor(Math.random() * 100) + 1;
        await this.context.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
          config.gameServerId,
          playerId,
          { currency: amount, source: source.name }
        );
      }
    }
  }

  /**
   * Verify wealth distribution bins are adaptive and valid
   */
  expectWealthDistribution(data: WealthDistributionDTO, totalPlayers: number): void {
    expect(data).to.have.property('bins');
    expect(data.bins.length).to.be.greaterThan(0);

    // Verify percentile-based bin labels
    const labels = data.bins.map(b => b.label);
    expect(labels).to.include.oneOf(['Bottom 25%', 'Top 1%', '25-50%']);

    // Verify percentages sum to 100
    const percentages = data.bins.map(b => b.percentage);
    this.expectPercentages(percentages);

    // Verify player counts sum to total
    const totalInBins = data.bins.reduce((sum, b) => sum + b.playerCount, 0);
    expect(totalInBins).to.equal(totalPlayers);

    // Verify bins are ordered by min value
    for (let i = 1; i < data.bins.length; i++) {
      expect(data.bins[i].minValue).to.be.at.least(data.bins[i-1].maxValue);
    }
  }

  /**
   * Create CURRENCY_RESET_ALL event for testing annotations
   */
  async generateResetEvent(gameServerId: string, affectedPlayers: number): Promise<void> {
    // Implementation: Create reset event via admin API
  }
}
```

**Test Code Reduction:**
- Shop tests: ~800 lines → ~600 lines (200 saved via harness)
- Economy tests: ~800 lines → ~600 lines (200 saved via harness)
- Shared harness: ~450 lines (data factories, assertions)
- Service-specific harnesses: ~100 lines each
- **Net: 1600 lines → 1250 lines (350 lines saved, 22% reduction)**

#### File Structure

```
packages/app-api/src/
├── service/
│   └── Analytics/                                    (NEW - shared infrastructure)
│       ├── BaseAnalyticsService.ts                   (~400 lines - base class)
│       ├── types.ts                                  (~50 lines - shared types)
│       ├── Shop/
│       │   ├── ShopAnalyticsService.ts              (REFACTORED: 1346 → 800 lines)
│       │   └── dto.ts                                (EXISTING - unchanged)
│       └── Economy/
│           ├── EconomyAnalyticsService.ts            (NEW: ~600 lines vs 1200 without base)
│           └── dto.ts                                (NEW - economy DTOs)
│
└── __tests__/
    └── helpers/
        ├── AnalyticsTestHarness.ts                   (NEW: ~300 lines - base harness)
        ├── ShopAnalyticsTestHarness.ts               (NEW: ~100 lines - shop-specific)
        └── EconomyAnalyticsTestHarness.ts            (NEW: ~150 lines - economy-specific)
```

#### Decision Record

**Decision:** Implement BaseAnalyticsService abstract class pattern for all analytics services

**Context:**
- ShopAnalyticsService is 1346 lines with ~400 lines of reusable infrastructure
- EconomyAnalyticsService would duplicate this infrastructure
- Roadmap includes PlayerAnalytics, ModuleAnalytics (4+ analytics services total)
- Without abstraction: ~5000 lines total, ~1600 lines duplicated
- With abstraction: ~2800 lines total, ~400 lines shared

**Rationale:**
1. **DRY Principle**: 400 lines of identical caching/metrics/period logic shouldn't be copy-pasted
2. **Maintainability**: Bug fixes in base apply to all services automatically
3. **Consistency**: All analytics services have identical caching behavior, metrics, period handling
4. **Testing**: Shared test harness reduces test code duplication by 22%
5. **Future-proofing**: New analytics services = 600 lines (business logic) instead of 1200 lines (logic + boilerplate)

**Alternatives Considered:**

| Alternative | Pros | Cons | Why Not Chosen |
|-------------|------|------|----------------|
| Helper Functions | Simple, no inheritance | Each service calls 10+ helpers, easy to miss one | Too granular, hard to enforce pattern |
| Composition (Service takes CacheManager, MetricsCollector) | Flexible, testable | More boilerplate (inject 4+ dependencies), awkward API | TypeScript inheritance cleaner for this use case |
| Utility Module | No class hierarchy | Static functions lose context (domainId, analyticsName), no polymorphism | Tight coupling between caching/metrics/period logic |
| Keep Duplicating | Zero refactoring | 1600 lines duplicated, bug fixes need 4 PRs, inconsistencies emerge | Unacceptable technical debt |

**Trade-offs:**
- **Pro:** 44% code reduction across analytics services (5000 → 2800 lines)
- **Pro:** Single source of truth for caching, metrics, period logic
- **Pro:** Test harness reduces test duplication by 350 lines
- **Con:** Adds abstraction layer (but only 1 abstract method, minimal complexity)
- **Con:** Services must follow base class contract (but contract is minimal and sensible)

**Future Services:**
With base class in place, adding new analytics is streamlined:

```typescript
// PlayerAnalyticsService - only business logic needed
class PlayerAnalyticsService extends BaseAnalyticsService<
  PlayerAnalyticsOutputDTO,
  PlayerAnalyticsFilters
> {
  constructor(domainId: string) {
    super(domainId, 'player');  // Base handles all infrastructure
  }

  protected async generateAnalytics(filters, start, end) {
    // Only player-specific calculation logic (~500 lines)
  }
}
```

**Estimated effort per new analytics service:**
- Without base: 1200 lines, 7-10 days (400 lines boilerplate + 800 lines business logic)
- With base: 600 lines, 4-5 days (600 lines business logic only)
- **Savings: 40% development time per service**

### Code Change Analysis

| Component | Action | Justification |
|-----------|--------|---------------|
| BaseAnalyticsService | Create | Abstract base class (~400 lines) providing caching, metrics, period handling for all analytics services at packages/app-api/src/service/Analytics/BaseAnalyticsService.ts |
| AnalyticsTestHarness | Create | Shared test utilities (~300 lines) providing data factories, cache helpers, assertions at packages/app-api/src/__tests__/helpers/AnalyticsTestHarness.ts |
| ShopAnalyticsService | Refactor | Extend BaseAnalyticsService to eliminate ~400 lines of duplication (1346 → 800 lines) at packages/app-api/src/service/Analytics/Shop/ShopAnalyticsService.ts |
| EconomyAnalyticsService | Create | Extend BaseAnalyticsService (~600 lines vs 1200 without base) at packages/app-api/src/service/Analytics/Economy/EconomyAnalyticsService.ts |
| Economy DTOs | Create | Following Shop DTO patterns from packages/app-api/src/service/Shop/dto.ts:232-532 at packages/app-api/src/service/Analytics/Economy/dto.ts |
| AnalyticsController | Extend | Add economy endpoint with READ_PLAYERS permission check at packages/app-api/src/controllers/AnalyticsController.ts:40-45 |
| Currency Event DTOs | Extend | Add optional `source` field to TakaroEventCurrencyAdded/Deducted at packages/lib-modules/src/dto/takaroEvents.ts:98-112 (non-breaking: context-based fallback) |
| PlayerOnGameserverService | Extend | Update addCurrency/deductCurrency/transactBetweenPlayers to accept optional source parameter (non-breaking: backward compatible) |
| Module currency operations | Extend | Update all internal modules (economyUtils, dailyRewards, etc.) to explicitly set source when adding/deducting currency (best practice) |
| Shop currency operations | Extend | Update shop purchase flow to set source='shopPurchase' for currency deductions (best practice) |
| Frontend economy route | Create | New route at packages/web-main/src/routes/_auth/_global/analytics/economy.tsx |
| Economy components | Create | Chart components with granularity selector and reset annotations in packages/web-main/src/routes/_auth/_global/analytics/economy/-components/ |

### Code to Remove

None - This is a purely additive feature following established patterns.

### Implementation Approach

#### Components

**1. BaseAnalyticsService** (`packages/app-api/src/service/Analytics/BaseAnalyticsService.ts`)
- See "Analytics Service Architecture Pattern" section for full design
- Provides caching, metrics, period handling, query helpers to all analytics services
- Reduces code duplication from 1600 lines → 400 lines shared across all services

**2. EconomyAnalyticsService** (`packages/app-api/src/service/Analytics/Economy/EconomyAnalyticsService.ts`)
- **Extends BaseAnalyticsService** (inherits caching, metrics, period handling)
- Implements only economy-specific business logic (~600 lines vs 1200 without base)
- Cache key (via base class) includes ALL filter parameters: `economy:${domainId}:${gameServerIds}:${playerIds}:${sources}:${period}:${granularity}`
- Key methods (economy-specific):
  ```
  generateAnalytics(filters, startDate, endDate) → EconomyAnalyticsOutputDTO  (required by base)
  calculateKPIs(filters) → currency metrics with velocity (filtered)
  calculateCurrencyFlow(filters, granularity) → sources, sinks, time series, reset events (filtered)
  calculateWealthDistribution(filters) → adaptive bins, top percentage metrics (filtered)
  calculatePlayerMetrics(filters) → top earners/spenders/hoarders (filtered)
  ```

**3. Adaptive Binning Algorithm** (within EconomyAnalyticsService)
- Use percentile-based binning following Bayesian Blocks approach [6]:
  ```
  Get all player balances for server
  Sort balances
  Calculate percentiles: p0, p25, p50, p75, p90, p95, p99, p100
  Create bins between percentiles
  Count players in each bin
  Label bins: "Bottom 25%", "25-50%", "50-75%", "75-90%", "90-95%", "95-99%", "Top 1%"
  ```
- This adapts to each server's currency scale automatically

**4. Currency Event Source Attribution**
- Source extraction logic in analytics service:
  ```typescript
  function getSource(event): string {
    // 1. Check explicit source field (best case - added by Phase 0 migration)
    if (event.meta?.source) {
      return event.meta.source;
    }

    // 2. Fallback to context-based attribution
    if (event.actingModuleId) {
      // Get module name from moduleId lookup
      return `module:${moduleName}`;
    }

    if (event.userId) {
      // Admin action (user present but no module)
      return 'adminAction';
    }

    if (event.playerId) {
      // Player-initiated action (no module, no admin user)
      return 'playerAction';
    }

    // 3. Last resort for legacy events
    return 'uncategorized';
  }
  ```
- Source values priority:
  - **Explicit sources** (preferred): 'zombieKill', 'dailyReward', 'shopPurchase', 'adminGrant', etc.
  - **Context-based sources** (automatic fallback): 'module:economyUtils', 'adminAction', 'playerAction'
  - **Legacy data**: 'uncategorized' (ages out over 90 days)

> **Decision**: Optional source parameter with context-based fallback attribution
> **Rationale**: Avoids breaking existing API callers while still providing source attribution. Context (actingModuleId, userId, playerId) gives us enough information to categorize events even when source is not explicitly set. This approach is backwards-compatible and gracefully handles the migration period.
> **Migration Strategy**: Phase 0 will add source parameter as optional and update internal currency operations to set it explicitly. External API callers continue working unchanged, with their events attributed via context fallback.

**5. Database Queries**
- Follow shop analytics optimization patterns (indexed queries, date range filters)
- Keep queries simple per feedback - no sampling or complex optimizations in v1
- All queries respect top-level filters (gameServerIds, playerIds, sources)
- Key queries (use existing indexes):
  - Total currency: `SUM(currency) FROM playerOnGameserver WHERE domain AND gameServerId IN (...) AND playerId IN (...)` (playerIds filter optional)
  - Currency events:
    ```sql
    SELECT eventName, meta->>'source' as source, CAST(meta->>'amount' AS INTEGER) as amount, playerId
    FROM events
    WHERE domain AND eventName IN ('currency-added', 'currency-deducted')
      AND createdAt BETWEEN start AND end
      AND (gameServerId IN (...) OR gameServerId IS NULL)  -- gameServerIds filter
      AND (playerId IN (...) OR playerId IS NULL)          -- playerIds filter
      AND (meta->>'source' IN (...) OR meta->>'source' IS NULL)  -- sources filter
    ```
  - Reset events: `SELECT createdAt, CAST(meta->>'affectedPlayerCount' AS INTEGER) FROM events WHERE eventName = 'currency-reset-all' AND createdAt BETWEEN start AND end AND gameServerId IN (...)`
  - Source aggregation: `GROUP BY meta->>'source' to sum amounts and count transactions` (with filters applied)
  - Wealth percentiles: `SELECT percentile_cont(0.25), percentile_cont(0.50), ... FROM playerOnGameserver WHERE domain AND gameServerId IN (...) AND playerId IN (...)` (filters applied)
  - Hoarders: `WHERE currency > p25_balance AND transaction_count < p50_transactions` (with filters applied)

> **Decision**: Keep performance approach simple for v1
> **Rationale**: First version should work correctly before optimizing. No player sampling, no materialized views. Rely on PostgreSQL percentile functions and existing indexes.
> **Future**: Can add query optimization, sampling, or materialized views if performance issues arise in production.

**6. Frontend Components**

- **Top Filter Bar**: Controls that affect all charts below
  - GameServer multi-select dropdown (existing pattern)
  - Player multi-select dropdown (NEW - for tracking specific "sweater" players)
  - Source multi-select dropdown (NEW - for comparing specific sources like 'zombieKill', 'bossArena')
  - Time period selector (24h, 7d, 30d, 90d)
  - Granularity selector (hourly/daily/weekly)
  - All filters trigger new API request and update all charts

- **KPICards**: Total currency, net flow, avg balance, active %, currency velocity (respects top filters)

- **CurrencyFlowChart**: Time series using ECharts line chart with:
  - Two series: added vs deducted (filtered by top bar selections)
  - CURRENCY_RESET_ALL events as vertical line annotations (like Grafana annotations)

- **ModuleImpactChart**: Horizontal bar chart showing top sources (green) and sinks (red) by source field (filtered by top bar)

- **WealthDistributionChart**: Histogram using adaptive bins with percentile labels + top percentage metrics display (filtered by top bar)

- **TopPlayersTable**: Top earners, spenders, and hoarders tabs (filtered by top bar - useful when narrowing to specific sources)

> **Decision**: Top-level filter bar controlling all charts
> **Rationale**: User feedback from Hetjax confirms need to filter by specific players ("sweaters") and sources (custom mods). Addresses use case: "track specific player earning patterns" and "compare specific earning sources".
> **Implementation**: All filter parameters included in cache key. Multi-select dropdowns trigger new API request affecting all visualizations.

#### Data Models

**New DTOs** (in `packages/app-api/src/service/Economy/dto.ts`):

```typescript
export class EconomyKPIMetricsDTO {
  totalCurrency: number
  totalCurrencyChange: number  // vs previous period
  netFlow: number  // added - deducted
  netFlowChange: number
  avgBalance: number
  avgBalanceChange: number
  activePlayerCount: number  // players with transactions
  activePlayerPct: number
  currencyVelocity: number  // netFlow / totalCurrency
}

export class CurrencyFlowMetricsDTO {
  timeSeries: TimeSeriesDataPointDTO[]  // reuse from shop
  resetEvents: CurrencyResetEventDTO[]  // CURRENCY_RESET_ALL events for graph annotations
  totalAdded: number
  totalDeducted: number
  inflationRate: number  // (added - deducted) / deducted * 100
}

export class CurrencyResetEventDTO {
  timestamp: string  // ISO8601
  affectedPlayerCount: number
  label: string  // "Economy Reset"
}

export class ModuleImpactDTO {
  source: string  // from event.meta.source field (e.g., 'zombieKill', 'adminGrant', 'uncategorized')
  type: 'source' | 'sink'
  amount: number
  transactionCount: number
  percentage: number  // of total for type
}

export class WealthDistributionDTO {
  bins: WealthBinDTO[]  // adaptive percentile-based bins
  medianBalance: number
  top1PercentHolds: number  // percentage of total currency
  top10PercentHolds: number
  top25PercentHolds: number
}

> **Decision**: Removed Gini coefficient calculation
> **Rationale**: Top percentage metrics (1%, 10%, 25%) are more intuitive for game admins than academic inequality metrics. Keeps implementation simpler for v1.
> **Alternative**: Gini coefficient (0-1 scale measuring perfect equality to max inequality) can be added in future if needed.

export class WealthBinDTO {
  label: string  // e.g., "Bottom 25%", "Top 1%"
  minValue: number  // actual currency values
  maxValue: number
  playerCount: number
  totalCurrency: number  // sum of currency in this bin
  percentage: number  // of total players
}

export class PlayerEconomyMetricsDTO {
  topEarners: PlayerCurrencyActivityDTO[]
  topSpenders: PlayerCurrencyActivityDTO[]
  hoarders: PlayerCurrencyActivityDTO[]  // balance in top 25% AND transaction count in bottom 50%
}

export class PlayerCurrencyActivityDTO {
  playerId: string
  playerName: string
  amount: number  // earned or spent
  transactionCount: number
  primarySource: string  // top module for this player
  currentBalance: number
}

export class EconomyAnalyticsOutputDTO {
  kpis: EconomyKPIMetricsDTO
  currencyFlow: CurrencyFlowMetricsDTO
  modules: { sources: ModuleImpactDTO[], sinks: ModuleImpactDTO[] }
  wealthDistribution: WealthDistributionDTO
  players: PlayerEconomyMetricsDTO
  lastUpdated: string
  dateRange: string
  gameServerIds?: string[]
  playerIds?: string[]  // Filter applied
  sources?: string[]  // Filter applied
  granularity?: string  // 'hourly' | 'daily' | 'weekly'
}
```

**DTO Extensions:**

Update `TakaroEventCurrencyAdded` and `TakaroEventCurrencyDeducted` in `packages/lib-modules/src/dto/takaroEvents.ts`:
```typescript
export class TakaroEventCurrencyAdded extends BaseEvent<TakaroEventCurrencyAdded> {
  @IsString()
  type = TakaroEvents.CURRENCY_ADDED;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  source?: string;  // OPTIONAL: explicit attribution (e.g., 'zombieKill', 'adminGrant', 'shopPurchase', 'playerTransfer')
                    // If not provided, analytics will derive from context (actingModuleId, userId, playerId)
}

export class TakaroEventCurrencyDeducted extends BaseEvent<TakaroEventCurrencyDeducted> {
  @IsString()
  type = TakaroEvents.CURRENCY_DEDUCTED;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  source?: string;  // OPTIONAL: explicit attribution
                    // If not provided, analytics will derive from context (actingModuleId, userId, playerId)
}
```

> **Decision**: Made `source` parameter optional with context-based fallback
> **Rationale**: Prevents breaking existing API callers. When source is not explicitly provided, analytics service uses context (actingModuleId → module name, userId → adminAction, playerId → playerAction) to attribute the event. This provides complete attribution without forcing all callers to update immediately.
> **Implementation Note**: Meta field is stored as JSON `{"type": "currency-added", "amount": 100, "source": "zombieKill"}` when source is provided. When omitted, analytics queries event context fields for attribution.

#### Security

- Permission check: `READ_PLAYERS` permission required for economy analytics access
- Follow authentication middleware pattern from AnalyticsController.ts:34
- Domain isolation via domainId in all queries per TakaroService pattern
- No PII exposure - player names only (following GDPR-conscious analytics) [7]

> **Decision**: Use READ_PLAYERS permission instead of creating new permission
> **Rationale**: Economy analytics displays player-level data (balances, transactions), which aligns with READ_PLAYERS scope. Avoids permission proliferation and uses existing permission structure.
> **Alternative**: Creating MANAGE_ECONOMY permission was considered but rejected to keep permission model simple for v1.

### Test-Driven Implementation

**Unit Tests** (`packages/app-api/src/service/Economy/__tests__/EconomyAnalyticsService.unit.test.ts`):
- Test adaptive binning algorithm with various currency distributions
- Test source extraction from meta field (including 'uncategorized' fallback)
- Test KPI calculations including currency velocity (with division by zero handling)
- Test caching behavior with different filter combinations (gameServerIds, playerIds, sources, granularity)
- Test hoarder identification logic (top 25% balance AND bottom 50% transactions)
- Test query filtering logic with various filter combinations

**Integration Tests** (`packages/app-api/src/controllers/__tests__/Analytics/EconomyAnalytics.integration.test.ts`):
- Following shop analytics test pattern at ShopAnalytics.integration.test.ts
- Test scenarios:
  - Get economy analytics with no events (empty state)
  - Get analytics with currency add/deduct events from multiple sources
  - Get analytics filtered by game server(s)
  - Get analytics filtered by specific player(s) - validates "sweater tracking" use case
  - Get analytics filtered by specific source(s) - validates custom mod tracking
  - Get analytics with combined filters (gameServer + player + source)
  - Get analytics for different time periods with different granularities
  - Verify percentile-based binning adapts to currency scale
  - Test source attribution from meta.source field
  - Test CURRENCY_RESET_ALL events appear in resetEvents array
  - Verify meta field JSON extraction: `meta->>'source'` and `CAST(meta->>'amount' AS INTEGER)`
  - Verify caching with ALL filter parameters in cache key (different filter combinations = different cache entries)
  - Test permission check (READ_PLAYERS required)

**Frontend Component Tests** (`packages/lib-components/src/components/charts/__tests__/`):
- Snapshot tests for economy chart components
- Test data transformation for ECharts
- Test loading states and empty states

### Rollout Plan

**Phase 0: Source Parameter Migration** (Prerequisite - 2-3 days)
- Add optional `source` field to TakaroEventCurrencyAdded/Deducted DTOs with @IsOptional()
- Update PlayerOnGameserverService.addCurrency/deductCurrency to accept optional source parameter (backward compatible)
- Update PlayerOnGameserverService.transactBetweenPlayers to explicitly set source='playerTransfer'
- Update all internal module currency operations (economyUtils, dailyRewards) to explicitly set appropriate sources
- Update shop purchase flow to explicitly set source='shopPurchase' and source='shopRefund'
- Update command cost deduction to set source='commandCost'
- Implement context-based fallback logic in analytics service (actingModuleId → module name, userId → adminAction, playerId → playerAction)
- Integration tests to verify explicit source is set by internal operations and fallback works for external callers

**Phase 1: Base Infrastructure & Backend Foundation** (Week 1)
- Create BaseAnalyticsService abstract class (~400 lines)
  - Caching layer with Redis (get, set, key generation, TTL)
  - Prometheus metrics (cache hits/misses, generation time, query time)
  - Period handling (enum → date ranges, granularity logic)
  - Query helpers (EXPLAIN ANALYZE, slow query logging, filter application)
- Create AnalyticsTestHarness base class (~300 lines)
  - Data factories (generateTimeSeriesData, createTestEnvironment)
  - Cache helpers (clearAnalyticsCache, verifyCacheHit)
  - Assertion helpers (expectKPIStructure, expectPercentages, expectTimeSeries)
- Create EconomyAnalyticsService extending BaseAnalyticsService (~600 lines)
  - Basic KPI calculations (including currency velocity)
  - Currency event queries with meta field JSON extraction
  - Source extraction logic (with 'uncategorized' fallback)
  - CURRENCY_RESET_ALL event detection for annotations
  - Cache key includes all filter parameters (gameServerIds, playerIds, sources, granularity)
- Create Economy DTOs and controller endpoint with READ_PLAYERS permission

**Phase 2: Analytics Expansion & Shop Refactor** (Week 2)
- Implement adaptive wealth distribution algorithm (percentile-based bins)
- Add module impact calculations by source field
- Implement player metrics (top earners/spenders/hoarders with proper criteria)
- Calculate top percentage wealth metrics (1%, 10%, 25%)
- Comprehensive integration tests including meta field structure verification
- **Refactor ShopAnalyticsService** to extend BaseAnalyticsService (1346 → 800 lines)
  - Replace duplicated caching/metrics/period logic with base class calls
  - Verify all existing shop analytics tests still pass
  - Confirm metrics and caching behavior unchanged

**Phase 3: Frontend** (Week 3)
- Create economy analytics route and page structure
- Build KPI cards component (including currency velocity)
- Implement currency flow time series chart with:
  - Configurable granularity selector (hourly/daily/weekly)
  - CURRENCY_RESET_ALL events as vertical line annotations (Grafana-style)
- Create module impact visualization by source
- Build wealth distribution histogram with top percentage metrics
- Add player tables with tabs (earners/spenders/hoarders) and sorting/filtering

**Phase 4: Polish & Testing** (Week 4)
- Performance testing with simple queries (no optimization unless needed)
- Add tooltips and help text
- Implement responsive design for mobile
- E2E tests for critical user workflows
- Documentation for administrators

**Rollback Strategy:**
- Feature behind route - can be removed from navigation without affecting other analytics
- No database migrations - purely read operations on existing data
- Cache namespace isolation - can clear economy cache independently
- Source parameter is optional and backward compatible - no breaking changes to existing API callers
- Context-based fallback ensures all events have attribution even without explicit source

> **Critical Path**:
> 1. Phase 0 (source parameter migration) must complete before analytics implementation begins. Without source attribution, analytics will only show "uncategorized" data.
> 2. Phase 1 BaseAnalyticsService is foundational - must be solid before building economy or refactoring shop. This base class will be used by 4+ analytics services, so quality is critical.

## References

1. [In-game analysis reports - Dashboard | DevToDev](https://docs.devtodev.com/reports-and-functionality/project-related-reports-and-fuctionality/overview-dashboard/in-game-analysis-reports) - Official Documentation
   - Summary: Covers resource dashboard for monitoring sink (spend) and source (reward) of virtual currencies
   - Key takeaway: Economy balance requires categorizing key resources and visualizing inflows/outflows

2. [Bayesian Blocks for Histograms | AstroML](https://www.astroml.org/examples/algorithms/plot_bayesian_blocks.html) - 2024
   - Summary: Dynamic histogramming method optimizing fitness functions for optimal binning
   - Key takeaway: Adaptive binning adjusts bin widths based on data distribution, solving the fixed-bracket problem

3. [Visualizing and Managing Large Datasets with Apache ECharts | nOps](https://www.nops.io/blog/visualizing-and-managing-large-datasets-with-apache-echarts-and-ag-grid-tables/) - 2024
   - Summary: Performance optimization techniques for ECharts dashboards
   - Key takeaway: Real-time updates under 30ms for millions of data points, sub-1s rendering for 10M+ data

4. [Features - Apache ECharts](https://echarts.apache.org/en/feature.html) - Official Documentation
   - Summary: ECharts 5 dirty rectangle rendering and performance features
   - Key takeaway: Dirty rectangle rendering updates only changed view parts, significantly improving performance

5. [What are key considerations for designing game analytics dashboards? | LinkedIn](https://www.linkedin.com/advice/0/what-key-considerations-designing-game-analytics-dashboards-h4cse) - 2024
   - Summary: Dashboard design fundamentals for game analytics
   - Key takeaway: Define purpose, use simple language, provide tooltips, and use alerts for important changes

6. [Equal-bin-width histogram versus equal-bin-count histogram | PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9041617/) - 2022
   - Summary: Comparison of histogram binning strategies
   - Key takeaway: Equal-bin-count (percentile-based) histograms handle varying distributions better than fixed-width bins

7. [Game Analytics 101: Metrics That Matter for Growth | AppTrove](https://apptrove.com/game-analytics/) - 2024
   - Summary: Privacy-conscious analytics metrics for gaming
   - Key takeaway: Focus on aggregated metrics and avoid unnecessary PII exposure

### Research Summary

**Recommended Patterns Applied:**
- Source/Sink Monitoring from [1]: Categorize sources by explicit source field with percentage breakdowns
- Adaptive Binning from [2][6]: Use percentile-based bins instead of fixed brackets to handle server-specific currency scales
- Dirty Rectangle Rendering from [4]: Leverage ECharts 5 performance optimizations for smooth chart updates
- Dashboard Usability from [5]: Include tooltips and clear labels (insights feature removed for v1 simplicity)
- Graph Annotations: CURRENCY_RESET_ALL events as Grafana-style vertical line markers

**Anti-Patterns Avoided:**
- Fixed Currency Brackets per user feedback: Would break for different server balancing
- Client-Side Aggregation per [1]: Keep sensitive calculations server-side for security and performance
- Real-Time Updates: Not needed - 1hr cache refresh balances freshness and server load
- Gini Coefficient: Removed academic metric in favor of intuitive top percentage metrics
- Automated Insights: Deferred to future iteration to keep v1 simple

**Technologies Considered:**
- ECharts: Already used in project, excellent performance with large datasets per [3][4]
- Redis Caching: Proven pattern from shop analytics (ShopAnalyticsService.ts:173-174)
- Percentile-Based Binning: Industry-standard approach per [6], solves server-specific scaling issue

**Standards Compliance:**
- Performance: Sub-2s dashboard load per [3] industry standards
- Security: Domain isolation and permission checks following established Takaro patterns
- Usability: Tooltip support and clear labeling per [5] gaming dashboard best practices
- Privacy: Aggregate metrics, minimal PII per [7] GDPR-conscious analytics
