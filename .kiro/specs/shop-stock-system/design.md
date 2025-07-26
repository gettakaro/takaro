# Shop Stock System Design

## Codebase Analysis

### Discovered Patterns and Conventions

1. **Service Pattern**: All services extend `TakaroService<Model, OutputDTO, CreateDTO, UpdateDTO>` from `packages/app-api/src/service/Base.js`
2. **Repository Pattern**: Repositories extend `ITakaroRepo` with domain scoping built-in
3. **DTO Validation**: Uses class-validator decorators with `TakaroModelDTO` for outputs and `TakaroDTO` for inputs
4. **Event System**: Centralized event types in `EVENT_TYPES` enum with typed event metadata classes
5. **Database Migrations**: Knex-based migrations in `packages/lib-db/src/migrations/sql/` with timestamp prefixes
6. **Error Handling**: Standard error types from `@takaro/util` (NotFoundError, BadRequestError, etc.)
7. **Transaction Pattern**: Complex operations use `model.transaction()` for atomicity
8. **Testing**: IntegrationTest framework with shop-specific `shopSetup` fixture

### Existing Systems to Extend

1. **ShopListingService** (`packages/app-api/src/service/Shop/index.ts`) - Primary extension point
2. **ShopListingModel** (`packages/app-api/src/db/shopListing.ts`) - Add stock columns
3. **Shop DTOs** (`packages/app-api/src/service/Shop/dto.ts`) - Add stock fields
4. **EventService** - Use existing event emission patterns
5. **Shop Controllers** (`packages/app-api/src/controllers/Shop/`) - Minimal changes needed

### Code Style Requirements

- TypeScript with strict mode
- Decorators for routing and validation
- Async/await for all database operations
- Domain scoping on all queries
- Comprehensive error handling with typed errors

## Extension vs. Creation Analysis

### Systems Being Extended

1. **ShopListingModel** (line 51, `packages/app-api/src/db/shopListing.ts`)
   - Adding: `stockManagementEnabled: boolean` and `stock: number` columns
   - No new model needed - stock is a property of listings

2. **ShopListingService** (line 40, `packages/app-api/src/service/Shop/index.ts`)
   - Extending `createOrder()` method to check and decrement stock
   - Extending `cancelOrder()` method to restore stock
   - Extending `update()` method to validate stock changes
   - Adding helper methods: `decrementStock()`, `incrementStock()`

3. **Shop DTOs** (`packages/app-api/src/service/Shop/dto.ts`)
   - Extending existing DTOs with stock fields
   - No new DTOs needed - stock is part of listing data

4. **EventService** integration
   - Using existing event emission pattern
   - Adding new event types to existing `EVENT_TYPES` enum

### Justification for New Components

**No new major components needed**. All stock functionality integrates into existing shop system:
- Stock is a property of listings, not a separate entity
- Stock operations happen within order transactions
- Uses existing permission system (MANAGE_SHOP)

## Overview

The Shop Stock System adds optional inventory management to shop listings by extending the existing shop infrastructure. Shop administrators can enable stock tracking per listing and the system will prevent purchases when stock is depleted.

### Key Objectives
- Add stock tracking to shop listings without breaking existing functionality
- Ensure atomic stock operations to prevent overselling
- Maintain backwards compatibility with unlimited stock as default
- Integrate seamlessly with existing order flow

### Non-Goals
- Complex inventory management (multiple warehouses, etc.)
- Stock forecasting or automated reordering
- Product variants with separate stock levels

## Architecture

### Integration with Existing Architecture

```
Existing Flow with Stock Extensions:

User Request → Shop Controller → ShopListingService
                                          ↓
                                  [Stock Validation]
                                          ↓
                              Transaction Boundary {
                                  - Create Order
                                  - Deduct Currency
                                  - [Decrement Stock]
                              }
                                          ↓
                                    Event Emission
```

The stock system integrates at the service layer within existing transaction boundaries, ensuring consistency between orders, currency, and stock.

## Components and Interfaces

### Extended Components

#### 1. ShopListingModel Extension

