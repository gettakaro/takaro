# Implementation Tasks for Shop Listing Icon and Description Enhancements

## Overview

Implementation follows an incremental approach across 5 phases: database foundation, backend image processing, API integration, frontend components, and comprehensive testing. Each phase builds on the previous, enabling partial deployment and testing.

## Phase 1: Database Foundation ✅
Establish the data layer with proper constraints and migration support.

- [x] Task 1: Create database migration for new fields
  - **Prompt**: Create a Knex migration file that adds icon (TEXT) and description (TEXT) nullable columns to the shopListing table. Include CHECK constraints: icon length <= 350000 characters and description length <= 500 characters. Follow the pattern from 20250305210650-more-module-metadata.ts for constraint syntax. Include proper up() and down() functions for reversibility.
  - **Requirements**: REQ-005, REQ-006, Data Migration
  - **Design ref**: Section 3 - Data Models
  - **Files**: packages/lib-db/src/migrations/sql/20250808151626-shop-listing-icon-description.ts

- [x] Task 2: Update ShopListingModel with new fields
  - **Prompt**: Extend the ShopListingModel class in shopListing.ts to include optional icon and description string fields. Add appropriate TypeScript types and ensure fields are included in relation mappings.
  - **Requirements**: REQ-005, REQ-006
  - **Design ref**: Section 3 - Data Models
  - **Files**: packages/app-api/src/db/shopListing.ts

## Phase 2: Backend Image Processing ✅
Create the core image processing service with Sharp integration.

- [x] Task 3: Create ImageProcessingService class
  - **Prompt**: Create a new ImageProcessingService class that processes uploaded images using Sharp. Implement processShopIcon method that: extracts base64 data, validates image format, resizes to 256x256 WEBP, applies quality optimization (80% first pass, 60% if too large), enforces 250KB limit, and returns processed base64. Include proper error handling for invalid formats and size violations.
  - **Requirements**: REQ-002, REQ-003, REQ-004, NFR-001, NFR-002
  - **Design ref**: Section 3 - Implementation Details
  - **Files**: packages/app-api/src/service/ImageProcessingService.ts

- [x] Task 4: Add unit tests for ImageProcessingService
  - **Prompt**: Create comprehensive unit tests for ImageProcessingService covering: valid PNG/JPG/WEBP processing, size constraint enforcement, quality reduction logic, corrupt image handling, invalid format rejection, and base64 encoding/decoding. Use Jest and create mock image data for testing.
  - **Requirements**: NFR-002
  - **Design ref**: Section 3 - Testing Strategy
  - **Files**: packages/app-api/src/service/__tests__/ImageProcessingService.unit.test.ts

## Phase 3: API Layer Integration ✅
Extend DTOs and controllers to handle new fields with proper validation.

- [x] Task 5: Update Shop DTOs with icon and description
  - **Prompt**: Extend ShopListingOutputDTO, ShopListingCreateDTO, and ShopListingUpdateDTO to include optional icon (string) and description (string) fields. Add @IsOptional(), @IsString(), and @MaxLength(500) validators for description. Follow existing DTO patterns in the file.
  - **Requirements**: REQ-006, REQ-008, API Requirements
  - **Design ref**: Section 3 - Components (DTOs)
  - **Files**: packages/app-api/src/service/Shop/dto.ts

- [x] Task 6: Update ShopListingRepo for new fields
  - **Prompt**: Modify ShopListingRepo's create() and update() methods to handle icon and description fields. Ensure find() and findOne() methods return these fields. Handle null values appropriately and maintain backward compatibility.
  - **Requirements**: REQ-005, REQ-006, NFR-004
  - **Design ref**: Section 3 - Components (Repository)
  - **Files**: packages/app-api/src/db/shopListing.ts

- [x] Task 7: Integrate image processing in controller
  - **Prompt**: Modify ShopListingController's create and update endpoints to process icon field through ImageProcessingService before passing to service layer. Add try-catch for image processing errors and return appropriate error messages. Ensure description is passed through without modification.
  - **Requirements**: REQ-001, REQ-002, REQ-008
  - **Design ref**: Section 3 - Components (Controller)
  - **Files**: packages/app-api/src/controllers/Shop/Listing.ts

## Phase 4: Frontend Components
Add upload interface and display components with proper validation and fallback.

