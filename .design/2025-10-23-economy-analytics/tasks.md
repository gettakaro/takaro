# Implementation Tasks: Economy Analytics Dashboard

## Overview

Building a comprehensive economy analytics system with proper base class architecture to eliminate code duplication across analytics services. The approach creates a shared foundation (BaseAnalyticsService) that will be used by Economy, Shop, and future analytics services (Player, Module).

**Key Architecture Decision**: Instead of duplicating ~400 lines of caching/metrics/period logic across services, we create a base class that reduces each service from ~1200 lines to ~600 lines.

**Phases**: 7 phases total
1. **Phase 0**: Source parameter prerequisite (all currency operations must have source attribution)
2. **Phase 1**: Base analytics infrastructure (foundation for all analytics)
3. **Phase 2**: Economy service implementation
4. **Phase 3**: Shop service refactor (prove base class works)
5. **Phase 4**: Economy expansion (wealth distribution, player metrics)
6. **Phase 5**: Frontend implementation
7. **Phase 6**: Polish and testing

---

## Phase 0: Currency Source Parameter Migration
**Goal**: Add mandatory source attribution to all currency operations so analytics can categorize sources
**Demo**: "At standup, I can show: Every currency event now has a source field (zombieKill, shopPurchase, etc.) and legacy data shows as 'uncategorized'"

### Tasks

- [ ] Task 0.1: Extend currency event DTOs with mandatory source field
  - **Output**: TakaroEventCurrencyAdded and TakaroEventCurrencyDeducted have required source field
  - **Files**:
    - `packages/lib-modules/src/dto/takaroEvents.ts`
  - **Changes**:
    ```typescript
    export class TakaroEventCurrencyAdded extends BaseEvent<TakaroEventCurrencyAdded> {
      @IsString()
      type = TakaroEvents.CURRENCY_ADDED;

      @IsNumber()
      amount: number;

      @IsString()
      source: string;  // NEW: Mandatory source attribution
    }
    ```
  - **Verify**: TypeScript compilation passes

- [ ] Task 0.2: Update PlayerOnGameserverService currency methods to require source
  - **Depends on**: 0.1
  - **Output**: addCurrency, deductCurrency, transactBetweenPlayers methods require source parameter
  - **Files**:
    - `packages/app-api/src/service/PlayerOnGameserverService.ts`
  - **Changes**:
    - `addCurrency(amount, options: { source: string })` - source is required
    - `deductCurrency(amount, options: { source: string })` - source is required
    - `transactBetweenPlayers()` - sets source='playerTransfer'
  - **Verify**: All existing calls to these methods fail compilation (expected)

- [ ] Task 0.3: Update all module currency operations to set source
  - **Depends on**: 0.2
  - **Output**: economyUtils, dailyRewards, and other modules set appropriate source values
  - **Files**:
    - `packages/lib-modules/src/**/index.ts` (all modules doing currency operations)
  - **Changes**: Each module sets descriptive source when calling addCurrency/deductCurrency
    - Example: `await pog.addCurrency(100, { source: 'zombieKill' })`
    - Example: `await pog.addCurrency(50, { source: 'dailyReward' })`
  - **Verify**: Grep for `addCurrency` and `deductCurrency` - all calls have source parameter

- [ ] Task 0.4: Update shop purchase flow to set source='shopPurchase'
  - **Depends on**: 0.2
  - **Output**: Shop purchases deduct currency with source attribution
  - **Files**:
    - `packages/app-api/src/service/Shop/ShopOrderService.ts` (or wherever shop deducts currency)
  - **Changes**: Set source='shopPurchase' when processing orders
  - **Verify**: Shop order flow still works, events have source field

- [ ] Task 0.5: Add integration test verifying source parameter is always set
  - **Depends on**: 0.3, 0.4
  - **Output**: Test that verifies all currency events have source field
  - **Files**:
    - `packages/app-api/src/__tests__/CurrencySourceAttribution.integration.test.ts` (new file)
  - **Test scenarios**:
    - Module operations have source
    - Admin operations have source
    - Player transfers have source='playerTransfer'
    - Shop purchases have source='shopPurchase'
  - **Verify**: `npm run test:integration` passes

### Phase 0 Checkpoint
- [ ] Run lint: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Run tests: `npm test`
- [ ] Manual verification: Create currency event via API, check event.meta.source exists
- [ ] **Demo ready**: Query events table, show all new currency events have source field

---

## Phase 1: Base Analytics Infrastructure
**Goal**: Create BaseAnalyticsService and test harness that will be shared by all analytics services
**Demo**: "At standup, I can show: A working base class with caching, metrics, period handling that passes comprehensive tests"

### Tasks

- [ ] Task 1.1: Create shared analytics types
  - **Output**: Base types and interfaces for all analytics services
  - **Files**:
    - `packages/app-api/src/service/Analytics/types.ts` (new file)
  - **Content**:
    ```typescript
    export type AnalyticsPeriod = 'last24Hours' | 'last7Days' | 'last30Days' | 'last90Days';

    export interface BaseAnalyticsFilters {
      gameServerIds?: string[];
      period?: AnalyticsPeriod;
    }

    export abstract class BaseAnalyticsOutputDTO {
      @IsString() lastUpdated: string;
      @IsString() dateRange: string;
      @IsArray() @IsUUID('4', { each: true }) @IsOptional() gameServerIds?: string[];
    }
    ```
  - **Verify**: TypeScript compilation passes

- [ ] Task 1.2: Create BaseAnalyticsService abstract class (part 1: structure)
  - **Depends on**: 1.1
  - **Output**: Base class skeleton with abstract method and constructor
  - **Files**:
    - `packages/app-api/src/service/Analytics/BaseAnalyticsService.ts` (new file)
  - **Content**: Class structure with:
    - Generic types: `<TOutput extends BaseAnalyticsOutputDTO, TFilters extends BaseAnalyticsFilters>`
    - Constructor taking `domainId` and `analyticsName`
    - Abstract method: `protected abstract generateAnalytics(filters, startDate, endDate): Promise<TOutput>`
    - Protected properties: `log`, `redisClient`, `CACHE_TTL`, `SLOW_QUERY_THRESHOLD`
  - **Verify**: TypeScript compilation passes

