# Transaction Context Tracking Design

## Problem Statement

Currently, Takaro uses AsyncLocalStorage for context tracking (user, domain, gameServer) but handles database transactions locally within each method. This leads to several issues:

1. **Multiple Separate Transactions**: Operations that should be atomic are split across multiple transactions
2. **Complex Code**: Methods need to pass `trx` objects between each other, leading to complex function signatures
3. **Inconsistent State Risk**: If one transaction succeeds and another fails, the system can end up in an inconsistent state
4. **Service Composition Challenges**: Services calling other services cannot share transactions easily

### Example of Current Approach

```typescript
// Current: Complex transaction passing
async createOrder(listingId: string, amount: number) {
  const model = await this.getModel();
  const knex = model.knex();
  
  return knex.transaction(async (trx) => {
    // Must pass trx to every method
    const listing = await this.findOne(listingId, trx);
    await this.decrementStock(listingId, amount, trx);
    await playerService.deductCurrency(playerId, price, trx);
    return await this.orderRepo.create(orderData, trx);
  });
}
```

## Proposed Solution

Extend the existing AsyncLocalStorage context system to include transaction tracking. This allows all database operations within a transaction boundary to automatically use the same transaction without explicit passing.

### Benefits

1. **Single Transaction**: All operations share one transaction automatically
2. **Clean Code**: No need to pass `trx` objects around
3. **Service Composition**: Services can call other services and share transactions transparently
4. **Automatic Rollback**: On any error, entire transaction rolls back
5. **Backwards Compatible**: Services not using transactions continue to work as before

## Technical Design

### 1. Enhanced Context Interface

Location: `packages/lib-util/src/context.ts`

```typescript
import { Knex } from 'knex';

interface TransactionStore {
  domain?: string;
  gameServer?: string;
  jobId?: string;
  user?: string;
  module?: string;
  transaction?: Knex.Transaction; // NEW: Add transaction tracking
}

class Context {
  private asyncLocalStorage = new AsyncLocalStorage();
  
  // NEW: Transaction management methods
  async runInTransaction<T>(
    knex: Knex,
    callback: () => Promise<T>
  ): Promise<T> {
    // If already in a transaction, use it
    if (this.data.transaction) {
      return callback();
    }
    
    // Start new transaction and store in context
    return knex.transaction(async (trx) => {
      this.addData({ transaction: trx });
      try {
        const result = await callback();
        return result;
      } finally {
        // Clean up transaction from context
        const { transaction, ...rest } = this.data;
        this.asyncLocalStorage.enterWith(rest);
      }
    });
  }
  
  get transaction(): Knex.Transaction | undefined {
    return this.data.transaction;
  }
  
  hasTransaction(): boolean {
    return !!this.data.transaction;
  }
}
```

### 2. Enhanced Repository Base Class

Location: `packages/app-api/src/db/base.ts`

```typescript
export abstract class ITakaroRepo<...> {
  async getModel() {
    const knex = await this.getKnex();
    const model = Model.bindKnex(knex);
    
    // NEW: Use transaction from context if available
    const query = ctx.transaction 
      ? model.query(ctx.transaction)
      : model.query();
    
    return {
      model,
      query: query.modify('domainScoped', this.domainId),
      knex, // Expose knex for transaction creation
    };
  }
}
```

### 3. Service Implementation Example

With these enhancements, services become much cleaner:

```typescript
async createOrder(listingId: string, amount: number): Promise<ShopOrderOutputDTO> {
  const { knex } = await this.repo.getModel();
  
  // Everything happens in ONE transaction via context
  return ctx.runInTransaction(knex, async () => {
    // All operations automatically use the context transaction
    const listing = await this.findOne(listingId); // Uses ctx.transaction
    
    if (listing.stock < amount) {
      throw new errors.BadRequestError('Insufficient stock');
    }
    
    // These all use the context transaction automatically
    await this.repo.decrementStock(listingId, amount);
    await playerService.deductCurrency(playerId, price);
    const order = await this.orderRepo.create(orderData);
    
    return order;
  });
}
```

## Implementation Considerations

### 1. Transaction Lifecycle
- Transactions must be properly closed to avoid connection pool exhaustion
- Use try/finally blocks to ensure cleanup
- Monitor transaction duration to avoid long-running transactions

### 2. Nested Transactions
```typescript
// Handle nested transaction attempts gracefully
async runInTransaction(knex, callback) {
  if (this.hasTransaction()) {
    // Already in transaction, just run callback
    return callback();
  }
  // Start new transaction...
}
```

### 3. Error Handling
- Any unhandled error automatically rolls back the transaction
- Services should not catch and suppress errors that should trigger rollback
- Log transaction boundaries for debugging

### 4. Connection Pool Considerations
- Each transaction holds a database connection
- Long transactions can exhaust the connection pool
- Consider transaction timeout settings

### 5. Testing
```typescript
// Test helpers for transaction management
beforeEach(() => {
  // Clear any lingering transaction context
  ctx.addData({ transaction: undefined });
});

it('should rollback on error', async () => {
  await expect(
    service.performOperation()
  ).rejects.toThrow('Expected error');
  
  // Verify no changes were committed
  const result = await service.findOne(id);
  expect(result).toEqual(originalValue);
});
```

### 6. Debugging
- Add transaction ID to context for tracing
- Log transaction start/commit/rollback
- Use debug mode to track transaction boundaries

## Migration Strategy

1. **Phase 1**: Implement context enhancements without changing existing code
2. **Phase 2**: Gradually update high-value operations (like createOrder)
3. **Phase 3**: Update remaining operations as needed
4. **Phase 4**: Remove legacy transaction passing code

## Performance Implications

- Slightly more memory usage for context storage (~100 bytes per request)
- Negligible performance impact from context lookups (<1μs)
- Potential performance gain from reduced transaction overhead
- Better connection pool utilization

## Security Considerations

- Transaction context is request-scoped and cannot leak between requests
- No sensitive data stored in transaction context
- Automatic cleanup prevents connection leaks

## Compatibility

- Fully backwards compatible with existing code
- Services can opt-in to using context transactions
- Gradual migration path available
- No breaking changes to existing APIs