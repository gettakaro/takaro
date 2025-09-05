# Implementation Tasks for Shop Analytics

## Overview
Implementation of comprehensive shop analytics feature with caching, multi-server support, and rich visualizations. The feature will be built in 5 phases: backend service, API endpoint, frontend routing, dashboard components, and integration testing.

## Phase 1: Backend Analytics Service
Create the core analytics service that generates shop statistics from order data.

- [ ] Task 1: Create ShopAnalyticsService class structure
  - **Prompt**: Create ShopAnalyticsService class extending TakaroService in packages/app-api/src/service/Shop/ShopAnalyticsService.ts. Include method signatures for getAnalytics(gameServerIds, startDate, endDate) and helper methods for each metric category (KPIs, revenue, products, orders, customers). Follow the pattern from StatsService.ts for structure.
  - **Requirements**: REQ-003, REQ-016
  - **Design ref**: Section 3.3 (New Components - ShopAnalyticsService)
  - **Files**: packages/app-api/src/service/Shop/ShopAnalyticsService.ts

- [ ] Task 2: Implement KPI calculations
  - **Prompt**: Implement the calculateKPIs method that computes revenue totals, order counts, customer metrics, and average order value. Include period comparisons and sparkline generation from the last 7 days of orders. Use SQL queries with proper parameterization to prevent injection.
  - **Requirements**: REQ-009, REQ-010, REQ-012
  - **Design ref**: Section 3.4 (Key SQL Queries)
  - **Files**: packages/app-api/src/service/Shop/ShopAnalyticsService.ts

- [ ] Task 3: Implement revenue analytics
  - **Prompt**: Create calculateRevenue method that generates time series data, hourly heatmaps (7x24 grid), and growth calculations. Group orders by day/week/month based on date range. Calculate revenue by hour of day and day of week for heatmap visualization.
  - **Requirements**: REQ-009, REQ-014
  - **Design ref**: Section 3.4 (Revenue over time query)
  - **Files**: packages/app-api/src/service/Shop/ShopAnalyticsService.ts

- [ ] Task 4: Implement product analytics
  - **Prompt**: Build calculateProducts method to find top-selling items by quantity and revenue, category performance metrics, and identify listings with no sales in 30 days. Include percentage of total calculations and last sold timestamps.
  - **Requirements**: REQ-010, REQ-013
  - **Design ref**: Section 3.4 (Top selling items query)
  - **Files**: packages/app-api/src/service/Shop/ShopAnalyticsService.ts

- [ ] Task 5: Implement customer analytics
  - **Prompt**: Create calculateCustomers method to segment customers by purchase frequency (new: 1 order, returning: 2-4, frequent: 5+), identify top buyers, and calculate repeat purchase rate. Include unique customer counts and growth metrics.
  - **Requirements**: REQ-012
  - **Design ref**: Section 3.3 (Customer metrics)
  - **Files**: packages/app-api/src/service/Shop/ShopAnalyticsService.ts

- [ ] Task 6: Add Redis caching layer
  - **Prompt**: Implement caching using Redis.getClient('shop-analytics'). Create cache key from domainId, gameServerIds (sorted), and date range. Set 1-hour TTL with setEx. Add try-catch for cache failures with fallback to fresh generation. Log cache hits/misses for monitoring.
  - **Requirements**: REQ-004, REQ-005, REQ-006
  - **Design ref**: Section 3.4 (Cache Strategy)
  - **Files**: packages/app-api/src/service/Shop/ShopAnalyticsService.ts

- [ ] Task 7: Generate data insights
  - **Prompt**: Create generateInsights method that analyzes the computed metrics to produce actionable insights like "Revenue up X%", "Y items with no sales", "Peak hours are X-Y", "Z new customers, N% became repeat buyers". Return array of typed insight objects.
  - **Requirements**: REQ-023
  - **Design ref**: Section 2.3 (Insights Bar)
  - **Files**: packages/app-api/src/service/Shop/ShopAnalyticsService.ts

## Phase 2: API Controller & DTOs
Create the API endpoint and data transfer objects for analytics.

- [ ] Task 8: Create analytics DTOs
  - **Prompt**: Define ShopAnalyticsInputDTO (with optional gameServerIds array, startDate, endDate) and ShopAnalyticsOutputDTO matching the API response structure from design. Use class-validator decorators for validation. Place in packages/app-api/src/service/Shop/dto.ts.
  - **Requirements**: REQ-003, REQ-016
  - **Design ref**: Section 2.3 (API Endpoint Response)
  - **Files**: packages/app-api/src/service/Shop/dto.ts