- [ ] Task 1.3: Add metrics creation to BaseAnalyticsService
  - **Depends on**: 1.2
  - **Output**: Prometheus metrics (cache hits, misses, generation time, query time)
  - **Files**:
    - `packages/app-api/src/service/Analytics/BaseAnalyticsService.ts`
  - **Content**: Private `createMetrics()` method that sets up 4 metric types with service-specific labels
  - **Verify**: Metrics registry is created on instantiation

- [ ] Task 1.4: Add period calculation logic to BaseAnalyticsService
  - **Depends on**: 1.2
  - **Output**: `calculatePeriodDates()` method converting period enum to date ranges
  - **Files**:
    - `packages/app-api/src/service/Analytics/BaseAnalyticsService.ts`
  - **Content**: Method returning `{ start, end, previousStart, previousEnd, periodLengthDays }`
  - **Test cases**:
    - last24Hours → 1 day period
    - last7Days → 7 day period
    - last30Days → 30 day period
    - last90Days → 90 day period
  - **Verify**: Unit test for period calculations

- [ ] Task 1.5: Add cache key generation to BaseAnalyticsService
  - **Depends on**: 1.2
  - **Output**: `generateCacheKey()` method building Redis key from filters
  - **Files**:
    - `packages/app-api/src/service/Analytics/BaseAnalyticsService.ts`
  - **Content**: Method building key from analyticsName, domainId, gameServerIds, period, plus optional dimensions
  - **Format**: `{analyticsName}:analytics:{domainId}:{serverIds}:{period}:{optionalDimensions}`
  - **Verify**: Unit test for cache key generation

- [ ] Task 1.6: Add Redis caching methods to BaseAnalyticsService
  - **Depends on**: 1.5
  - **Output**: Private `getCachedAnalytics()` and `cacheAnalytics()` methods
  - **Files**:
    - `packages/app-api/src/service/Analytics/BaseAnalyticsService.ts`
  - **Content**:
    - `getCachedAnalytics()`: Get from Redis, parse JSON, return null on error
    - `cacheAnalytics()`: Set to Redis with TTL, log on error but don't throw
  - **Verify**: Unit test with mocked Redis client

- [ ] Task 1.7: Add main getAnalytics() orchestration method
  - **Depends on**: 1.3, 1.4, 1.5, 1.6
  - **Output**: Public `getAnalytics()` method handling full pipeline
  - **Files**:
    - `packages/app-api/src/service/Analytics/BaseAnalyticsService.ts`
  - **Flow**:
    1. Start timer
    2. Calculate period dates
    3. Check cache (hit → return, track metric)
    4. Generate fresh (call abstract generateAnalytics())
    5. Cache result
    6. Track metrics
    7. Return analytics
  - **Verify**: Unit test with mocked generateAnalytics()

- [ ] Task 1.8: Add query helper methods to BaseAnalyticsService
  - **Depends on**: 1.2
  - **Output**: Helper methods for common query operations
  - **Files**:
    - `packages/app-api/src/service/Analytics/BaseAnalyticsService.ts`
  - **Methods**:
    - `explainQuery()`: EXPLAIN ANALYZE in development mode
    - `logSlowQuery()`: Warn if query exceeds threshold
    - `applyGameServerFilter()`: Apply gameServerIds to Knex query
    - `calculateChange()`: Calculate absolute and percent change
    - `getGranularity()`: Determine time series granularity from period
  - **Verify**: Unit tests for each helper method

- [ ] Task 1.9: Create AnalyticsTestHarness base class
  - **Output**: Shared test utilities for analytics integration tests
  - **Files**:
    - `packages/app-api/src/__tests__/helpers/AnalyticsTestHarness.ts` (new file)
  - **Methods**:
    - `clearAnalyticsCache(analyticsType)`: Clear Redis cache
    - `verifyCacheHit(analyticsType, expectedKey)`: Check cache exists
    - `expectKPIStructure(data, requiredFields)`: Assert KPI structure
    - `expectPercentages(values, tolerance)`: Assert percentages sum to ~100
    - `expectTimeSeries(data, config)`: Assert time series structure
    - `expectGrowthCalculation(current, previous, growth)`: Verify growth formula
  - **Verify**: TypeScript compilation passes

- [ ] Task 1.10: Add comprehensive tests for BaseAnalyticsService
  - **Depends on**: 1.7, 1.8, 1.9
  - **Output**: Full test coverage for base class
  - **Files**:
    - `packages/app-api/src/service/Analytics/__tests__/BaseAnalyticsService.unit.test.ts` (new file)
  - **Test scenarios**:
    - Cache hit returns cached data
    - Cache miss generates fresh data
    - Metrics tracked correctly
    - Period dates calculated correctly
    - Cache key includes all filter dimensions
    - Query helpers work as expected
    - Error handling (Redis failures, etc.)
  - **Verify**: `npm run test:unit -- BaseAnalyticsService` passes with >90% coverage

### Phase 1 Checkpoint
- [ ] Run lint: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Run tests: `npm run test:unit -- BaseAnalyticsService`
- [ ] Manual verification: Instantiate test subclass, verify metrics created
- [ ] **Demo ready**: Show BaseAnalyticsService code, run tests showing 100% pass rate, explain how it eliminates 400 lines of duplication

---

## Phase 2: Economy Analytics Service (Core)
**Goal**: Create EconomyAnalyticsService extending BaseAnalyticsService with basic KPIs and currency flow
**Demo**: "At standup, I can show: GET /analytics/economy returns real data - total currency, net flow, velocity, and top sources/sinks"

### Tasks

