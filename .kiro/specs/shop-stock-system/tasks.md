# Implementation Plan

- [ ] 1. Create database migration for stock fields
  - Add stock and stockEnabled columns to shopListing table
  - Add database constraints for stock validation
  - Set default values for existing listings
  - _Requirements: 8.1_

- [ ] 2. Extend ShopListingModel with stock fields
  - Add stock and stockEnabled properties to the model
  - Update model validation rules
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3. Create stock-related DTOs
  - Extend ShopListingCreateDTO and ShopListingUpdateDTO with stock fields
  - Create StockUpdateDTO and StockAddDTO for stock management operations
  - Add validation decorators for stock values
  - _Requirements: 3.1, 3.2, 4.2, 4.3_

- [ ] 4. Extend ShopListingOutputDTO with stock information
  - Add stock and stockEnabled fields to output DTO
  - Implement computed properties for isInStock and isUnlimitedStock
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 5. Create custom error classes for stock validation
  - Implement OutOfStockError for insufficient stock scenarios
  - Implement StockValidationError for invalid stock operations
  - _Requirements: 2.2, 2.3, 3.4_

- [ ] 6. Extend ShopListingRepo with stock management methods
  - Implement decrementStock method with transaction support
  - Implement incrementStock method with transaction support
  - Implement setStock method for absolute stock updates
  - Implement addStock method for relative stock updates
  - Implement findOneForUpdate method for row locking
  - _Requirements: 4.2, 4.3, 5.1, 6.1, 6.3_

- [ ] 7. Update ShopListingService with stock validation logic
  - Implement setStock method with validation
  - Implement addStock method with validation
  - Implement checkStockAvailability method
  - Update existing methods to handle stock-enabled listings
  - _Requirements: 3.2, 4.2, 4.3, 4.5_

- [ ] 8. Update order creation logic with stock validation
  - Modify ShopListingService.createOrder to check stock availability
  - Implement atomic stock decrement during order creation
  - Add retry logic for concurrent purchase scenarios
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.3, 6.4_

- [ ] 9. Update order cancellation logic with stock restoration
  - Modify ShopOrderService.cancelOrder to restore stock
  - Implement atomic stock increment during order cancellation
  - Add validation to prevent stock restoration for deleted listings
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10. Add stock management endpoints to ShopListingController
  - Implement PUT /:id/stock endpoint for setting absolute stock
  - Implement POST /:id/stock/add endpoint for adding stock
  - Add proper authorization and validation middleware
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 11. Implement stock-related event emissions
  - Add event emission for stock updates in ShopListingService
  - Add event emission for stock consumption during purchases
  - Add event emission for stock restoration during cancellations
  - Add event emission for out-of-stock scenarios
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 12. Create integration tests for stock management
  - Test stock setting and updating operations
  - Test stock validation and error scenarios
  - Test unlimited vs finite stock behavior
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 13. Create integration tests for purchase flow with stock
  - Test successful purchases with stock decrement
  - Test purchase rejection when out of stock
  - Test purchase rejection when requesting more than available
  - Test stock display in listing queries
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_

- [ ] 14. Create integration tests for order cancellation with stock restoration
  - Test stock restoration on order cancellation
  - Test error handling when cancellation fails
  - Test stock limits during restoration
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 15. Create integration tests for concurrent purchase scenarios
  - Test race condition prevention with multiple simultaneous purchases
  - Test atomic stock operations under high load
  - Test deadlock recovery and retry mechanisms
  - _Requirements: 2.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 16. Create integration tests for event emissions
  - Test stock change events during admin operations
  - Test stock consumption events during purchases
  - Test stock restoration events during cancellations
  - Test out-of-stock events when stock reaches zero
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 17. Update import/export functionality for stock fields
  - Add stock fields to shop listing import format
  - Add stock fields to shop listing export format
  - Handle stock defaults during import operations
  - _Requirements: 8.3, 8.4_

- [ ] 18. Add database indexes for stock queries
  - Create index on (stockEnabled, stock) for efficient stock filtering
  - Add partial indexes for stock-enabled listings
  - _Requirements: Performance optimization_