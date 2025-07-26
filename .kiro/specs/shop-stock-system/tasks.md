# Implementation Tasks for Shop Stock System

## Overview

This implementation is divided into two major parts: first, we'll implement a transaction context system using AsyncLocalStorage to enable clean transaction handling across services, then we'll implement the stock management feature. This approach ensures all operations within an order (stock, currency, order creation) happen atomically in a single database transaction.

## Phase 1: Core Transaction Context Infrastructure
Implement AsyncLocalStorage-based transaction tracking to enable single transactions across multiple services.

- [ ] Task 1: Enhance Context class with transaction support
  - **Prompt**: Extend the Context class in packages/lib-util/src/context.ts to add transaction tracking. Add a transaction field to TransactionStore interface, implement runInTransaction method that manages transaction lifecycle, and add transaction getter and hasTransaction methods. Follow the existing pattern for context data management.
  - **Requirements**: Design ref AsyncLocalStorage section
  - **Design ref**: Section "AsyncLocalStorage Transaction Tracking"
  - **Files**: packages/lib-util/src/context.ts

- [ ] Task 2: Update ITakaroRepo base class for context transactions
  - **Prompt**: Modify the ITakaroRepo base class in packages/app-api/src/db/base.ts to check for a transaction in the context. Update the getModel() method to use ctx.transaction if available, otherwise use a regular query. Ensure the knex instance is exposed in the return value for transaction creation.
  - **Requirements**: Design ref AsyncLocalStorage section
  - **Design ref**: Section "Enhanced Repository Base Class"
  - **Files**: packages/app-api/src/db/base.ts

- [ ] Task 3: Update repository query patterns
  - **Prompt**: Create helper methods in ITakaroRepo for common transaction-aware operations like findOneForUpdate. These should automatically use the context transaction if available. Include proper TypeScript types.
  - **Requirements**: Design ref AsyncLocalStorage section
  - **Design ref**: Section "Enhanced Repository Base Class"
  - **Files**: packages/app-api/src/db/base.ts

## Phase 2: Migrate Existing Transactions
Update existing transaction usage to use the new context-based system.

- [ ] Task 4: Migrate PlayerOnGameserver currency operations
  - **Prompt**: Refactor deductCurrency and addCurrency methods in PlayerOnGameServerService to use context transactions. Remove the internal transaction creation and instead check if running within a transaction context. Update the repository methods to use the context transaction when available.
  - **Requirements**: REQ-010
  - **Design ref**: Section "Service Implementation"
  - **Files**: packages/app-api/src/service/PlayerOnGameserverService.ts, packages/app-api/src/db/playerOnGameserver.ts

- [ ] Task 5: Migrate PlayerOnGameserver transact method
  - **Prompt**: Refactor the transact method in PlayerOnGameServerRepo to use context transactions. This method transfers currency between players and should use ctx.runInTransaction at the service level instead of creating its own transaction.
  - **Requirements**: REQ-010
  - **Design ref**: Section "Service Implementation"
  - **Files**: packages/app-api/src/db/playerOnGameserver.ts, packages/app-api/src/service/PlayerOnGameserverService.ts

- [ ] Task 6: Migrate Shop claimOrder transaction
  - **Prompt**: Refactor the claimOrder method in ShopListingService to use ctx.runInTransaction instead of manually managing transactions. Remove the complex transaction management code and rely on context transactions. Ensure the two-phase approach (DB transaction then external calls) is maintained.
  - **Requirements**: REQ-010
  - **Design ref**: Section "Service Implementation"
  - **Files**: packages/app-api/src/service/Shop/index.ts

- [ ] Task 7: Migrate ShopCategory bulk operations
  - **Prompt**: Update the bulkAssignListingsToCategories method in ShopCategoryRepo to use context transactions instead of creating its own transaction. Move transaction management to the service layer.
  - **Requirements**: Design ref AsyncLocalStorage section
  - **Design ref**: Section "Service Implementation"
  - **Files**: packages/app-api/src/db/shopCategory.ts, packages/app-api/src/service/Shop/ShopCategoryService.ts