- [ ] Task 2.1: Create Economy DTOs (part 1: KPIs)
  - **Output**: Economy KPI and currency flow DTOs
  - **Files**:
    - `packages/app-api/src/service/Analytics/Economy/dto.ts` (new file)
  - **Content**:
    ```typescript
    export class EconomyKPIMetricsDTO {
      totalCurrency: number;
      totalCurrencyChange: number;
      netFlow: number;
      netFlowChange: number;
      avgBalance: number;
      avgBalanceChange: number;
      activePlayerCount: number;
      activePlayerPct: number;
      currencyVelocity: number;
    }

    export class CurrencyFlowMetricsDTO {
      timeSeries: TimeSeriesDataPointDTO[];
      resetEvents: CurrencyResetEventDTO[];
      totalAdded: number;
      totalDeducted: number;
      inflationRate: number;
    }

    export class ModuleImpactDTO {
      source: string;
      type: 'source' | 'sink';
      amount: number;
      transactionCount: number;
      percentage: number;
    }
    ```
  - **Verify**: TypeScript compilation passes

- [ ] Task 2.2: Create Economy DTOs (part 2: Output)
  - **Depends on**: 2.1
  - **Output**: Main output DTO and filter interface
  - **Files**:
    - `packages/app-api/src/service/Analytics/Economy/dto.ts`
  - **Content**:
    ```typescript
    export interface EconomyAnalyticsFilters extends BaseAnalyticsFilters {
      playerIds?: string[];
      sources?: string[];
      granularity?: 'hourly' | 'daily' | 'weekly';
    }

    export class EconomyAnalyticsOutputDTO extends BaseAnalyticsOutputDTO {
      kpis: EconomyKPIMetricsDTO;
      currencyFlow: CurrencyFlowMetricsDTO;
      modules: { sources: ModuleImpactDTO[], sinks: ModuleImpactDTO[] };
      // wealthDistribution and players added in Phase 4
      playerIds?: string[];
      sources?: string[];
      granularity?: string;
    }
    ```
  - **Verify**: TypeScript compilation passes

- [ ] Task 2.3: Create EconomyAnalyticsService skeleton
  - **Depends on**: 2.2
  - **Output**: Service class extending BaseAnalyticsService with constructor
  - **Files**:
    - `packages/app-api/src/service/Analytics/Economy/EconomyAnalyticsService.ts` (new file)
  - **Content**:
    ```typescript
    @traceableClass('service:economyAnalytics')
    export class EconomyAnalyticsService extends BaseAnalyticsService<
      EconomyAnalyticsOutputDTO,
      EconomyAnalyticsFilters
    > {
      private eventRepo: EventRepo;
      private pogRepo: PlayerOnGameServerRepo;

      constructor(domainId: string) {
        super(domainId, 'economy');
        this.eventRepo = new EventRepo(domainId);
        this.pogRepo = new PlayerOnGameServerRepo(domainId);
      }

      protected async generateAnalytics(
        filters: EconomyAnalyticsFilters,
        startDate: string,
        endDate: string
      ): Promise<EconomyAnalyticsOutputDTO> {
        // TODO: Implementation in next tasks
        throw new Error('Not implemented');
      }
    }
    ```
  - **Verify**: TypeScript compilation passes

- [ ] Task 2.4: Implement calculateKPIs method
  - **Depends on**: 2.3
  - **Output**: KPI calculations from playerOnGameserver and events
  - **Files**:
    - `packages/app-api/src/service/Analytics/Economy/EconomyAnalyticsService.ts`
  - **Queries**:
    - Total currency: `SUM(currency) FROM playerOnGameserver WHERE domain AND filters`
    - Currency events: `SELECT eventName, meta->>'amount', meta->>'source' FROM events WHERE eventName IN ('currency-added', 'currency-deducted') AND createdAt BETWEEN dates AND filters`
    - Active players: `COUNT(DISTINCT playerId) FROM events WHERE eventName IN currency events AND filters`
  - **Calculations**:
    - totalAdded = SUM(amount WHERE eventName = 'currency-added')
    - totalDeducted = SUM(amount WHERE eventName = 'currency-deducted')
    - netFlow = totalAdded - totalDeducted
    - currencyVelocity = totalCurrency > 0 ? netFlow / totalCurrency : 0
    - Previous period for change percentages
  - **Verify**: Unit test with mock data

- [ ] Task 2.5: Implement calculateCurrencyFlow method
  - **Depends on**: 2.4
  - **Output**: Time series data, reset events, module sources/sinks
  - **Files**:
    - `packages/app-api/src/service/Analytics/Economy/EconomyAnalyticsService.ts`
  - **Queries**:
    - Time series: Group events by granularity (hourly/daily/weekly) based on period
    - Reset events: `SELECT createdAt, meta->>'affectedPlayerCount' FROM events WHERE eventName = 'currency-reset-all'`
    - Module breakdown: `GROUP BY meta->>'source'` to get top sources and sinks
  - **Calculations**:
    - inflationRate = totalDeducted > 0 ? (totalAdded - totalDeducted) / totalDeducted * 100 : 0
    - Source percentages: amount / totalAdded * 100
    - Sink percentages: amount / totalDeducted * 100
  - **Verify**: Unit test with time series data

- [ ] Task 2.6: Implement generateAnalytics orchestration
  - **Depends on**: 2.5
  - **Output**: Complete generateAnalytics method calling calculation methods
  - **Files**:
    - `packages/app-api/src/service/Analytics/Economy/EconomyAnalyticsService.ts`
  - **Content**:
    ```typescript
    protected async generateAnalytics(
      filters: EconomyAnalyticsFilters,
      startDate: string,
      endDate: string
    ): Promise<EconomyAnalyticsOutputDTO> {
      const [kpis, currencyFlow] = await Promise.all([
        this.calculateKPIs(filters, startDate, endDate),
        this.calculateCurrencyFlow(filters, startDate, endDate),
      ]);

      return new EconomyAnalyticsOutputDTO({
        kpis,
        currencyFlow,
        modules: currencyFlow.modules,
        lastUpdated: DateTime.now().toISO()!,
        dateRange: `${startDate} to ${endDate}`,
        gameServerIds: filters.gameServerIds,
        playerIds: filters.playerIds,
        sources: filters.sources,
        granularity: filters.granularity,
      });
    }
    ```
  - **Verify**: Service instantiates and runs without errors