Location: `packages/app-api/src/db/shopListing.ts`

```typescript
export class ShopListingModel extends TakaroModel {
  // Existing fields...
  
  // NEW: Stock tracking fields
  stockManagementEnabled: boolean;
  stock?: number;
}
```

#### 2. ShopListing DTOs Extension

Location: `packages/app-api/src/service/Shop/dto.ts`

Following existing DTO patterns:

```typescript
export class ShopListingCreateDTO<T = void> extends TakaroDTO<T> {
  // Existing fields...
  
  @IsBoolean()
  @IsOptional()
  stockManagementEnabled?: boolean = false;
  
  @IsNumber()
  @Min(0)
  @IsOptional()
  @ValidateIf(o => o.stockManagementEnabled === true)
  stock?: number;
}

export class ShopListingOutputDTO extends TakaroModelDTO<ShopListingOutputDTO> {
  // Existing fields...
  
  @IsBoolean()
  stockManagementEnabled: boolean;
  
  @IsNumber()
  @IsOptional()
  stock?: number;
}
```

#### 3. ShopListingService Extensions

Location: `packages/app-api/src/service/Shop/index.ts`

Extending existing methods following current patterns:

```typescript
// Extension to createOrder() - around line 210
async createOrder(listingId: string, amount: number, playerIdOverride?: string): Promise<ShopOrderOutputDTO> {
  // Existing validation up to line 240...
  
  const { knex } = await this.repo.getModel();
  
  const result = await ctx.runInTransaction(knex, async () => {
    // All repository calls automatically use the context transaction
    const listing = await this.findOne(listingId);
    
    if (listing.draft) throw new errors.BadRequestError('Cannot order a draft listing');
    if (listing.deletedAt) throw new errors.BadRequestError('Cannot order a deleted listing');
    
    // NEW: Stock validation
    if (listing.stockManagementEnabled) {
      if (listing.stock < amount) {
        throw new errors.BadRequestError(
          `Insufficient stock. Available: ${listing.stock}, Requested: ${amount}`
        );
      }
      
      // Stock decrement uses context transaction automatically
      await this.repo.decrementStock(listingId, amount);
    }
    
    // Currency deduction uses context transaction automatically
    const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);
    await playerOnGameServerService.deductCurrency(pog.id, listing.price * amount);
    
    // Order creation uses context transaction automatically
    const order = await this.orderRepo.create(
      new ShopOrderCreateInternalDTO({ 
        listingId, 
        playerId, 
        amount, 
        gameServerId 
      })
    );
    
    return { order, listing, stockAfterPurchase: listing.stock - amount };
  });
  
  // Events are emitted AFTER transaction commits successfully
  await this.eventService.create(
    new EventCreateDTO({
      eventName: EVENT_TYPES.SHOP_ORDER_CREATED,
      gameserverId: result.listing.gameServerId,
      playerId: playerId,
      meta: new TakaroEventShopOrderCreated({
        id: result.order.id,
        listingName: result.listing.name,
        price: result.listing.price,
        amount: amount,
        totalPrice: result.listing.price * amount,
        items: result.listing.items.map(item => new TakaroEventShopItem({
          name: item.item.name,
          code: item.item.code,
          amount: item.amount,
          quality: item.quality,
        }))
      })
    })
  );
  
  // NEW: Stock-related event
  if (result.listing.stockManagementEnabled && result.stockAfterPurchase === 0) {
    await this.eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.SHOP_STOCK_EMPTY,
        gameserverId: result.listing.gameServerId,
        meta: new TakaroEventShopStockEmpty({
          listingId: result.listing.id,
          listingName: result.listing.name
        })
      })
    );
  }
  
  return result.order;
}
```

#### 3b. ShopListingService update() Method Extension