- [ ] Task 8: Migrate Ban service transactions
  - **Prompt**: Update any transaction usage in the Ban service and repository to use context transactions. Ensure atomic operations for ban creation and related updates.
  - **Requirements**: Design ref AsyncLocalStorage section
  - **Design ref**: Section "Service Implementation"
  - **Files**: packages/app-api/src/db/ban.ts, packages/app-api/src/service/BanService.ts

## Phase 3: Database Schema for Stock
Add stock management fields to the shop listing table.

- [ ] Task 9: Create stock management database migration
  - **Prompt**: Create a new migration file that adds stockManagementEnabled (boolean, default false) and stock (integer, nullable) columns to the shopListing table. Add a check constraint ensuring stock is null when stockManagementEnabled is false, or >= 0 when true. Add a partial index on stock fields for performance.
  - **Requirements**: REQ-001, REQ-002, REQ-003, REQ-024
  - **Design ref**: Section "Database Migration"
  - **Files**: packages/lib-db/src/migrations/sql/[timestamp]-add-shop-stock.ts

- [ ] Task 10: Update ShopListingModel with stock fields
  - **Prompt**: Add stockManagementEnabled and stock fields to ShopListingModel in the database model. Ensure proper TypeScript types are used.
  - **Requirements**: REQ-001
  - **Design ref**: Section "ShopListingModel Extension"
  - **Files**: packages/app-api/src/db/shopListing.ts

- [ ] Task 11: Update Shop DTOs with stock fields
  - **Prompt**: Add stock management fields to ShopListingCreateDTO, ShopListingUpdateDTO, and ShopListingOutputDTO. Include proper validation decorators: stockManagementEnabled as optional boolean, stock as optional number with @Min(0) and @ValidateIf for when stock management is enabled.
  - **Requirements**: REQ-001, REQ-002
  - **Design ref**: Section "ShopListing DTOs Extension"
  - **Files**: packages/app-api/src/service/Shop/dto.ts

## Phase 4: Stock Management Implementation
Implement the core stock management functionality.

- [ ] Task 12: Add stock repository methods
  - **Prompt**: Implement decrementStock and incrementStock methods in ShopListingRepo. These should use atomic SQL operations (UPDATE with WHERE clause checking sufficient stock). Both methods should automatically use context transaction if available. Include proper error handling for insufficient stock.
  - **Requirements**: REQ-009, REQ-010
  - **Design ref**: Section "ShopListingRepo New Methods"
  - **Files**: packages/app-api/src/db/shopListing.ts

- [ ] Task 13: Implement stock validation in createOrder
  - **Prompt**: Modify the createOrder method in ShopListingService to use ctx.runInTransaction and include stock validation. Check if stockManagementEnabled is true, validate sufficient stock, and decrement stock atomically within the same transaction as currency deduction and order creation. Use the design pattern shown in the AsyncLocalStorage section.
  - **Requirements**: REQ-007, REQ-008, REQ-009, REQ-010, REQ-011
  - **Design ref**: Section "ShopListingService Extensions"
  - **Files**: packages/app-api/src/service/Shop/index.ts

- [ ] Task 14: Implement stock restoration in cancelOrder
  - **Prompt**: Update the cancelOrder method in ShopListingService to restore stock when an order is canceled. Use ctx.runInTransaction to ensure stock restoration happens in the same transaction as the order status update and currency refund. Only restore stock if stockManagementEnabled is true for the listing.
  - **Requirements**: REQ-012
  - **Design ref**: Section "ShopListingService cancelOrder() Method Extension"
  - **Files**: packages/app-api/src/service/Shop/index.ts

