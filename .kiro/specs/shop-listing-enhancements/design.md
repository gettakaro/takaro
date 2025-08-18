# Design: Shop Listing Icon and Description Enhancements

## Layer 1: Problem & Requirements

### Problem Statement

Shop listings in Takaro currently display generic item icons from the game server, making it difficult for server administrators to create visually distinctive offerings. Additionally, listings lack descriptive text, limiting the ability to provide context, instructions, or promotional information to players. This impacts the shopping experience and reduces the effectiveness of the in-game economy system.

### Current Situation (AS-IS)

Currently, shop listings:
- Display icons loaded from static files at `/icons/{gameServerType}/{item.code}.png`
- Use fallback to item name initials when icon fails to load
- Have only a "name" field for identification
- Are stored in the `shopListing` table with minimal metadata
- Support categories for organization but no descriptive content

**Current Data Flow:**
```
Database (shopListing) → API (ShopListingOutputDTO) → Frontend (ShopListingCard)
                            ↓
                    Static Icon Files (/icons/...)
```

**Pain Points:**
1. Cannot differentiate special bundles or promotions visually
2. No way to explain complex item combinations or special conditions
3. Reliance on external icon files limits customization
4. Players must guess item purposes from names alone

### Stakeholders

- **Primary**: Server administrators who manage shop listings
- **Secondary**: Players who browse and purchase from shops
- **Technical**: Development team maintaining the shop system

### Goals

- Enable custom icon uploads for shop listings
- Add descriptive text capability to listings
- Maintain backward compatibility with existing listings
- Ensure secure image processing and storage
- Optimize performance for large shops

### Non-Goals

- Creating an icon library or asset management system
- Supporting animated images or video content
- Rich text editing or complex formatting
- Bulk import/export of icons
- Icon sharing between listings

### Constraints

- Must use existing Sharp library (already in package.json)
- Icons stored as Base64 in database (no file system dependencies)
- Maximum processed icon size: 250KB
- Description limited to 500 characters plain text
- Must maintain existing API structure for backward compatibility
- Cannot break existing shop listing functionality

### Requirements

#### Functional Requirements
- REQ-001: The system SHALL allow administrators to upload custom icons for shop listings
- REQ-002: The system SHALL process uploaded images using Sharp library
- REQ-003: The system SHALL convert all icons to 256x256 WEBP format
- REQ-004: IF processed image exceeds 250KB, THEN the system SHALL reject the upload
- REQ-005: The system SHALL store icons as Base64 strings in the database
- REQ-006: The system SHALL allow plain text descriptions up to 500 characters
- REQ-007: WHEN no custom icon exists, THEN the system SHALL use default item icons
- REQ-008: The system SHALL sanitize description text to prevent XSS attacks

#### Non-Functional Requirements
- NFR-001: Performance - Icon processing must complete within 2 seconds
- NFR-002: Security - All images must be processed through Sharp to prevent malicious payloads
- NFR-003: Usability - Upload interface must show preview and validation feedback
- NFR-004: Compatibility - Existing listings must continue functioning without modification

## Layer 2: Functional Specification

### Overview

The enhancement adds two optional fields to shop listings: custom icons and descriptions. Administrators upload images through the web interface, which are processed server-side and stored in the database. Players see these custom elements when browsing the shop, with automatic fallback to default icons when custom ones aren't available.

### User Workflows

1. **Creating Listing with Custom Icon**
   - Administrator opens shop listing creation form
   - Uploads an image file (PNG/JPG/WEBP)
   - System shows preview of processed icon
   - Submits form with icon and description
   - System processes and stores the listing

2. **Viewing Enhanced Listings**
   - Player opens shop interface
   - System displays custom icons where available
   - System shows descriptions below item lists
   - Falls back to default icons on load failure

3. **Updating Existing Listings**
   - Administrator edits existing listing
   - Can add/replace icon or description
   - Can clear icon to revert to default
   - Changes apply immediately after save

### External Interfaces

#### API Changes
**POST/PUT /shop/listing**
```json
{
  "name": "Special Bundle",
  "price": 100,
  "icon": "data:image/png;base64,iVBORw0KG...",  // New optional field
  "description": "Limited time offer!",          // New optional field
  "items": [...]
}
```

**GET /shop/listing Response**
```json
{
  "id": "uuid",
  "name": "Special Bundle",
  "icon": "data:image/webp;base64,UklGR...",    // Processed WEBP
  "description": "Limited time offer!",          // Plain text
  "items": [...]
}
```

### Alternatives Considered

1. **File System Storage**
   - **Pros**: Smaller database, easier CDN integration
   - **Cons**: Deployment complexity, backup challenges
   - **Why not chosen**: Violates constraint of no file system dependencies