- [ ] Task 2.7: Add economy analytics controller endpoint
  - **Output**: GET /analytics/economy endpoint with READ_PLAYERS permission
  - **Files**:
    - `packages/app-api/src/controllers/AnalyticsController.ts`
  - **Content**:
    ```typescript
    @Get('/economy')
    @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
    async getEconomyAnalytics(
      @QueryParams() query: {
        gameServerIds?: string[];
        playerIds?: string[];
        sources?: string[];
        period?: AnalyticsPeriod;
        granularity?: 'hourly' | 'daily' | 'weekly';
      }
    ) {
      const service = new EconomyAnalyticsService(this.domainId);
      const analytics = await service.getAnalytics(query);
      return apiResponse(analytics);
    }
    ```
  - **Verify**: Endpoint accessible in Swagger/OpenAPI docs

- [ ] Task 2.8: Add integration test for economy analytics endpoint
  - **Depends on**: 2.7
  - **Output**: Integration test verifying end-to-end flow
  - **Files**:
    - `packages/app-api/src/controllers/__tests__/Analytics/EconomyAnalytics.integration.test.ts` (new file)
  - **Test scenarios**:
    - Get analytics with no events (returns zeros)
    - Get analytics with currency events (returns real data)
    - Filter by gameServerId
    - Filter by playerIds
    - Filter by sources
    - Different time periods
    - Permission check (READ_PLAYERS required)
    - Cache behavior (second call hits cache)
  - **Verify**: `npm run test:integration -- EconomyAnalytics` passes

### Phase 2 Checkpoint
- [ ] Run lint: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Run tests: `npm run test:integration -- EconomyAnalytics`
- [ ] Manual verification:
  - Create currency events via API
  - Call GET /analytics/economy
  - Verify response has kpis, currencyFlow, modules
  - Check Redis for cache entry
- [ ] **Demo ready**: Postman/curl showing GET /analytics/economy returning real KPIs (total currency, velocity, top sources)

---

## Phase 3: Shop Analytics Refactor
**Goal**: Refactor ShopAnalyticsService to extend BaseAnalyticsService, proving the base class works
**Demo**: "At standup, I can show: ShopAnalyticsService now 800 lines (down from 1346), all tests pass, cache/metrics unchanged"

### Tasks

- [ ] Task 3.1: Create ShopAnalyticsFilters interface
  - **Output**: Shop-specific filter interface extending base
  - **Files**:
    - `packages/app-api/src/service/Analytics/Shop/ShopAnalyticsService.ts`
  - **Content**:
    ```typescript
    export interface ShopAnalyticsFilters extends BaseAnalyticsFilters {
      // Shop has no additional filters currently, but interface ready for future
    }
    ```
  - **Verify**: TypeScript compilation passes

- [ ] Task 3.2: Change ShopAnalyticsService to extend BaseAnalyticsService
  - **Depends on**: 3.1
  - **Output**: Class signature updated, constructor updated
  - **Files**:
    - `packages/app-api/src/service/Analytics/Shop/ShopAnalyticsService.ts`
  - **Changes**:
    ```typescript
    // OLD: export class ShopAnalyticsService extends TakaroService<...>
    // NEW:
    export class ShopAnalyticsService extends BaseAnalyticsService<
      ShopAnalyticsOutputDTO,
      ShopAnalyticsFilters
    > {
      constructor(domainId: string) {
        super(domainId, 'shop');  // Call base constructor
        this.orderRepo = new ShopOrderRepo(domainId);
        this.listingRepo = new ShopListingRepo(domainId);
      }
    }
    ```
  - **Remove**: Lines extending TakaroService, boilerplate methods (find, findOne, create, update, delete that throw NotImplementedError)
  - **Verify**: TypeScript compilation passes

- [ ] Task 3.3: Remove duplicated caching code from ShopAnalyticsService
  - **Depends on**: 3.2
  - **Output**: Caching logic deleted, using base class methods
  - **Files**:
    - `packages/app-api/src/service/Analytics/Shop/ShopAnalyticsService.ts`
  - **Remove**:
    - Private `redisClient` property (inherited from base)
    - `CACHE_TTL` constant (inherited from base)
    - `getCachedAnalytics()` method (~20 lines)
    - `cacheAnalytics()` method (~15 lines)
    - `generateCacheKey()` method (~10 lines) - base class handles it
  - **Verify**: Service still instantiates correctly

- [ ] Task 3.4: Remove duplicated metrics code from ShopAnalyticsService
  - **Depends on**: 3.2
  - **Output**: Metrics setup deleted, using base class metrics
  - **Files**:
    - `packages/app-api/src/service/Analytics/Shop/ShopAnalyticsService.ts`
  - **Remove**:
    - `shopAnalyticsMetricsRegistry` export (~30 lines)
    - `analyticsMetrics` object creation (~30 lines)
    - All metrics references in methods - use `this.metrics` from base instead
  - **Changes**: Replace `analyticsMetrics.cacheHits` with `this.metrics.cacheHits`, etc.
  - **Verify**: Metrics still collected (check Prometheus endpoint)

- [ ] Task 3.5: Remove duplicated period handling from ShopAnalyticsService
  - **Depends on**: 3.2
  - **Output**: Period calculation code deleted, using base class method
  - **Files**:
    - `packages/app-api/src/service/Analytics/Shop/ShopAnalyticsService.ts`
  - **Remove**:
    - Period date calculation logic in `getAnalytics()` method (~30 lines)
    - Switch statement for period enum
  - **Changes**: Use `this.calculatePeriodDates(filters.period)` from base class
  - **Verify**: Date ranges still calculated correctly

- [ ] Task 3.6: Refactor getAnalytics to use base class orchestration
  - **Depends on**: 3.3, 3.4, 3.5
  - **Output**: Main getAnalytics method simplified dramatically
  - **Files**:
    - `packages/app-api/src/service/Analytics/Shop/ShopAnalyticsService.ts`
  - **Remove**: Entire `getAnalytics()` method (~60 lines) - base class provides this
  - **Add**: Rename `generateAnalytics()` to be the protected method required by base
  - **Changes**:
    ```typescript
    // OLD: public async getAnalytics(gameServerIds?, period) { lots of code }
    // NEW: protected async generateAnalytics(filters, startDate, endDate) {
    //   // Existing calculation logic only
    // }
    ```
  - **Verify**: Controller calls still work (now calling inherited getAnalytics())