- [ ] Task 15: Update listing update method for stock management
  - **Prompt**: Enhance the update method in ShopListingService to handle stock management changes. Validate that stock quantity is provided when enabling stock management. Emit SHOP_STOCK_UPDATED event when stock changes.
  - **Requirements**: REQ-005, REQ-006, REQ-022
  - **Design ref**: Section "ShopListingService update() Method Extension"
  - **Files**: packages/app-api/src/service/Shop/index.ts

- [ ] Task 16: Handle stock in listing deletion
  - **Prompt**: Update the delete method in ShopListingService to handle orders properly when a listing with stock management is deleted. The existing code already cancels pending orders, which will trigger stock restoration through the cancelOrder method.
  - **Requirements**: REQ-014
  - **Design ref**: Section "Implementation Details"
  - **Files**: packages/app-api/src/service/Shop/index.ts

## Phase 5: Event System Integration
Add stock-related events to the system.

- [ ] Task 17: Define stock event types and data classes
  - **Prompt**: Add SHOP_STOCK_EMPTY and SHOP_STOCK_UPDATED to TakaroEvents constant. Create TakaroEventShopStockEmpty and TakaroEventShopStockUpdated classes extending BaseEvent with proper validation decorators. Include fields: listingId (UUID), listingName (string), and for stock updated: oldStock (optional number), newStock (number), stockManagementEnabled (boolean).
  - **Requirements**: REQ-021, REQ-022
  - **Design ref**: Section "Event System Extensions"
  - **Files**: packages/lib-modules/src/dto/takaroEvents.ts

- [ ] Task 18: Emit stock events in service methods
  - **Prompt**: Add event emission for SHOP_STOCK_EMPTY when stock reaches zero after a purchase in createOrder. Emit SHOP_STOCK_UPDATED in the update method when stock values change. Ensure events are emitted after transaction commit.
  - **Requirements**: REQ-021, REQ-022
  - **Design ref**: Section "ShopListingService Extensions"
  - **Files**: packages/app-api/src/service/Shop/index.ts

## Phase 6: Stock Import/Export
Ensure stock values are included in shop import/export functionality.

- [ ] Task 19: Include stock in shop export
  - **Prompt**: Update the shop export functionality to include stockManagementEnabled and stock fields in the exported data. Follow the existing pattern for shop exports.
  - **Requirements**: REQ-019, REQ-020
  - **Design ref**: Section "Implementation Details"
  - **Files**: packages/app-api/src/service/Shop/index.ts

- [ ] Task 20: Handle stock in shop import
  - **Prompt**: Update the shop import functionality to handle stockManagementEnabled and stock fields. Ensure stock values are preserved during import unless explicitly overridden in import options.
  - **Requirements**: REQ-019, REQ-020, REQ-026
  - **Design ref**: Section "Implementation Details"
  - **Files**: packages/app-api/src/service/Shop/index.ts

## Phase 7: Testing
Add comprehensive tests for stock management functionality.

- [ ] Task 21: Create stock management integration tests
  - **Prompt**: Create ShopStockManagement.integration.test.ts with tests for enabling/disabling stock management, setting initial stock, updating stock quantities, and attempting to set negative stock. Use the existing IntegrationTest pattern and shopSetup fixture.
  - **Requirements**: REQ-001, REQ-002, REQ-005, REQ-006
  - **Design ref**: Section "Testing Strategy"
  - **Files**: packages/app-api/src/controllers/__tests__/Shop/ShopStockManagement.integration.test.ts

- [ ] Task 22: Create stock validation integration tests
  - **Prompt**: Create ShopStockValidation.integration.test.ts testing purchase scenarios: sufficient stock, exact stock amount, insufficient stock, multiple items, and unlimited stock listings. Verify proper error messages for stock-related failures.
  - **Requirements**: REQ-007, REQ-008, REQ-011
  - **Design ref**: Section "Testing Strategy"
  - **Files**: packages/app-api/src/controllers/__tests__/Shop/ShopStockValidation.integration.test.ts

