# Design Document

## Overview

The shop stock system adds inventory management capabilities to the existing shop functionality. The system will track stock levels for each shop listing, prevent overselling through database-level concurrency control, and provide administrative interfaces for stock management. The design prioritizes data consistency and race condition prevention while maintaining compatibility with existing shop features.

## Architecture

### Database Schema Changes

The stock system will extend the existing `shopListing` table with stock-related fields:

```sql
ALTER TABLE shopListing ADD COLUMN stock INTEGER;
ALTER TABLE shopListing ADD COLUMN stockEnabled BOOLEAN DEFAULT FALSE;
ALTER TABLE shopListing ADD CONSTRAINT stock_non_negative CHECK (stock >= 0);
```

- `stock`: Current stock quantity (0+ indicates finite stock)
- `stockEnabled`: Boolean flag to enable/disable stock tracking for the listing
- Constraint ensures stock is non-negative

### Stock Management Strategy

**Unlimited Stock (Default Behavior)**
- `stockEnabled = false`: No stock limitations
- Maintains backward compatibility with existing listings
- No stock checks during purchase

**Finite Stock**
- `stockEnabled = true` AND `stock >= 0`: Stock tracking enabled
- Stock decrements on successful orders
- Stock increments on order cancellations
- Purchase blocked when stock = 0

### Concurrency Control

The system uses database-level row locking to prevent race conditions:

1. **SELECT FOR UPDATE**: Lock the listing row during stock checks
2. **Atomic Operations**: Stock updates within database transactions
3. **Optimistic Locking**: Retry mechanism for deadlock scenarios
4. **Isolation Level**: Use READ COMMITTED to balance consistency and performance

## Components and Interfaces

### Database Layer Updates

**ShopListingModel Extensions**
```typescript
export class ShopListingModel extends TakaroModel {
  // ... existing fields
  stock?: number;
  stockEnabled: boolean;
}
```

**ShopListingRepo Extensions**
```typescript
export class ShopListingRepo {
  // New methods for stock management
  async decrementStock(listingId: string, amount: number, trx?: Knex.Transaction): Promise<void>
  async incrementStock(listingId: string, amount: number, trx?: Knex.Transaction): Promise<void>
  async setStock(listingId: string, stock: number): Promise<ShopListingOutputDTO>
  async addStock(listingId: string, amount: number): Promise<ShopListingOutputDTO>
  async findOneForUpdate(id: string, trx: Knex.Transaction): Promise<ShopListingOutputDTO>
  async findManyWithStockInfo(filters: any): Promise<ShopListingOutputDTO[]>
}
```

### Service Layer Updates

**ShopListingService Extensions**
```typescript
export class ShopListingService {
  // Stock management methods
  async setStock(listingId: string, stock: number): Promise<ShopListingOutputDTO>
  async addStock(listingId: string, amount: number): Promise<ShopListingOutputDTO>
  async checkStockAvailability(listingId: string, requestedAmount: number): Promise<boolean>
  
  // Updated order creation with stock validation
  async createOrder(listingId: string, amount: number, playerIdOverride?: string): Promise<ShopOrderOutputDTO>
}
```

**ShopOrderService Extensions**
```typescript
export class ShopOrderService {
  // Updated order cancellation with stock restoration
  async cancelOrder(orderId: string): Promise<ShopOrderOutputDTO>
  
  // Helper method for stock restoration
  private async restoreStock(listingId: string, amount: number): Promise<void>
}
```

### Controller Layer Updates

**ShopListingController Extensions**
```typescript
@JsonController('/shop/listing')
export class ShopListingController {
  // New stock management endpoints
  @Put('/:id/stock')
  async setStock(@Params() params: ParamId, @Body() data: StockUpdateDTO): Promise<ShopListingOutputDTO>
  
  @Post('/:id/stock/add')
  async addStock(@Params() params: ParamId, @Body() data: StockAddDTO): Promise<ShopListingOutputDTO>
}
```

## Data Models

### DTO Extensions

**ShopListingOutputDTO**
```typescript
export class ShopListingOutputDTO extends TakaroModelDTO<ShopListingOutputDTO> {
  // ... existing fields
  @IsNumber()
  @IsOptional()
  stock?: number;
  
  @IsBoolean()
  stockEnabled: boolean;
  
  // Computed properties
  @IsBoolean()
  get isInStock(): boolean {
    return !this.stockEnabled || (this.stock !== undefined && this.stock > 0);
  }
  
  @IsBoolean()
  get isUnlimitedStock(): boolean {
    return !this.stockEnabled;
  }
}
```

**ShopListingCreateDTO & ShopListingUpdateDTO**
```typescript
export class ShopListingCreateDTO extends TakaroDTO<ShopListingCreateDTO> {
  // ... existing fields
  @IsNumber()
  @IsOptional()
  stock?: number;
  
  @IsBoolean()
  @IsOptional()
  stockEnabled?: boolean;
}

export class ShopListingUpdateDTO extends TakaroDTO<ShopListingUpdateDTO> {
  // ... existing fields
  @IsNumber()
  @IsOptional()
  stock?: number;
  
  @IsBoolean()
  @IsOptional()
  stockEnabled?: boolean;
}
```