- [ ] Task 3.7: Update controller to use new filter interface
  - **Depends on**: 3.6
  - **Output**: Shop analytics controller uses ShopAnalyticsFilters
  - **Files**:
    - `packages/app-api/src/controllers/AnalyticsController.ts`
  - **Changes**: Update getShopAnalytics method signature to use ShopAnalyticsFilters
  - **Verify**: API calls still work identically

- [ ] Task 3.8: Verify all shop analytics tests still pass
  - **Depends on**: 3.7
  - **Output**: All existing shop tests pass without modification
  - **Files**:
    - `packages/app-api/src/controllers/__tests__/Analytics/ShopAnalytics.integration.test.ts`
  - **Verify**: `npm run test:integration -- ShopAnalytics` - all tests pass
  - **Check**:
    - Cache behavior unchanged
    - Metrics collected correctly
    - Period filtering works
    - GameServer filtering works

- [ ] Task 3.9: Verify code reduction achieved
  - **Depends on**: 3.8
  - **Output**: Confirmation of line count reduction
  - **Verify**:
    ```bash
    wc -l packages/app-api/src/service/Analytics/Shop/ShopAnalyticsService.ts
    # Should be ~800 lines (down from 1346)
    ```
  - **Check**: Removed ~546 lines of duplicated infrastructure code

### Phase 3 Checkpoint
- [ ] Run lint: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Run tests: `npm run test:integration -- ShopAnalytics`
- [ ] Manual verification:
  - GET /analytics/shop still works
  - Cache keys in Redis (should have 'shop:analytics:' prefix)
  - Prometheus metrics (takaro_shop_analytics_*)
- [ ] **Demo ready**: Show ShopAnalyticsService before/after line counts, all tests green, explain 546 lines removed

---

## Phase 4: Economy Analytics Expansion
**Goal**: Add wealth distribution and player metrics to complete economy analytics
**Demo**: "At standup, I can show: Wealth distribution with adaptive bins, top earners/spenders, hoarder detection"

### Tasks

- [ ] Task 4.1: Create wealth distribution DTOs
  - **Output**: DTOs for wealth bins and distribution metrics
  - **Files**:
    - `packages/app-api/src/service/Analytics/Economy/dto.ts`
  - **Content**:
    ```typescript
    export class WealthBinDTO {
      label: string;  // "Bottom 25%", "Top 1%", etc.
      minValue: number;
      maxValue: number;
      playerCount: number;
      totalCurrency: number;
      percentage: number;
    }

    export class WealthDistributionDTO {
      bins: WealthBinDTO[];
      medianBalance: number;
      top1PercentHolds: number;
      top10PercentHolds: number;
      top25PercentHolds: number;
    }
    ```
  - **Verify**: TypeScript compilation passes

- [ ] Task 4.2: Create player metrics DTOs
  - **Depends on**: 4.1
  - **Output**: DTOs for top earners, spenders, hoarders
  - **Files**:
    - `packages/app-api/src/service/Analytics/Economy/dto.ts`
  - **Content**:
    ```typescript
    export class PlayerCurrencyActivityDTO {
      playerId: string;
      playerName: string;
      amount: number;
      transactionCount: number;
      primarySource: string;
      currentBalance: number;
    }

    export class PlayerEconomyMetricsDTO {
      topEarners: PlayerCurrencyActivityDTO[];
      topSpenders: PlayerCurrencyActivityDTO[];
      hoarders: PlayerCurrencyActivityDTO[];
    }
    ```
  - **Verify**: TypeScript compilation passes

- [ ] Task 4.3: Update EconomyAnalyticsOutputDTO to include new sections
  - **Depends on**: 4.1, 4.2
  - **Output**: Main output DTO includes wealth and player metrics
  - **Files**:
    - `packages/app-api/src/service/Analytics/Economy/dto.ts`
  - **Changes**:
    ```typescript
    export class EconomyAnalyticsOutputDTO extends BaseAnalyticsOutputDTO {
      kpis: EconomyKPIMetricsDTO;
      currencyFlow: CurrencyFlowMetricsDTO;
      modules: { sources: ModuleImpactDTO[], sinks: ModuleImpactDTO[] };
      wealthDistribution: WealthDistributionDTO;  // NEW
      players: PlayerEconomyMetricsDTO;  // NEW
      // ... rest unchanged
    }
    ```
  - **Verify**: TypeScript compilation passes

- [ ] Task 4.4: Implement calculateWealthDistribution method
  - **Depends on**: 4.3
  - **Output**: Adaptive percentile-based binning algorithm
  - **Files**:
    - `packages/app-api/src/service/Analytics/Economy/EconomyAnalyticsService.ts`
  - **Algorithm**:
    1. Query all player balances: `SELECT currency FROM playerOnGameserver WHERE domain AND filters ORDER BY currency`
    2. Calculate percentiles: `percentile_cont(0.25), percentile_cont(0.50), ... FROM playerOnGameserver`
    3. Create bins between percentiles
    4. Count players in each bin
    5. Calculate total currency held in each bin
    6. Calculate top percentage metrics (top 1%, 10%, 25% hold X% of total)
  - **Bin labels**: "Bottom 25%", "25-50%", "50-75%", "75-90%", "90-95%", "95-99%", "Top 1%"
  - **Verify**: Unit test with various distributions (uniform, exponential, normal)

- [ ] Task 4.5: Implement calculatePlayerMetrics method
  - **Depends on**: 4.3
  - **Output**: Top earners, spenders, hoarders identification
  - **Files**:
    - `packages/app-api/src/service/Analytics/Economy/EconomyAnalyticsService.ts`
  - **Queries**:
    - Top earners: Players with most currency-added events, grouped by playerId
    - Top spenders: Players with most currency-deducted events, grouped by playerId
    - Hoarders: Players where `balance > p25_balance AND transaction_count < p50_transactions`
    - Primary source: Most common source per player via `GROUP BY playerId, source`
  - **Join with players table**: Get playerName for display
  - **Verify**: Unit test with mock player data