- [ ] Task 23: Create concurrent order tests for stock
  - **Prompt**: Create ShopStockConcurrency.integration.test.ts testing multiple concurrent orders with limited stock. Verify that when stock=1, only one order succeeds. Test mixed scenarios where some orders succeed and others fail due to insufficient stock.
  - **Requirements**: REQ-010
  - **Design ref**: Section "Testing Strategy"
  - **Files**: packages/app-api/src/controllers/__tests__/Shop/ShopStockConcurrency.integration.test.ts

- [ ] Task 24: Create stock restoration tests
  - **Prompt**: Create ShopStockCancellation.integration.test.ts testing order cancellation with stock restoration. Verify stock is restored when orders are canceled, but not when orders are already completed. Test cancellation for listings without stock management.
  - **Requirements**: REQ-012, REQ-013
  - **Design ref**: Section "Testing Strategy"
  - **Files**: packages/app-api/src/controllers/__tests__/Shop/ShopStockCancellation.integration.test.ts

## Phase 8: Frontend Integration
Update the frontend to display stock information and handle stock events.

- [ ] Task 25: Add stock event handling in EventItem
  - **Prompt**: Add case statements for ShopStockEmpty and ShopStockUpdated events in EventItem.tsx switch statement. Display appropriate event properties including gameserver, listing name, and stock values. Follow the existing pattern for shop events around line 200.
  - **Requirements**: Design ref Frontend section
  - **Design ref**: Section "Event Display in EventItem.tsx"
  - **Files**: packages/web-main/src/components/events/EventFeed/EventItem.tsx

- [ ] Task 26: Update event categorization for stock events
  - **Prompt**: Add ShopStockEmpty and ShopStockUpdated to the Economy category in eventNames.tsx. Import the enum values and add them to the events array.
  - **Requirements**: Design ref Frontend section
  - **Design ref**: Section "Event Categorization Update"
  - **Files**: packages/web-main/src/components/selects/EventNameSelectField/eventNames.tsx

- [ ] Task 27: Update ShopListingCard to display stock
  - **Prompt**: Modify ShopListingCard component to display stock information when stockManagementEnabled is true. Show "Out of Stock" for zero stock, "Stock: X" for available items, or no stock display for unlimited items. Style out-of-stock items appropriately.
  - **Requirements**: REQ-010, REQ-016, REQ-017
  - **Design ref**: Section "Frontend Event Integration"
  - **Files**: packages/web-main/src/components/cards/ShopListingCard/index.tsx

- [ ] Task 28: Add stock management UI in shop admin
  - **Prompt**: Update the shop listing form to include stock management controls: a toggle for stockManagementEnabled and a number input for stock quantity (shown only when enabled). Add validation to require stock value when enabling stock management.
  - **Requirements**: REQ-001, REQ-005, REQ-006
  - **Design ref**: Section "Components and Interfaces"
  - **Files**: packages/web-main/src/routes/_auth/gameserver.$gameServerId/shop/listing.create.tsx, packages/web-main/src/routes/_auth/gameserver.$gameServerId/shop/listing.$listingId.update.tsx

## Phase 9: Documentation
Update user-facing documentation for the stock management feature.

- [ ] Task 29: Update economy documentation
  - **Prompt**: Add a "Stock Management" section to economy.md after "Shop Functionalities". Include subsections for enabling stock management, stock visibility for admins vs players, managing stock, and important notes about per-server inventory and import/export behavior. Follow the markdown structure in the design document.
  - **Requirements**: User documentation requirement
  - **Design ref**: Section "User Documentation Updates"
  - **Files**: packages/web-docs/docs/economy.md

- [ ] Task 30: Generate API documentation
  - **Prompt**: Run the API documentation generation to update the generated docs with new stock-related DTOs and endpoints. This ensures the API reference includes stock management fields.
  - **Requirements**: API documentation
  - **Design ref**: Section "Data Models"
  - **Files**: Run documentation generation command