2. **External Image Service**
   - **Pros**: Offloads processing, professional features
   - **Cons**: External dependency, additional cost
   - **Why not chosen**: Adds complexity and external service dependency

3. **Markdown Descriptions**
   - **Pros**: Rich formatting options
   - **Cons**: Security risks, rendering complexity
   - **Why not chosen**: Requirements specify plain text only

### Why This Solution

The chosen approach of Base64 storage with Sharp processing:
- Meets all functional requirements (REQ-001 through REQ-008)
- Uses existing infrastructure (Sharp already installed)
- Maintains data consistency (icons travel with database)
- Simplifies deployment (no file system concerns)
- Provides security through image reprocessing

## Layer 3: Technical Specification

### Architecture Overview

```
Web Frontend                  API Layer                    Database
     │                            │                           │
     ├─[Upload Image]────────────>│                           │
     │                            ├─[Process with Sharp]      │
     │                            ├─[Validate Size]           │
     │                            ├─[Convert to Base64]       │
     │                            └─[Store]──────────────────>│
     │                                                         │
     ├─[Request Listing]─────────>│                           │
     │                            └─[Fetch]──────────────────>│
     │<───────[Return with Icon]───┘                          │
```

### Extension vs Creation Analysis

| Component | Extend/Create | Justification |
|-----------|---------------|---------------|
| ShopListingModel | Extend | Add fields to existing model at `/packages/app-api/src/db/shopListing.ts` |
| ShopListing DTOs | Extend | Add fields to existing DTOs at `/packages/app-api/src/service/Shop/dto.ts` |
| ImageProcessingService | Create | New functionality, no existing image processing service |
| ShopListingController | Extend | Integrate processing into existing endpoints |
| ShopListingCreateUpdateForm | Extend | Add upload field to existing form |
| ShopListingCard | Extend | Display new fields in existing component |

### Components

#### Existing Components (Extended)

- **ShopListingModel** (`/packages/app-api/src/db/shopListing.ts`)
  - Current: Stores listing metadata
  - Extension: Add `icon?: string` and `description?: string` fields
  - Integration: Automatic ORM mapping

- **ShopListing DTOs** (`/packages/app-api/src/service/Shop/dto.ts`)
  - Current: Data transfer objects for API
  - Extension: Add icon and description with validators
  - Integration: Existing validation pipeline

- **ShopListingController** (`/packages/app-api/src/controllers/Shop/Listing.ts`)
  - Current: Handles CRUD operations
  - Extension: Process icon before storage
  - Integration: Call ImageProcessingService in create/update

- **ShopListingCreateUpdateForm** (`/packages/web-main/src/routes/_auth/gameserver.$gameServerId/-components/-ShopListingCreateUpdateForm.tsx`)
  - Current: Form for listing management
  - Extension: Add image upload and description fields
  - Integration: Existing form validation

- **ShopListingCard** (`/packages/web-main/src/components/cards/ShopListingCard/index.tsx`)
  - Current: Displays listing in card format
  - Extension: Show custom icon and description
  - Integration: Conditional rendering with fallback

#### New Components (Required)

- **ImageProcessingService** (`/packages/app-api/src/service/ImageProcessingService.ts`)
  - Purpose: Process uploaded images safely and efficiently
  - Why new: No existing image processing service in codebase
  - Integration: Called by ShopListingController

### Data Models

**Database Migration:**
```sql
ALTER TABLE shopListing ADD COLUMN icon TEXT;
ALTER TABLE shopListing ADD COLUMN description TEXT;

-- Add constraints to prevent excessive data
ALTER TABLE shopListing ADD CONSTRAINT icon_length_check CHECK (length(icon) <= 350000);
ALTER TABLE shopListing ADD CONSTRAINT description_length_check CHECK (length(description) <= 500);
```

**Knex Migration Implementation:**
```typescript
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopListing', (table) => {
    table.text('icon').nullable();
    table.text('description').nullable();
  });
  
  // Add length constraints following existing patterns
  await knex.raw('ALTER TABLE shopListing ADD CONSTRAINT icon_length_check CHECK (length(icon) <= 350000)');
  await knex.raw('ALTER TABLE shopListing ADD CONSTRAINT description_length_check CHECK (length(description) <= 500)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE shopListing DROP CONSTRAINT IF EXISTS icon_length_check');
  await knex.raw('ALTER TABLE shopListing DROP CONSTRAINT IF EXISTS description_length_check');
  
  await knex.schema.alterTable('shopListing', (table) => {
    table.dropColumn('icon');
    table.dropColumn('description');
  });
}
```

**Updated ShopListingModel:**
```typescript
export class ShopListingModel extends TakaroModel {
  // ... existing fields
  icon?: string;        // Base64 WEBP image, max 350KB in DB
  description?: string; // Plain text, max 500 chars enforced by DB
}
```

