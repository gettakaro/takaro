# Design: Shop Analytics

## Layer 1: Problem & Requirements

### Problem Statement
Server administrators need visibility into their shop's performance across all their game servers to make data-driven decisions about pricing, inventory, and product offerings. Currently, they lack comprehensive analytics about sales trends, customer behavior, and revenue metrics, making it difficult to optimize their in-game economy at both server-specific and domain-wide levels.

### Current Situation (AS-IS)
The shop system currently provides:
- Basic listing management at `/gameserver/$gameServerId/shop`
- Order viewing and management at `/gameserver/$gameServerId/shop/orders`
- Category management for shop admins
- Simple table views showing current orders with status badges

However, administrators cannot:
- See revenue trends over time
- Compare performance across multiple game servers
- Identify best-selling items across their domain
- Understand customer purchasing patterns
- Monitor shop performance metrics at scale

### Stakeholders
- **Primary**: Server administrators who manage shop listings and pricing
- **Secondary**: Server owners who monitor overall economy health
- **Technical**: Platform team maintaining the shop module

### Goals
- Provide comprehensive shop analytics through a single, performant endpoint
- Enable data-driven decision making for shop administrators
- Minimize performance impact through intelligent caching
- Integrate seamlessly with existing shop interface

### Non-Goals
- Real-time analytics (1-hour cache is acceptable)
- Predictive analytics or ML-based forecasting
- Custom report generation or exports
- Per-player purchase history views

### Constraints
- Must use existing Redis infrastructure for caching
- Must leverage existing chart components from lib-components (BarChart, LineChart, AreaChart, PieChart)
- Analytics queries may be expensive (hence 1-hour cache requirement)
- Must respect existing permission system (shop admin only)

### Requirements

#### Functional Requirements
- REQ-001: The system SHALL display analytics in the main navigation only to users with MANAGE_SHOP_LISTINGS permission
- REQ-002: The system SHALL support filtering analytics by single or multiple game servers
- REQ-003: The system SHALL provide all analytics data through a single API endpoint
- REQ-004: The system SHALL cache analytics data in Redis for 1 hour
- REQ-009: The system SHALL provide total revenue metrics (daily, weekly, monthly, all-time)
- REQ-010: The system SHALL provide top-selling items by quantity and revenue
- REQ-011: The system SHALL provide order status distribution
- REQ-012: The system SHALL provide customer metrics
- REQ-016: The system SHALL accept optional date range and gameServerId filters

#### Non-Functional Requirements
- NFR-001: Performance - Cached responses within 200ms
- NFR-002: Security - Validate permissions before data access
- NFR-003: Scalability - Handle shops with up to 100,000 orders

## Layer 2: Functional Specification

### Overview
The shop analytics feature adds a new "Analytics" section to the main navigation sidebar, visible only to administrators with MANAGE_SHOP_LISTINGS permission. This section displays comprehensive metrics about shop performance across one or multiple game servers using interactive charts and statistics cards.

### User Workflows

1. **Accessing Analytics**
   - Admin sees "Analytics" option in main sidebar navigation
   - Clicks Analytics link
   - System checks permissions and loads analytics dashboard
   - Can filter by specific game servers or view domain-wide stats

2. **Viewing Metrics**
   - Dashboard displays multiple metric cards with charts
   - User can select time period (7d, 30d, 90d, 1y, all-time)
   - Charts update to show data for selected period
   - Hover interactions show detailed values

3. **Cache Behavior**
   - First request generates analytics (may take 2-5 seconds)
   - Subsequent requests within 1 hour return instantly
   - Cache key includes selected gameServerIds and date range

### External Interfaces

#### Analytics Dashboard UI
- New main navigation item in sidebar: Dashboard | Players | Shop & Orders | Modules | **Analytics** | Settings
- Dynamic, visually engaging layout inspired by modern analytics dashboards
- Responsive design with mixed card sizes for visual interest

**Dashboard Layout & Components:**

### Top Section: Control Bar
- **Left**: Game server multi-select dropdown with search
- **Center**: Quick date range buttons (Today, 7D, 30D, 90D, YTD, Custom)
- **Right**: Refresh button & last updated timestamp

### Hero Section: Key Performance Indicators (Full Width)
**4 Large KPI Cards with animations:**
1. **Total Revenue**
   - Large currency value with animated counter on load
   - Trend arrow & percentage change vs previous period
   - Mini sparkline showing 7-day trend (calculated from orders)
   - Background gradient based on performance (green/yellow/red)