- [ ] Task 9: Create AnalyticsController
  - **Prompt**: Create AnalyticsController in packages/app-api/src/controllers/AnalyticsController.ts with GET /analytics/shop endpoint. Add permission check for MANAGE_SHOP_LISTINGS using AuthService.getAuthMiddleware. Validate query params, call ShopAnalyticsService, and return apiResponse.
  - **Requirements**: REQ-001, REQ-002, REQ-003
  - **Design ref**: Section 3.3 (Analytics Controller)
  - **Files**: packages/app-api/src/controllers/AnalyticsController.ts

- [ ] Task 10: Register controller routes
  - **Prompt**: Add AnalyticsController to the routing configuration. Ensure the /analytics/shop endpoint is properly registered and accessible. Follow existing controller registration patterns.
  - **Requirements**: REQ-003
  - **Design ref**: Section 3.3 (Analytics Controller)
  - **Files**: packages/app-api/src/main.ts (or wherever controllers are registered)

## Phase 3: Frontend Navigation & Routing
Add analytics to the main navigation and create routing structure.

- [ ] Task 11: Add Analytics to global navigation
  - **Prompt**: Add Analytics navigation item to the global nav component. Place between Modules and Settings. Use chart/analytics icon. Check MANAGE_SHOP_LISTINGS permission for visibility. Follow pattern from existing nav items.
  - **Requirements**: REQ-001
  - **Design ref**: Section 3.3 (Global Navigation)
  - **Files**: packages/web-main/src/components/Navbar/index.tsx

- [ ] Task 12: Create analytics route structure
  - **Prompt**: Create route file at packages/web-main/src/routes/_auth/_global/analytics.shop.tsx with basic component structure and loader for permission check. Set up route params for optional gameServerId filtering.
  - **Requirements**: REQ-001, REQ-002
  - **Design ref**: Section 3.3 (Analytics Dashboard Route)
  - **Files**: packages/web-main/src/routes/_auth/_global/analytics.shop.tsx

- [ ] Task 13: Create analytics API query
  - **Prompt**: Create shopAnalyticsQueryOptions in packages/web-main/src/queries/analytics.ts using tanstack-query. Include gameServerIds, startDate, endDate params. Set staleTime to 30 seconds for auto-refresh. Handle loading and error states.
  - **Requirements**: REQ-003
  - **Design ref**: Section 2.3 (Interactive Features - Auto-Refresh)
  - **Files**: packages/web-main/src/queries/analytics.ts

## Phase 4: Dashboard Components
Build the analytics dashboard with all visualizations and interactions.

- [ ] Task 14: Create dashboard layout structure
  - **Prompt**: Build main dashboard container with control bar (server filter, date range, refresh button) at top. Create responsive grid layout with sections for KPIs, charts, and insights. Use styled-components following existing dashboard patterns.
  - **Requirements**: REQ-019, REQ-021
  - **Design ref**: Section 2.3 (Dashboard Layout)
  - **Files**: packages/web-main/src/routes/_auth/_global/analytics.shop.tsx

- [ ] Task 15: Implement KPI cards
  - **Prompt**: Create 4 animated KPI cards (Revenue, Orders Today, Active Customers, Avg Order Value) with trend indicators, sparklines, and color-coded backgrounds. Use framer-motion for number animations. Include comparison percentages and mini visualizations.
  - **Requirements**: REQ-009, REQ-011, REQ-012
  - **Design ref**: Section 2.3 (Hero Section KPIs)
  - **Files**: packages/web-main/src/routes/_auth/_global/analytics.shop/-components/KPICards.tsx

- [ ] Task 16: Implement revenue charts
  - **Prompt**: Create revenue over time AreaChart (70% width) and revenue heatmap (30% width) using lib-components charts. Add toggle for daily/weekly/monthly views. Include hover tooltips and period comparison overlay option.
  - **Requirements**: REQ-009, REQ-020
  - **Design ref**: Section 2.3 (Row 1: Revenue Focus)
  - **Files**: packages/web-main/src/routes/_auth/_global/analytics.shop/-components/RevenueCharts.tsx

- [ ] Task 17: Implement product performance charts
  - **Prompt**: Build horizontal BarChart for top-selling items (40% width), RadialBarChart for categories (30% width), and order status flow visualization (30% width). Include item images/icons where available and interactive legends.
  - **Requirements**: REQ-010, REQ-013, REQ-020
  - **Design ref**: Section 2.3 (Row 2: Product Performance)
  - **Files**: packages/web-main/src/routes/_auth/_global/analytics.shop/-components/ProductCharts.tsx