**New DTOs for Stock Management**
```typescript
export class StockUpdateDTO extends TakaroDTO<StockUpdateDTO> {
  @IsNumber()
  @Min(0)
  stock: number; // 0+ for finite stock
}

export class StockAddDTO extends TakaroDTO<StockAddDTO> {
  @IsNumber()
  @Min(1)
  amount: number;
}
```

## Error Handling

### Stock-Related Errors

**OutOfStockError**
```typescript
export class OutOfStockError extends errors.BadRequestError {
  constructor(availableStock: number, requestedAmount: number) {
    super(`Insufficient stock. Available: ${availableStock}, Requested: ${requestedAmount}`);
  }
}
```

**StockValidationError**
```typescript
export class StockValidationError extends errors.BadRequestError {
  constructor(message: string) {
    super(`Stock validation failed: ${message}`);
  }
}
```

### Error Scenarios

1. **Purchase Exceeds Stock**: Return OutOfStockError with available quantity
2. **Concurrent Purchase Conflict**: Retry with exponential backoff (max 3 attempts)
3. **Invalid Stock Values**: Return StockValidationError
4. **Database Deadlock**: Retry transaction with backoff

## Testing Strategy

### Integration Tests

**Stock Management Logic**
- Test stock decrement/increment operations
- Test unlimited vs finite stock behavior
- Test stock validation rules
- Test error conditions and edge cases

**Concurrency Tests**
- Simulate concurrent purchase attempts
- Test race condition prevention
- Test deadlock recovery mechanisms
- Test transaction rollback scenarios

### Integration Tests

**End-to-End Purchase Flow**
- Test complete purchase flow with stock validation
- Test order cancellation stock restoration
- Test admin stock management operations
- Test stock display in listing queries

**Performance Tests**
- Test high-throughput purchase scenarios
- Measure transaction performance impact
- Test database lock contention
- Validate system behavior under load

### Test Scenarios

**Race Condition Tests**
```typescript
// Simulate 100 concurrent purchases of last item
const promises = Array(100).fill(null).map(() => 
  shopService.createOrder(listingId, 1, playerId)
);
const results = await Promise.allSettled(promises);
// Expect exactly 1 success, 99 failures
```

**Stock Restoration Tests**
```typescript
// Test order cancellation restores stock
const initialStock = 10;
await shopService.setStock(listingId, initialStock);
const order = await shopService.createOrder(listingId, 3, playerId);
await shopService.cancelOrder(order.id);
const listing = await shopService.findOne(listingId);
expect(listing.stock).toBe(initialStock);
```

## Migration Strategy

### Database Migration

```typescript
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopListing', (table) => {
    table.integer('stock').nullable();
    table.boolean('stockEnabled').defaultTo(false);
    table.check('stock >= 0');
  });
  
  // Set all existing listings to unlimited stock (stockEnabled = false)
  await knex('shopListing').update({
    stock: null,
    stockEnabled: false
  });
}
```

### Backward Compatibility

1. **Default Behavior**: All existing listings default to unlimited stock
2. **API Compatibility**: Stock fields are optional in existing endpoints
3. **Feature Flag**: Stock system can be disabled per listing
4. **Gradual Rollout**: Admins can enable stock tracking per listing

### Data Migration

- Existing listings: `stock = null, stockEnabled = false`
- Import/Export: Include stock fields with defaults
- Bulk Operations: Support stock settings in batch updates

## Event Integration

### Stock-Related Events

The system will emit events through the existing event system:

**Stock Level Events**
```typescript
// When stock reaches zero
EVENT_TYPES.SHOP_LISTING_OUT_OF_STOCK

// When stock is manually updated
EVENT_TYPES.SHOP_LISTING_STOCK_UPDATED

// When stock is automatically decremented
EVENT_TYPES.SHOP_LISTING_STOCK_CONSUMED
```

**Event Payloads**
```typescript
export class TakaroEventShopStockChanged {
  listingId: string;
  previousStock: number;
  newStock: number;
  changeReason: 'purchase' | 'cancellation' | 'admin_update' | 'admin_refill';
  orderId?: string; // Present for purchase/cancellation
  adminUserId?: string; // Present for admin actions
}
```

### Event Usage

- **Monitoring**: Track stock levels and consumption patterns
- **Notifications**: Alert admins when stock is low
- **Analytics**: Generate reports on inventory turnover
- **Automation**: Trigger restocking workflows

## Performance Considerations

### Database Optimizations

1. **Indexes**: Add index on `(stockEnabled, stock)` for efficient stock queries
2. **Query Optimization**: Use partial indexes for stock-enabled listings
3. **Connection Pooling**: Ensure adequate connection pool for concurrent transactions
4. **Lock Timeout**: Configure appropriate lock timeout values

### Caching Strategy

1. **Stock Display**: Cache stock levels with short TTL (30 seconds)
2. **Cache Invalidation**: Invalidate on stock changes
3. **Read Replicas**: Use read replicas for stock display queries
4. **Write-Through**: Update cache immediately after stock changes

### Monitoring

1. **Metrics**: Track stock-related database operations
2. **Alerts**: Monitor for high lock contention
3. **Performance**: Track transaction duration and retry rates
4. **Business Metrics**: Monitor stock turnover and out-of-stock events