2. **Orders Today**
   - Count with auto-refresh every 30 seconds
   - Hourly distribution mini bar chart (from timestamps)
   - Busiest hour highlighted
   - Comparison to 7-day average

3. **Active Customers**
   - Total unique customers in period
   - New vs returning ratio (pie chart)
   - Growth percentage from previous period
   - Click to see customer list

4. **Average Order Value**
   - Currency amount with trend indicator
   - Min/max range visualization
   - Comparison to previous period
   - Top contributing items listed

### Main Analytics Section (Asymmetric Grid)

**Row 1: Revenue Focus**
- **Large Card (70% width)**: Revenue Over Time
  - `AreaChart` with gradient fill
  - Toggle between Daily/Weekly/Monthly views
  - Hover for detailed breakdowns
  - Annotations for significant events (sales, updates)
  - Period comparison overlay option

- **Medium Card (30% width)**: Revenue by Hour Heatmap
  - `HeatMap` showing best selling times
  - Day of week vs Hour of day
  - Darker = higher revenue
  - Click cells for details

**Row 2: Product Performance**
- **Medium Card (40% width)**: Top Selling Items
  - Horizontal `BarChart` with images/icons
  - Top 10 items with mini product cards
  - Shows: Image, Name, Sales, Revenue, Trend
  - Hover for full stats
  - Click to view item details

- **Small Card (30% width)**: Category Performance
  - `RadialBarChart` for visual impact
  - Categories as concentric rings
  - Size = revenue, Color = growth rate
  - Interactive legend

- **Small Card (30% width)**: Order Status Flow
  - Sankey-style visualization (using custom SVG)
  - Shows: New → Paid → Completed/Canceled
  - Real-time animation of order flow
  - Numbers on each transition

**Row 3: Customer Insights**
- **Medium Card (35% width)**: Customer Breakdown
  - `PieChart` with pull-out slices
  - Segments: New (first purchase), Returning (2+ purchases), Frequent (5+ purchases)
  - Click segment for customer list
  - Hover for order counts

- **Medium Card (35% width)**: Purchase Timeline
  - `LineChart` showing daily order counts
  - Annotated with notable events
  - Trend line overlay
  - Hover for details

- **Small Card (30% width)**: Recent Orders
  - List of last 10 orders
  - Shows: Player name, Item, Price, Time ago
  - Color-coded by order value
  - Refreshes every 30 seconds

### Bottom Section: Actionable Insights
**Insights Bar (Full Width)**
- Data-driven insights cards based on actual patterns:
  - "📈 Revenue up X% this week - Best seller: [Item Name]"
  - "⚠️ [Count] listings with no sales in past 30 days"
  - "⏰ Most orders placed between [Hour]-[Hour]"
  - "👥 [Count] new customers - [X]% became repeat buyers"
- Generated from actual order data analysis

### Interactive Features:
1. **Auto-Refresh**: Dashboard refreshes every 30 seconds for latest data
2. **Comparative Mode**: Toggle to show period-over-period comparisons
3. **Date Range Selection**: Quick presets and custom date picker
4. **Multi-Server Filter**: Select one or multiple game servers
5. **Responsive Design**: Cards reorganize on smaller screens
6. **Loading States**: Skeleton screens with shimmer effect
7. **Empty States**: Helpful messages when no data available
8. **Tooltips**: Contextual information on hover

#### API Endpoint
```
GET /api/analytics/shop
Query params:
  - gameServerIds (array of UUIDs, optional - defaults to all)
  - startDate (ISO 8601, optional)
  - endDate (ISO 8601, optional)
Response: Comprehensive analytics object (cached)
```

### Alternatives Considered

1. **Multiple Endpoints Approach**
   - **Pros**: Granular caching, smaller payloads
   - **Cons**: Multiple requests, complex cache management
   - **Why not chosen**: Requirements specify single endpoint for simplicity

2. **Real-time Analytics**
   - **Pros**: Always current data
   - **Cons**: Performance impact, database load
   - **Why not chosen**: Heavy queries make caching necessary

3. **Separate Analytics Service**
   - **Pros**: Scalability, dedicated resources
   - **Cons**: Complexity, additional infrastructure
   - **Why not chosen**: Over-engineering for current needs

