# Requirements: Shop Listing Enhancements

## Introduction

This feature enhances the shop listing functionality by adding support for custom icons and descriptions. Currently, shop listings use generic item icons from the game server and lack descriptive text, limiting the ability to create a rich shopping experience for players.

## User Stories

### US-001: Custom Shop Listing Icons
**As a** server administrator  
**I want** to upload custom icons for shop listings  
**So that** I can visually differentiate special offers, bundles, or themed items in the shop

### US-002: Shop Listing Descriptions  
**As a** server administrator  
**I want** to add descriptions to shop listings  
**So that** I can provide additional context, instructions, or promotional text for items

### US-003: Icon Display
**As a** player  
**I want** to see custom icons for shop listings when available  
**So that** I can easily identify special items or promotions

### US-004: Description Display
**As a** player  
**I want** to read descriptions for shop listings  
**So that** I can understand what I'm purchasing and any special conditions

## Acceptance Criteria

### Icon Management
- The system SHALL allow administrators to upload custom icons for shop listings
- The system SHALL use Sharp library to process uploaded images
- The system SHALL convert all uploaded images to a standard format (WEBP)
- The system SHALL resize images to a standard dimension (256x256 pixels)
- The system SHALL compress images to optimize file size
- IF the processed image exceeds 250KB, THEN the system SHALL reject the upload
- The system SHALL store processed icons as Base64-encoded strings in the database
- The system SHALL support common input image formats (PNG, JPG, JPEG, WEBP)
- The system SHALL NOT support animated images (GIF)
- WHEN a custom icon is not provided, THEN the system SHALL display the default item icon
- The system SHALL preserve custom icons when updating other listing properties

### Description Management  
- The system SHALL allow administrators to add plain text descriptions to shop listings
- The system SHALL support descriptions up to 500 characters
- The system SHALL sanitize description text to prevent XSS attacks
- The system SHALL NOT support any text formatting (no markdown, no rich text)
- WHEN no description is provided, THEN the system SHALL not display a description section

### Display Requirements
- The system SHALL display custom icons in the shop card view
- The system SHALL display custom icons in the shop table view  
- The system SHALL display descriptions in the shop card view
- The system SHALL display descriptions in the shop detail view
- IF a custom icon fails to load, THEN the system SHALL fallback to the default item icon

### API Requirements
- The system SHALL accept Base64 icon data in shop listing create/update endpoints
- The system SHALL return icon data in shop listing read endpoints
- The system SHALL accept description text in shop listing create/update endpoints
- The system SHALL return description text in shop listing read endpoints

### Data Migration
- The system SHALL add nullable icon and description fields to existing shop listings
- The system SHALL NOT require existing listings to have icons or descriptions
- The system SHALL preserve all existing shop listing data during migration

## Technical Constraints

- Icons must be stored as Base64 strings to avoid file system dependencies
- Maximum processed image size: 250KB (before Base64 encoding)
- Maximum Base64 string length: ~334KB (250KB file after encoding)
- Images will be processed to 256x256 pixels WEBP format
- Description field must be text type, limited to 500 characters
- Both fields must be optional to maintain backward compatibility
- Sharp library required for image processing on the backend

## Security Considerations

- All uploaded images must be processed through Sharp to prevent malicious payloads
- Image content must be verified before storage
- Descriptions must be sanitized to prevent XSS attacks
- File size limits must be enforced after processing to prevent storage abuse
- Only allow specific image MIME types for upload