- [ ] Task 4.6: Update generateAnalytics to include new calculations
  - **Depends on**: 4.4, 4.5
  - **Output**: generateAnalytics calls new methods
  - **Files**:
    - `packages/app-api/src/service/Analytics/Economy/EconomyAnalyticsService.ts`
  - **Changes**:
    ```typescript
    const [kpis, currencyFlow, wealthDistribution, players] = await Promise.all([
      this.calculateKPIs(filters, startDate, endDate),
      this.calculateCurrencyFlow(filters, startDate, endDate),
      this.calculateWealthDistribution(filters),  // NEW
      this.calculatePlayerMetrics(filters, startDate, endDate),  // NEW
    ]);

    return new EconomyAnalyticsOutputDTO({
      kpis, currencyFlow, modules: currencyFlow.modules,
      wealthDistribution,  // NEW
      players,  // NEW
      // ... rest
    });
    ```
  - **Verify**: Service returns complete data

- [ ] Task 4.7: Create EconomyAnalyticsTestHarness
  - **Output**: Economy-specific test utilities
  - **Files**:
    - `packages/app-api/src/__tests__/helpers/EconomyAnalyticsTestHarness.ts` (new file)
  - **Methods**:
    - `generateCurrencyEvents(config)`: Create events with weighted source distribution
    - `expectWealthDistribution(data, totalPlayers)`: Assert bin structure and validity
    - `generateResetEvent(gameServerId, affectedPlayers)`: Create reset event
  - **Content**:
    ```typescript
    export class EconomyAnalyticsTestHarness extends AnalyticsTestHarness<IEconomyTestSetup> {
      async generateCurrencyEvents(config: {
        playerIds: string[];
        gameServerId: string;
        sources: Array<{ name: string; weight: number }>;
        count: number;
      }): Promise<void> {
        for (const source of config.sources) {
          const eventsForSource = Math.floor(config.count * source.weight);
          for (let i = 0; i < eventsForSource; i++) {
            const playerId = config.playerIds[i % config.playerIds.length];
            await this.context.client.playerOnGameserver.addCurrency(
              gameServerId, playerId, { currency: randomAmount(), source: source.name }
            );
          }
        }
      }
    }
    ```
  - **Verify**: TypeScript compilation passes

- [ ] Task 4.8: Add integration tests for wealth distribution
  - **Depends on**: 4.6, 4.7
  - **Output**: Tests verifying adaptive binning
  - **Files**:
    - `packages/app-api/src/controllers/__tests__/Analytics/EconomyAnalytics.integration.test.ts`
  - **Test scenarios**:
    - Bins adapt to currency scale (test with 0-100 range vs 0-10000 range)
    - Percentile labels correct ("Bottom 25%", "Top 1%", etc.)
    - Player counts sum to total
    - Percentages sum to ~100%
    - Bins ordered by minValue
    - Top percentage metrics calculated correctly
  - **Verify**: `npm run test:integration -- EconomyAnalytics` includes wealth tests

- [ ] Task 4.9: Add integration tests for player metrics
  - **Depends on**: 4.6, 4.7
  - **Output**: Tests verifying earners, spenders, hoarders
  - **Files**:
    - `packages/app-api/src/controllers/__tests__/Analytics/EconomyAnalytics.integration.test.ts`
  - **Test scenarios**:
    - Top earners identified correctly (player with most currency-added)
    - Top spenders identified correctly (player with most currency-deducted)
    - Hoarders identified correctly (high balance, low transactions)
    - Primary source calculated correctly (most common source per player)
    - Player filtering works (playerIds filter)
    - Source filtering works (sources filter affects player metrics)
  - **Verify**: Tests pass with generated data

### Phase 4 Checkpoint
- [ ] Run lint: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Run tests: `npm run test:integration -- EconomyAnalytics`
- [ ] Manual verification:
  - GET /analytics/economy includes wealthDistribution and players
  - Wealth bins adapt to server currency scale
  - Top earners list shows correct players
  - Hoarders detected properly
- [ ] **Demo ready**: Show wealth distribution histogram data, top earners with sources, hoarder detection in action

---

## Phase 5: Frontend Implementation
**Goal**: Build economy analytics UI with charts and filters
**Demo**: "At standup, I can show: Full economy dashboard with KPI cards, time series chart, wealth histogram, and working filters"

### Tasks

- [ ] Task 5.1: Create economy analytics route
  - **Output**: New route at /analytics/economy
  - **Files**:
    - `packages/web-main/src/routes/_auth/_global/analytics/economy.tsx` (new file)
  - **Content**: Basic route structure following shop analytics pattern
  - **Verify**: Navigate to /analytics/economy, page loads (empty for now)

- [ ] Task 5.2: Create top-level filter bar component
  - **Depends on**: 5.1
  - **Output**: Filter controls affecting all charts
  - **Files**:
    - `packages/web-main/src/routes/_auth/_global/analytics/economy/-components/FilterBar.tsx` (new file)
  - **Content**:
    - GameServer multi-select dropdown
    - Player multi-select dropdown (NEW)
    - Source multi-select dropdown (NEW)
    - Time period selector (24h, 7d, 30d, 90d)
    - Granularity selector (hourly, daily, weekly)
  - **Behavior**: On change, trigger API request with all filters
  - **Verify**: Filter bar renders, selections update state

- [ ] Task 5.3: Create KPI cards component
  - **Depends on**: 5.1
  - **Output**: Cards displaying total currency, net flow, velocity, etc.
  - **Files**:
    - `packages/web-main/src/routes/_auth/_global/analytics/economy/-components/KPICards.tsx` (new file)
  - **Content**: Follow shop analytics KPI card pattern
  - **Metrics displayed**:
    - Total Currency (with change indicator)
    - Net Flow (with change indicator)
    - Average Balance (with change indicator)
    - Active Players % (with count)
    - Currency Velocity (with tooltip explaining formula)
  - **Verify**: Cards render with data, change indicators show up/down