### Why This Solution
The chosen approach balances performance with simplicity by:
- Using a single cached endpoint (REQ-003, REQ-004)
- Leveraging existing UI patterns and components
- Minimal changes to existing architecture
- Clear permission boundaries (REQ-001)

## Layer 3: Technical Specification

### Architecture Overview
```
Frontend (Analytics Tab)
    ↓
Analytics API Endpoint
    ↓
Cache Check (Redis)
    ↓ (miss)
Analytics Service
    ↓
Database Queries
```

### Extension vs Creation Analysis

| Component | Extend/Create | Justification |
|-----------|---------------|---------------|
| Main Navigation | Extend | Add Analytics link to sidebar navigation |
| StatsService | Extend | Follow existing pattern from `StatsService.ts` |
| Analytics Controller | Create | New controller for analytics endpoints |
| Redis Cache | Extend | Use existing Redis client from `lib-db` |
| Frontend Route | Create | New route `/analytics/shop` required |
| ShopAnalyticsService | Create | Specialized logic for shop analytics |

### Components

#### Existing Components (Extended)

- **Global Navigation** (`packages/web-main/src/components/Navbar/index.tsx`)
  - Add Analytics link to main navigation
  - Check MANAGE_SHOP_LISTINGS permission for visibility
  - Follow pattern from existing navigation items with icon

- **StatsService Pattern** (`packages/app-api/src/service/StatsService.ts`)
  - Reference for structuring analytics queries
  - Use similar DTO patterns for output
  - Follow prometheus query patterns where applicable

- **Redis Integration** (`packages/lib-db/src/redis.ts`)
  - Use `Redis.getClient()` for cache operations
  - Follow existing patterns for connection management

#### New Components

- **ShopAnalyticsService** (`packages/app-api/src/service/Shop/ShopAnalyticsService.ts`)
  - Purpose: Generate and cache shop analytics
  - Extends TakaroService base class
  - Methods: `getAnalytics(gameServerId, startDate?, endDate?)`
  - Cache key pattern: `shop:analytics:${gameServerId}:${startDate}:${endDate}`

- **Analytics Controller** (`packages/app-api/src/controllers/AnalyticsController.ts`)
  - Single endpoint: `GET /analytics/shop`
  - Permission check: MANAGE_SHOP_LISTINGS
  - Cache-first approach with fallback to generation
  - Support filtering by multiple game servers

- **Analytics Dashboard Route** (`packages/web-main/src/routes/_auth/_global/analytics.shop.tsx`)
  - Grid layout with metric cards
  - Game server multi-select filter
  - Time period selector
  - Specific chart components:
    - LineChart for revenue trends
    - BarChart for top items and categories
    - PieChart for order status distribution
    - AreaChart for cumulative metrics

### Data Models

No database schema changes required. Analytics are computed from existing tables:
- `shopOrder` - Order history and status
- `shopListing` - Product information
- `players` - Customer information
- `shopCategory` - Category performance

### API Changes

#### New Endpoints

- `GET /api/analytics/shop`
  - Request:
    ```typescript
    {
      startDate?: string; // ISO 8601
      endDate?: string;   // ISO 8601
    }
    ```
  - Response:
    ```typescript
    {
      kpis: {
        revenue: {
          current: number;
          previous: number;
          change: number;
          changePercent: number;
          sparkline: Array<number>; // Last 7 days from orders
        };
        ordersToday: {
          count: number;
          hourlyDistribution: Array<{hour: number, count: number}>;
          busiestHour: number;
          weeklyAverage: number;
        };
        activeCustomers: {
          total: number;
          new: number; // First-time buyers
          returning: number; // 2+ purchases
          growth: number;
        };
        averageOrderValue: {
          current: number;
          previous: number;
          min: number;
          max: number;
          topItems: Array<{name: string, contribution: number}>;
        };
      };
      revenue: {
        timeSeries: Array<{
          timestamp: number;
          value: number;
          orders: number;
        }>;
        byHour: Array<Array<number>>; // [dayOfWeek][hour] = revenue
        total: number;
        growth: number;
      };
      products: {
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
        noSales: Array<{
          id: string;
          name: string;
          daysSinceCreated: number;
        }>;
      };
      orders: {
        statusFlow: {
          paid: number;
          completed: number;
          canceled: number;
        };
        recent: Array<{
          playerId: string;
          playerName: string;
          itemName: string;
          price: number;
          timestamp: string;
        }>;
        dailyCounts: Array<{date: string, count: number}>;
      };
      customers: {
        segments: {
          new: number; // 1 order
          returning: number; // 2-4 orders
          frequent: number; // 5+ orders
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
      };
      insights: Array<{
        type: 'success' | 'warning' | 'info';
        message: string;
        value?: string | number; // Supporting data
      }>;
      metadata: {
        generatedAt: string;
        cacheKey: string;
        dateRange: {
          start: string;
          end: string;
        };
        gameServerIds: string[];
      };
    }
    ```
  - Auth: Requires MANAGE_SHOP_LISTINGS permission