### API Changes

No new endpoints required. Existing endpoints extended:

#### Modified Endpoints

- `POST /shop/listing` - Accepts icon and description
  - Breaking change: No
  - New optional fields only

- `PUT /shop/listing/:id` - Updates icon and description
  - Breaking change: No
  - New optional fields only

### Implementation Details

#### Key Algorithms

**Image Processing Pipeline:**
```typescript
class ImageProcessingService {
  async processShopIcon(base64Input: string): Promise<string> {
    // 1. Extract MIME type and data
    const matches = base64Input.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) throw new BadRequestError('Invalid image format');
    
    // 2. Decode base64 to buffer
    const buffer = Buffer.from(matches[2], 'base64');
    
    // 3. Process with Sharp
    let processed = await sharp(buffer)
      .resize(256, 256, { fit: 'cover', position: 'center' })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
    
    // 4. Check size and reduce quality if needed
    if (processed.length > 250 * 1024) {
      processed = await sharp(buffer)
        .resize(256, 256, { fit: 'cover', position: 'center' })
        .webp({ quality: 60, effort: 6 })
        .toBuffer();
        
      if (processed.length > 250 * 1024) {
        throw new BadRequestError('Image too large after compression');
      }
    }
    
    // 5. Return as base64
    return `data:image/webp;base64,${processed.toString('base64')}`;
  }
}
```

#### Security Considerations

Following existing patterns from authentication service:
- Input validation using class-validator decorators
- Sharp processing strips metadata and re-encodes (prevents malicious payloads)
- Description sanitized using existing XSS protection
- Size limits enforced at multiple levels:
  - Application layer: Business logic validation
  - Database layer: CHECK constraints as defense in depth
  - Prevents data corruption even if business logic is bypassed
- Database constraints prevent:
  - Icon field exceeding 350KB (accommodates Base64 overhead)
  - Description field exceeding 500 characters

#### Error Handling

Following existing error patterns from `/packages/app-api/src/service/Shop/index.ts`:
```typescript
if (!matches) throw new errors.BadRequestError('Invalid image format');
if (size > limit) throw new errors.BadRequestError('Image too large');
if (processing.fails) throw new errors.InternalServerError('Image processing failed');
```

### Testing Strategy

#### Unit Tests
```javascript
describe('ImageProcessingService', () => {
  it('processes valid PNG to WEBP', async () => {
    const result = await service.processShopIcon(validPNG);
    expect(result).toMatch(/^data:image\/webp;base64,/);
  });
  
  it('rejects oversized images', async () => {
    await expect(service.processShopIcon(largeImage))
      .rejects.toThrow('Image too large');
  });
  
  it('handles corrupt images gracefully', async () => {
    await expect(service.processShopIcon(corruptData))
      .rejects.toThrow('Invalid image');
  });
});
```

#### Integration Tests

Following existing test patterns in `/packages/app-api/src/controllers/__tests__/Shop/ShopListing.integration.test.ts`:
- Test listing creation with icon
- Test icon update/removal
- Test description validation
- Test backward compatibility

### Rollout Plan

1. **Phase 1**: Deploy database migration (backward compatible)
2. **Phase 2**: Deploy backend with processing service
3. **Phase 3**: Deploy frontend with upload capability
4. **Feature Flag**: Use existing draft field for testing

**Rollback Strategy:**
- Migration includes down() function
- Frontend handles missing fields gracefully
- No data loss for existing listings

## Appendix

### Technical Details

**Sharp Configuration Rationale:**
- 256x256: Standard size for game icons, balances quality and size
- WEBP: 25-35% smaller than PNG with better compression
- Quality 80: Best size/quality ratio for icons
- Cover fit: Ensures full frame coverage without distortion

**Base64 Size Calculation:**
- 250KB binary = ~334KB Base64 (4/3 ratio)
- Database constraint: 350KB (provides small buffer for headers)
- PostgreSQL TEXT type: No practical limit, but constrained by CHECK
- Network overhead: Acceptable for pagination limits

**Database Constraint Rationale:**
- Icon: 350,000 characters allows for 250KB image + Base64 overhead + data URI header
- Description: 500 characters matches business requirement exactly
- Pattern follows existing codebase conventions (e.g., `20250305210650-more-module-metadata.ts`)

### References

- Sharp documentation: https://sharp.pixelplumbing.com/
- Existing shop tests: `/packages/app-api/src/controllers/__tests__/Shop/`
- Form validation patterns: `/packages/web-main/src/routes/_auth/gameserver.$gameServerId/-components/`
- Error handling: `/packages/app-api/src/service/Shop/index.ts`