- [ ] Task 18: Implement customer insights
  - **Prompt**: Create PieChart for customer segments (35% width), LineChart for purchase timeline (35% width), and recent orders list (30% width). Add click handlers for drilling into segments. Color-code order values in the list.
  - **Requirements**: REQ-012, REQ-020
  - **Design ref**: Section 2.3 (Row 3: Customer Insights)
  - **Files**: packages/web-main/src/routes/_auth/_global/analytics.shop/-components/CustomerCharts.tsx

- [ ] Task 19: Implement insights bar
  - **Prompt**: Build insights bar displaying data-driven recommendations from API. Use Card components with success/warning/info styling based on type. Include emoji icons and supporting values. Make cards responsive and stack on mobile.
  - **Requirements**: REQ-023
  - **Design ref**: Section 2.3 (Bottom Section: Actionable Insights)
  - **Files**: packages/web-main/src/routes/_auth/_global/analytics.shop/-components/InsightsBar.tsx

- [ ] Task 20: Add filters and controls
  - **Prompt**: Implement game server multi-select dropdown, date range selector with presets (Today, 7D, 30D, 90D, Custom), and refresh button. Update query params on change. Show last updated timestamp. Follow existing filter patterns.
  - **Requirements**: REQ-016, REQ-017, REQ-018
  - **Design ref**: Section 2.3 (Top Section: Control Bar)
  - **Files**: packages/web-main/src/routes/_auth/_global/analytics.shop/-components/FilterControls.tsx

- [ ] Task 21: Add loading and empty states
  - **Prompt**: Create skeleton loading screens with shimmer effect for each chart type. Design helpful empty state messages when no data available. Include illustrations or icons. Handle error states with retry options.
  - **Requirements**: REQ-021, REQ-022
  - **Design ref**: Section 2.3 (Interactive Features)
  - **Files**: packages/web-main/src/routes/_auth/_global/analytics.shop/-components/LoadingStates.tsx

## Phase 5: Testing & Polish
Add comprehensive tests and final polish.

- [x] Task 22: Create backend unit tests
  - **Prompt**: Write unit tests for ShopAnalyticsService covering cache hit/miss scenarios, metric calculations, date range handling, multi-server filtering, and insight generation. Mock Redis and database queries. Target 80% coverage.
  - **Requirements**: REQ-007, REQ-008
  - **Design ref**: Section 3.5 (Unit Tests)
  - **Files**: packages/app-api/src/service/Shop/__tests__/ShopAnalyticsService.unit.test.ts

- [x] Task 23: Create integration tests
  - **Prompt**: Build integration tests that create realistic shop data (multiple players, listings, orders over time) using shopSetup helper. Test analytics endpoint with various filters. Verify cache behavior and response times. Test permission checks.
  - **Requirements**: REQ-001, REQ-004, REQ-007
  - **Design ref**: Section 3.5 (Integration Tests)
  - **Files**: packages/app-api/src/controllers/__tests__/Analytics/ShopAnalytics.integration.test.ts

- [x] Task 24: Add performance monitoring
  - **Prompt**: Add metrics for analytics generation time, cache hit rate, and query performance. Log slow queries over 1 second. Add OpenTelemetry spans for tracing. Follow existing metrics patterns.
  - **Requirements**: REQ-030, REQ-031
  - **Design ref**: Section 1.3 (Maintainability)
  - **Files**: packages/app-api/src/service/Shop/ShopAnalyticsService.ts

- [x] Task 25: Optimize database queries
  - **Prompt**: Review and optimize all analytics queries. Ensure proper index usage on shopOrder and shopListing tables. Add EXPLAIN ANALYZE in development mode. Consider adding database views for complex aggregations if needed.
  - **Requirements**: REQ-008, REQ-029
  - **Design ref**: Section 4 (Performance Considerations)
  - **Files**: packages/app-api/src/service/Shop/ShopAnalyticsService.ts

## Dependencies & Notes

### Prerequisites:
- Redis must be running for caching
- Database indexes should be verified before deployment
- Existing shop module must be enabled

### Testing Data:
- Use existing shopSetup helper from ShopOrder.integration.test.ts
- Create at least 100 orders across multiple players for realistic testing
- Include various order statuses and date ranges

### Performance Targets:
- Cached responses: < 200ms
- Fresh generation: < 5 seconds for 100k orders
- Cache hit rate: > 90% in production

### Next Steps After Implementation:
- Monitor cache hit rates and adjust TTL if needed
- Consider adding export functionality in future iteration
- Potentially add real-time updates via WebSocket events