### Implementation Details

#### Cache Strategy
```typescript
async getAnalytics(gameServerIds?: string[], startDate?: string, endDate?: string) {
  const serverKey = gameServerIds ? gameServerIds.sort().join(',') : 'all';
  const cacheKey = `shop:analytics:${this.domainId}:${serverKey}:${startDate || 'all'}:${endDate || 'now'}`;
  const redis = await Redis.getClient('shop-analytics');
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Generate analytics
  const analytics = await this.generateAnalytics(gameServerIds, startDate, endDate);
  
  // Cache for 1 hour
  await redis.setEx(cacheKey, 3600, JSON.stringify(analytics));
  
  return analytics;
}
```

#### Key SQL Queries
```sql
-- Revenue over time
SELECT 
  DATE_TRUNC('day', "createdAt") as date,
  SUM(amount * price) as revenue
FROM "shopOrder" o
JOIN "shopListing" l ON o."listingId" = l.id
WHERE o.status = 'COMPLETED'
  AND ($1::uuid[] IS NULL OR l."gameServerId" = ANY($1))
  AND o."createdAt" BETWEEN $2 AND $3
GROUP BY date
ORDER BY date;

-- Top selling items
SELECT 
  l.id,
  l.name,
  SUM(o.amount) as quantity,
  SUM(o.amount * l.price) as revenue
FROM "shopOrder" o
JOIN "shopListing" l ON o."listingId" = l.id
WHERE o.status = 'COMPLETED'
  AND ($1::uuid[] IS NULL OR l."gameServerId" = ANY($1))
GROUP BY l.id, l.name
ORDER BY quantity DESC
LIMIT 10;
```

#### Security Considerations
- Permission check via `AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SHOP_LISTINGS])`
- Input validation for date parameters
- SQL injection prevention via parameterized queries
- Cache keys include domain context

#### Error Handling
- Cache failures: Log and continue to generate fresh data
- Database timeouts: Return 503 with retry-after header
- Invalid date ranges: Return 400 with specific error message
- Permission denied: Return 403 (follows existing pattern)

### Testing Strategy

#### Unit Tests
```javascript
describe('ShopAnalyticsService', () => {
  it('returns cached data when available', () => {});
  it('generates fresh data on cache miss', () => {});
  it('handles invalid date ranges', () => {});
  it('includes all required metrics', () => {});
  it('filters by multiple game servers', () => {});
  it('returns domain-wide stats when no filter', () => {});
})
```

#### Integration Tests
```javascript
describe('Shop Analytics API', () => {
  it('requires proper permissions', () => {});
  it('caches responses for 1 hour', () => {});
  it('handles large datasets efficiently', () => {});
  it('generates realistic analytics from purchase data', async () => {
    // Setup: Create multiple players and listings
    // Simulate purchases over time from different players
    // Verify analytics match expected values
  });
  it('correctly aggregates cross-server data', () => {});
})
```

The integration tests will follow patterns from `ShopOrder.integration.test.ts`, using the `shopSetup` helper to create test data and simulating realistic purchase scenarios with multiple players buying different items over time.

### Rollout Plan
1. Deploy backend changes (service, controller, caching)
2. Deploy frontend with analytics tab
3. Monitor cache hit rates and query performance
4. Adjust cache duration if needed

## Appendix

### Performance Considerations
- Database indexes already exist on key columns
- Aggregate queries use existing indexes efficiently
- Cache warming could be added if needed
- Consider materialized views for very large datasets

### References
- Existing stats implementation: `/packages/app-api/src/service/StatsService.ts`
- Chart components: `/packages/lib-components/src/components/charts/`
- Dashboard examples: `/packages/web-main/src/routes/_auth/gameserver.$gameServerId/dashboard.statistics.tsx`