- [ ] Task 8: Add image upload to shop listing form
  - **Prompt**: Extend ShopListingCreateUpdateForm to include an image file input with preview. Implement file-to-base64 conversion, client-side validation for accepted formats (PNG/JPG/WEBP), file size warning for uploads over 5MB, and preview display. Add to form schema validation.
  - **Requirements**: REQ-001, NFR-003, US-001
  - **Design ref**: Section 3 - Components (Form)
  - **Files**: packages/web-main/src/routes/_auth/gameserver.$gameServerId/-components/-ShopListingCreateUpdateForm.tsx

- [ ] Task 9: Add description field to shop listing form
  - **Prompt**: Add a textarea input for description with 500 character limit and real-time character counter. Include in form validation schema. Display remaining characters and prevent input beyond limit.
  - **Requirements**: REQ-006, US-002
  - **Design ref**: Section 3 - Components (Form)
  - **Files**: packages/web-main/src/routes/_auth/gameserver.$gameServerId/-components/-ShopListingCreateUpdateForm.tsx

- [ ] Task 10: Update ShopListingCard to display custom icon
  - **Prompt**: Modify ShopListingCard to display custom icon when available. Implement conditional rendering: show listing.icon if exists, otherwise fall back to default icon path. Add onError handler to revert to default icon if custom icon fails to load.
  - **Requirements**: REQ-007, US-003
  - **Design ref**: Section 3 - Components (Card)
  - **Files**: packages/web-main/src/components/cards/ShopListingCard/index.tsx

- [ ] Task 11: Update ShopListingCard to display description
  - **Prompt**: Add description section below item list in ShopListingCard. Only render if description exists. Apply text truncation for long descriptions with "show more" option. Ensure text is properly escaped for XSS prevention.
  - **Requirements**: REQ-008, US-004
  - **Design ref**: Section 3 - Components (Card)
  - **Files**: packages/web-main/src/components/cards/ShopListingCard/index.tsx

- [ ] Task 12: Update ShopTableView for icons and descriptions
  - **Prompt**: Modify ShopTableView to show custom icons in table rows (with fallback) and add description column with truncation at 100 characters. Implement tooltip to show full description on hover. Handle missing data gracefully.
  - **Requirements**: US-003, US-004
  - **Design ref**: Section 3 - Components (Table)
  - **Files**: packages/web-main/src/routes/_auth/gameserver.$gameServerId/-components/shop/ShopTableView.tsx

## Phase 5: Testing and Validation
Comprehensive testing to ensure all requirements are met.

- [ ] Task 13: Create integration tests for shop listing API
  - **Prompt**: Write integration tests that: create listing with valid icon and description, update existing listing with new icon, clear icon (set to null), test description length validation, test image size rejection, test invalid image format rejection. Follow existing test patterns in ShopListing.integration.test.ts.
  - **Requirements**: All functional requirements
  - **Design ref**: Section 3 - Testing Strategy
  - **Files**: packages/app-api/src/controllers/__tests__/Shop/ShopListingIconDescription.integration.test.ts

- [ ] Task 14: Update existing shop listing tests
  - **Prompt**: Update existing shop listing test fixtures and snapshots to include new icon and description fields (as undefined for backward compatibility). Ensure all existing tests still pass.
  - **Requirements**: NFR-004
  - **Design ref**: Section 3 - Testing Strategy
  - **Files**: packages/app-api/src/controllers/__tests__/Shop/ShopListing.integration.test.ts, packages/test/src/__snapshots__/Shop/**

- [ ] Task 15: Add E2E test for icon upload workflow
  - **Prompt**: Create E2E test using Playwright that: navigates to shop listing creation, uploads an image file, verifies preview display, submits form, and confirms icon displays in shop view. Test fallback behavior when icon fails to load.
  - **Requirements**: US-001, US-003
  - **Design ref**: User Workflows
  - **Files**: packages/e2e/src/web-main/shop-icon-upload.spec.ts

## Success Criteria

✅ All tasks completed successfully  
✅ Database migration applied without errors  
✅ Icons process to 256x256 WEBP under 250KB  
✅ Descriptions limited to 500 characters  
✅ Custom icons display with proper fallback  
✅ All tests pass (unit, integration, E2E)  
✅ No performance degradation  
✅ Backward compatibility maintained  

## Implementation Order

1. **Phase 1** first (enables data storage)
2. **Phase 2** next (core processing logic)
3. **Phase 3** (API integration)
4. **Phase 4** (frontend) - can start after Phase 3
5. **Phase 5** throughout and at end

## Notes

- Each task is independently implementable within 15-60 minutes
- Tasks reference specific design patterns from existing code
- All file paths are relative to repository root
- Database changes are reversible via migration down()
- Frontend changes gracefully handle missing data