- [ ] Task 5.4: Create currency flow time series chart
  - **Depends on**: 5.2
  - **Output**: ECharts line chart with added vs deducted series
  - **Files**:
    - `packages/web-main/src/routes/_auth/_global/analytics/economy/-components/CurrencyFlowChart.tsx` (new file)
  - **Content**:
    - Two line series: currency added (green), currency deducted (red)
    - X-axis: Time (respects granularity from filters)
    - Y-axis: Currency amount
    - Annotations: Vertical lines for CURRENCY_RESET_ALL events (Grafana style)
  - **ECharts config**:
    ```typescript
    markLine: {
      data: resetEvents.map(e => ({
        xAxis: e.timestamp,
        label: { formatter: 'Economy Reset' }
      }))
    }
    ```
  - **Verify**: Chart renders, reset events show as vertical lines

- [ ] Task 5.5: Create module impact chart
  - **Depends on**: 5.2
  - **Output**: Horizontal bar chart showing top sources (green) and sinks (red)
  - **Files**:
    - `packages/web-main/src/routes/_auth/_global/analytics/economy/-components/ModuleImpactChart.tsx` (new file)
  - **Content**:
    - Split view: Sources on top (green bars), Sinks on bottom (red bars)
    - Bars show source name, amount, percentage
    - Sorted by amount (descending)
    - Limited to top 10 each
  - **Verify**: Chart renders with color-coded bars, percentages sum to 100%

- [ ] Task 5.6: Create wealth distribution histogram
  - **Depends on**: 5.2
  - **Output**: Histogram with adaptive percentile-based bins
  - **Files**:
    - `packages/web-main/src/routes/_auth/_global/analytics/economy/-components/WealthDistributionChart.tsx` (new file)
  - **Content**:
    - Bar chart with bin labels on X-axis ("Bottom 25%", "Top 1%", etc.)
    - Player count on Y-axis
    - Tooltip shows: bin range, player count, total currency in bin
    - Top percentage metrics displayed above chart (Top 1% holds X%, Top 10% holds Y%)
  - **Verify**: Chart renders with adaptive bins, metrics displayed

- [ ] Task 5.7: Create top players table component
  - **Depends on**: 5.2
  - **Output**: Tabbed table showing earners, spenders, hoarders
  - **Files**:
    - `packages/web-main/src/routes/_auth/_global/analytics/economy/-components/TopPlayersTable.tsx` (new file)
  - **Content**:
    - Three tabs: Top Earners, Top Spenders, Hoarders
    - Columns: Player Name, Amount, Transaction Count, Primary Source, Current Balance
    - Sortable columns
    - Limited to top 10 per tab
  - **Verify**: Tabs switch, table sorts, data displays correctly

- [ ] Task 5.8: Integrate all components in main route
  - **Depends on**: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
  - **Output**: Complete economy analytics page
  - **Files**:
    - `packages/web-main/src/routes/_auth/_global/analytics/economy.tsx`
  - **Layout**:
    ```
    [FilterBar - top]
    [KPICards - row of 5 cards]
    [CurrencyFlowChart - full width]
    [ModuleImpactChart | WealthDistributionChart - 50/50 split]
    [TopPlayersTable - full width]
    ```
  - **Data fetching**: UseQuery hook calling GET /analytics/economy with filter params
  - **Loading states**: Skeletons while loading
  - **Error states**: Error messages on API failure
  - **Verify**: Page renders completely, all charts populate with data

- [ ] Task 5.9: Add frontend component tests
  - **Depends on**: 5.8
  - **Output**: Snapshot tests for all components
  - **Files**:
    - `packages/lib-components/src/components/charts/__tests__/EconomyCharts.test.tsx` (new file)
  - **Tests**:
    - FilterBar snapshot
    - KPICards with various data states
    - CurrencyFlowChart with/without reset events
    - ModuleImpactChart with sources/sinks
    - WealthDistributionChart with adaptive bins
    - TopPlayersTable for each tab
  - **Verify**: `npm run test:unit --workspace=packages/lib-components` passes

### Phase 5 Checkpoint
- [ ] Run lint: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Run tests: `npm run test:unit --workspace=packages/lib-components`
- [ ] Manual verification:
  - Navigate to /analytics/economy
  - All charts render
  - Filters work (gameServer, player, source, period, granularity)
  - Charts update when filters change
  - Loading states show during fetch
- [ ] **Demo ready**: Full economy analytics dashboard with live data, working filters, all visualizations

---

## Phase 6: Polish and Documentation
**Goal**: Add tooltips, responsive design, E2E tests, and admin documentation
**Demo**: "At standup, I can show: Mobile-responsive dashboard, comprehensive tooltips, E2E tests passing, admin guide"

### Tasks

- [ ] Task 6.1: Add tooltips to all metrics
  - **Output**: Helpful tooltips explaining each metric
  - **Files**:
    - All component files in `packages/web-main/src/routes/_auth/_global/analytics/economy/-components/`
  - **Tooltips to add**:
    - Currency Velocity: "Net flow as percentage of total economy size (added - deducted) / total"
    - Active Players %: "Players with at least one currency transaction in period"
    - Hoarders: "Players with balance in top 25% AND transaction count in bottom 50%"
    - Adaptive Bins: "Bins automatically adjust to server's currency scale using percentiles"
    - Reset Events: "Vertical lines indicate economy-wide currency resets"
  - **Verify**: Hover over each metric, tooltip appears with explanation

- [ ] Task 6.2: Implement responsive design
  - **Depends on**: 6.1
  - **Output**: Dashboard works on mobile/tablet
  - **Files**:
    - All component files in `packages/web-main/src/routes/_auth/_global/analytics/economy/-components/`
  - **Responsive breakpoints**:
    - Mobile (<768px): Stack all charts vertically, collapse filter bar
    - Tablet (768-1024px): 2-column layout for charts
    - Desktop (>1024px): Full layout as designed
  - **Verify**: Test on mobile simulator, all content accessible