```typescript
// Extension to update() method
async update(id: string, data: ShopListingUpdateDTO): Promise<ShopListingOutputDTO> {
  const existing = await this.findOne(id);
  
  // NEW: Validate stock management changes
  if (data.stockManagementEnabled === true && !existing.stockManagementEnabled) {
    if (data.stock === undefined) {
      throw new errors.BadRequestError(
        'Stock quantity must be provided when enabling stock management'
      );
    }
  }
  
  // Existing draft validation and order cancellation...
  
  const updated = await this.repo.update(id, data);
  
  // NEW: Emit stock update event when stock changes
  if (data.stock !== undefined || data.stockManagementEnabled !== undefined) {
    await this.eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.SHOP_STOCK_UPDATED,
        gameserverId: updated.gameServerId,
        meta: new TakaroEventShopStockUpdated({
          listingId: updated.id,
          listingName: updated.name,
          oldStock: existing.stockManagementEnabled ? existing.stock : undefined,
          newStock: updated.stock || 0,
          stockManagementEnabled: updated.stockManagementEnabled
        })
      })
    );
  }
  
  return updated;
}
```

#### 3c. ShopListingService cancelOrder() Method Extension

```typescript
// Extension to cancelOrder() method - around line 394
async cancelOrder(orderId: string): Promise<ShopOrderOutputDTO> {
  // Existing validation...
  
  const { knex } = await this.orderRepo.getModel();
  
  const result = await ctx.runInTransaction(knex, async () => {
    // All operations use context transaction automatically
    const order = await this.findOneOrder(orderId);
    await this.checkIfOrderBelongsToUser(order);
    
    if (order.status !== ShopOrderStatus.PAID)
      throw new errors.BadRequestError(
        `Can only cancel paid orders that weren't claimed yet. Current status: ${order.status}`
      );
    
    // Update order status
    const updated = await this.orderRepo.update(
      orderId,
      new ShopOrderUpdateDTO({ status: ShopOrderStatus.CANCELED })
    );
    
    // Get listing details
    const listing = await this.findOne(order.listingId);
    
    // Refund currency (uses context transaction automatically)
    const pogsService = new PlayerOnGameServerService(this.domainId);
    const pog = await pogsService.find({ 
      filters: { playerId: [order.playerId], gameServerId: [order.gameServerId] } 
    });
    await pogsService.addCurrency(pog.results[0].id, listing.price * order.amount);
    
    // NEW: Restore stock if stock management is enabled
    if (listing.stockManagementEnabled) {
      await this.repo.incrementStock(listing.id, order.amount);
    }
    
    return { updated, listing, refundAmount: listing.price * order.amount };
  });
  
  // Emit events after transaction commits
  await this.eventService.create(
    new EventCreateDTO({
      eventName: EVENT_TYPES.SHOP_ORDER_STATUS_CHANGED,
      gameserverId: result.listing.gameServerId,
      playerId: order.playerId,
      meta: new TakaroEventShopOrderStatusChanged({
        id: result.updated.id,
        status: ShopOrderStatus.CANCELED
      })
    })
  );
  
  return result.updated;
}
```

#### 4. Event System Extensions

Location: `packages/lib-modules/src/dto/takaroEvents.ts`

Add to existing TakaroEvents constant:
```typescript
export const TakaroEvents = {
  // Existing events...
  SHOP_STOCK_EMPTY: 'shop-stock-empty',
  SHOP_STOCK_UPDATED: 'shop-stock-updated',
} as const;
```

Define event data classes following existing patterns:
```typescript
export class TakaroEventShopStockEmpty extends BaseEvent<TakaroEventShopStockEmpty> {
  @IsString()
  type = TakaroEvents.SHOP_STOCK_EMPTY;
  
  @IsUUID()
  listingId: string;
  
  @IsString()
  listingName: string;
}

export class TakaroEventShopStockUpdated extends BaseEvent<TakaroEventShopStockUpdated> {
  @IsString()
  type = TakaroEvents.SHOP_STOCK_UPDATED;
  
  @IsUUID()
  listingId: string;
  
  @IsString()
  listingName: string;
  
  @IsNumber()
  @IsOptional()
  oldStock?: number;
  
  @IsNumber()
  newStock: number;
  