- [ ] Task 6.3: Add loading skeletons
  - **Depends on**: 6.1
  - **Output**: Skeleton loaders while data fetches
  - **Files**:
    - `packages/web-main/src/routes/_auth/_global/analytics/economy.tsx`
  - **Content**: Use lib-components Skeleton component for each chart area
  - **Verify**: Refresh page, skeletons show briefly during load

- [ ] Task 6.4: Add empty state handling
  - **Depends on**: 6.1
  - **Output**: User-friendly messages when no data exists
  - **Files**:
    - All chart components
  - **Empty states**:
    - No currency events: "No economy activity in this period. Currency events will appear here once players earn or spend."
    - No players: "No players with currency activity in this period."
    - No sources: "No currency sources detected. Make sure modules are generating currency events with source attribution."
  - **Verify**: Test with empty database, empty states display

- [ ] Task 6.5: Create E2E test for economy analytics workflow
  - **Output**: Playwright test covering user journey
  - **Files**:
    - `packages/e2e/src/web-main/analytics-economy.spec.ts` (new file - if E2E tests exist)
  - **Test flow**:
    1. Login as admin
    2. Navigate to /analytics/economy
    3. Verify all charts render
    4. Change filter (select different gameServer)
    5. Verify charts update
    6. Change time period
    7. Verify data changes
    8. Test player filter (select specific player)
    9. Test source filter (select specific source)
  - **Verify**: `npm run test:e2e` passes

- [ ] Task 6.6: Create admin documentation
  - **Output**: Guide for administrators using economy analytics
  - **Files**:
    - `packages/web-docs/docs/features/economy-analytics.md` (new file)
  - **Content**:
    - What is economy analytics
    - How to access (permissions required)
    - Understanding each metric (KPIs explained)
    - Using filters (gameServer, player, source)
    - Interpreting wealth distribution
    - Identifying economy imbalances (high velocity, concentration in top 1%)
    - Troubleshooting (no data, slow loading)
    - Caveats (legacy data shows as "uncategorized")
  - **Verify**: Documentation renders in docs site

- [ ] Task 6.7: Add developer notes to design doc
  - **Output**: Implementation notes section in design doc
  - **Files**:
    - `.design/2025-10-23-economy-analytics/design.md`
  - **Content**: Append new section:
    ```markdown
    ## Implementation Notes (Added Post-Implementation)

    ### Actual Implementation Differences
    - [Any deviations from design]

    ### Performance Observations
    - [Query times, cache hit rates]

    ### Future Improvements
    - [Ideas for v2]
    ```
  - **Verify**: Design doc updated

### Phase 6 Checkpoint
- [ ] Run lint: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Run tests: `npm test` (all tests)
- [ ] Run E2E: `npm run test:e2e` (if E2E exists)
- [ ] Manual verification:
  - Test on mobile device/simulator
  - All tooltips work
  - Empty states display correctly
  - Documentation accessible
- [ ] **Demo ready**: Show mobile responsive design, comprehensive tooltips, admin guide, E2E test passing

---

## Final Verification

- [ ] All requirements from design doc met:
  - [ ] REQ-001: KPI cards (total currency, net flow, avg balance, active players)
  - [ ] REQ-002: Top sources and sinks by module with percentages
  - [ ] REQ-003: Adaptive wealth distribution bins
  - [ ] REQ-004: Currency velocity calculation
  - [ ] REQ-005: Top earners and spenders identified
  - [ ] REQ-006: Multi-select filtering (gameServer, player, source, period)
  - [ ] REQ-007: Time-series visualization
  - [ ] REQ-008: CURRENCY_RESET_ALL event annotations
  - [ ] REQ-009: Mandatory source parameter in DTOs
  - [ ] REQ-010: "uncategorized" for legacy events
  - [ ] REQ-011: Configurable granularity
  - [ ] REQ-012: Hoarder identification (top 25% balance, bottom 50% transactions)

- [ ] All code removed as specified in design:
  - [ ] No duplicate caching code in services (using BaseAnalyticsService)
  - [ ] No duplicate metrics code (using BaseAnalyticsService)
  - [ ] No duplicate period handling (using BaseAnalyticsService)
  - [ ] ShopAnalyticsService reduced from 1346 to ~800 lines

- [ ] Tests comprehensive:
  - [ ] BaseAnalyticsService: >90% coverage
  - [ ] EconomyAnalyticsService: KPIs, currency flow, wealth, players all tested
  - [ ] ShopAnalyticsService: All existing tests pass after refactor
  - [ ] Integration tests: All filter combinations, cache behavior, permissions
  - [ ] Frontend: Component snapshots, data transformation
  - [ ] E2E: Full user workflow

- [ ] Documentation updated:
  - [ ] Admin guide for economy analytics
  - [ ] Developer notes in design doc
  - [ ] API docs (Swagger/OpenAPI)

- [ ] Performance verified:
  - [ ] Analytics queries <2 seconds for 90-day period
  - [ ] Cache hit rate >70% after warmup
  - [ ] Page load time <2 seconds

- [ ] Security verified:
  - [ ] READ_PLAYERS permission enforced
  - [ ] Domain isolation in all queries
  - [ ] No PII exposure beyond player names

---

## Rollback Plan

If issues arise:

1. **Phase 0-2**: Revert commits, source parameter is additive (won't break existing code)
2. **Phase 3**: Revert ShopAnalyticsService refactor, restore from git history
3. **Phase 4-5**: Remove economy route from navigation, feature hidden but not deleted
4. **Cache issues**: Clear Redis namespace: `redis-cli KEYS "economy:analytics:*" | xargs redis-cli DEL`

---

## Success Metrics

- [ ] Code reduction: ~2200 lines saved across analytics services (44% reduction)
- [ ] Test reduction: ~350 lines saved via harness (22% reduction)
- [ ] Development time: Economy analytics completed in 4 weeks (vs 6 weeks without base class)
- [ ] Cache hit rate: >70% in production after 1 week
- [ ] Admin adoption: >50% of admins with READ_PLAYERS use economy analytics within 1 month
- [ ] Bug rate: <5 bugs reported in first month (base class quality is critical)