  @IsBoolean()
  stockManagementEnabled: boolean;
}
```

Add to EventMapping type:
```typescript
[TakaroEvents.SHOP_STOCK_EMPTY]: TakaroEventShopStockEmpty,
[TakaroEvents.SHOP_STOCK_UPDATED]: TakaroEventShopStockUpdated,
```

## Data Models

### Database Migration

Following existing migration patterns in `packages/lib-db/src/migrations/sql/`:

```typescript
// File: 20250125000000-add-shop-stock.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopListing', (table) => {
    table.boolean('stockManagementEnabled').defaultTo(false).notNullable();
    table.integer('stock').nullable();
    
    // Constraint following existing patterns
    table.check(
      `(("stockManagementEnabled" = false AND "stock" IS NULL) OR 
        ("stockManagementEnabled" = true AND "stock" >= 0))`,
      'stock_management_check'
    );
  });
  
  // Performance index following existing patterns
  await knex.raw(`
    CREATE INDEX idx_shop_listing_stock 
    ON "shopListing"("stockManagementEnabled", "stock") 
    WHERE "stockManagementEnabled" = true
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopListing', (table) => {
    table.dropColumn('stockManagementEnabled');
    table.dropColumn('stock');
  });
}
```

## Implementation Details

### Transaction Boundaries - Critical for Atomicity

**IMPORTANT**: All stock operations MUST occur within the same SQL transaction as currency operations to ensure data consistency. This prevents scenarios where stock is decremented but payment fails, or vice versa.

The order creation flow executes these operations in a SINGLE SQL transaction:
1. Lock the shop listing row (SELECT ... FOR UPDATE)
2. Validate stock availability
3. Decrement stock
4. Deduct currency from player
5. Create order record
6. Commit or rollback everything together

### Following Existing Patterns

1. **Error Handling Pattern** (throughout codebase):
   ```typescript
   if (!resource) throw new errors.NotFoundError(`Resource with id ${id} not found`);
   if (invalid) throw new errors.BadRequestError('Descriptive error message');
   ```

2. **Event Emission Pattern** (line 246):
   ```typescript
   await this.eventService.create(
     new EventCreateDTO({
       eventName: EVENT_TYPES.SHOP_STOCK_UPDATED,
       gameserverId: listing.gameServerId,
       meta: { /* event data */ }
     })
   );
   ```

### Security Patterns

Following existing permission checks (line 86):
```typescript
const userHasHighPrivileges = checkPermissions([PERMISSIONS.MANAGE_SHOP], user);
```


## Error Handling

### Following Existing Error Patterns

1. **Insufficient Stock**:
   ```typescript
   throw new errors.BadRequestError(
     `Insufficient stock. Available: ${listing.stock}, Requested: ${amount}`
   );
   ```

2. **Invalid Stock Management Toggle**:
   ```typescript
   throw new errors.BadRequestError(
     'Stock quantity must be provided when enabling stock management'
   );
   ```

All errors follow the existing pattern of descriptive messages with proper error types.

## Frontend Event Integration

### Event Display in EventItem.tsx

Location: `packages/web-main/src/components/events/EventFeed/EventItem.tsx`

Add new cases to the switch statement (around line 240):

```typescript
case EventOutputDTOEventNameEnum.ShopStockEmpty:
  properties = (
    <>
      <EventProperty name="gameserver" value={event.gameServer?.name} />
      <EventProperty name="listing" value={meta?.listingName} />
      <EventProperty name="listing id" value={meta?.listingId} />
    </>
  );
  break;

case EventOutputDTOEventNameEnum.ShopStockUpdated:
  properties = (
    <>
      <EventProperty name="gameserver" value={event.gameServer?.name} />
      <EventProperty name="listing" value={meta?.listingName} />
      <EventProperty name="old stock" value={meta?.oldStock ?? 'N/A'} />
      <EventProperty name="new stock" value={meta?.newStock} />
      <EventProperty name="stock enabled" value={meta?.stockManagementEnabled ? 'Yes' : 'No'} />
    </>
  );
  break;
```

### Event Categorization Update

Location: `packages/web-main/src/components/selects/EventNameSelectField/eventNames.tsx`

Update the Economy category (line 46):

```typescript
{
  category: 'Economy',
  events: [
    e.CurrencyAdded,
    e.CurrencyDeducted,
    e.ShopOrderCreated,
    e.ShopOrderStatusChanged,
    e.ShopOrderDeliveryFailed,
    e.ShopListingCreated,
    e.ShopListingUpdated,
    e.ShopListingDeleted,
    e.ShopStockEmpty,        // NEW
    e.ShopStockUpdated,      // NEW
  ],
}
```

### API Client Generation

The TypeScript types will be automatically generated when the API is updated, adding:
- `EventOutputDTOEventNameEnum.ShopStockEmpty`
- `EventOutputDTOEventNameEnum.ShopStockUpdated`

## Testing Strategy

### Comprehensive Test Cases

Location: `packages/app-api/src/controllers/__tests__/Shop/`

#### 1. Stock Management Tests (`ShopStockManagement.integration.test.ts`)
- **Enable stock management with initial stock**
- **Enable stock management without initial stock (should fail)**
- **Disable stock management**
- **Update stock quantity**
- **Attempt to set negative stock (should fail)**

#### 2. Stock Validation Tests (`ShopStockValidation.integration.test.ts`)
- **Purchase with sufficient stock**
- **Purchase with exact stock amount**
- **Purchase with insufficient stock (should fail)**
- **Purchase multiple items with stock check**
- **Purchase from unlimited stock listing**

#### 3. Concurrent Order Tests (`ShopStockConcurrency.integration.test.ts`)
- **Multiple concurrent orders with limited stock**
- **Verify exactly one order succeeds when stock = 1**
- **Concurrent orders with different amounts**
- **Mixed concurrent orders (some succeed, some fail)**

#### 4. Order Cancellation Tests (`ShopStockCancellation.integration.test.ts`)
- **Cancel order and verify stock restoration**
- **Cancel multiple orders sequentially**
- **Attempt to cancel completed order (no stock change)**
- **Cancel order for listing with disabled stock management**

#### 5. Event Tests (`ShopStockEvents.integration.test.ts`)
- **Stock empty event when last item purchased**
- **Stock updated event on manual update**
- **Stock updated event when enabling/disabling management**
- **No event when stock doesn't reach zero**

#### 6. Edge Cases (`ShopStockEdgeCases.integration.test.ts`)
- **Delete listing with pending orders**
- **Set listing to draft with stock**
- **Import/export with stock values**
- **Stock overflow protection**

#### 7. Integration Tests (`ShopStockIntegration.integration.test.ts`)
- **Full purchase flow with stock limits**
- **Stock display in listing queries**
- **Permission checks for stock updates**
- **Stock filtering in shop searches**

## User Documentation Updates

### economy.md Updates

Location: `packages/web-docs/docs/economy.md`

Add new section after "Shop Functionalities" (around line 30):

```markdown
### Stock Management

Takaro's shop system includes optional stock management capabilities that allow you to control item availability:

#### Enabling Stock Management

1. Navigate to your shop listing in the Takaro dashboard
2. Toggle "Enable Stock Management" 
3. Set the initial stock quantity
4. Save your changes

When stock management is enabled:
- Players cannot purchase items when stock reaches 0
- Stock automatically decreases when players make purchases
- Stock is restored if an order is canceled
- The current stock level is displayed in the shop interface

#### Stock Visibility

- **For Administrators**: Full stock information is shown in the shop management interface
- **For Players**: 
  - In-game: Stock status is shown when browsing items (e.g., "Stock: 5" or "Out of Stock")
  - Web interface: Stock availability is displayed on listing cards

#### Managing Stock

- **Update Stock**: Edit the listing and change the stock quantity
- **Disable Stock Management**: Toggle off to return to unlimited availability
- **Bulk Updates**: Use the import/export feature to update stock for multiple items

#### Important Notes

- Stock is managed per game server - each server maintains its own inventory
- When importing shop configurations, stock values are preserved unless explicitly overridden
- Deleting or setting a listing to draft will cancel all pending orders and restore their stock
```