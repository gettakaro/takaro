# Implementation Tasks for Player Name History

## Phase 1: Database Foundation

- [ ] Create database migration for playerNameHistory table
  - Requirement: REQ-001, REQ-002, REQ-005
  - Design ref: Section 3 - Database Schema
  - Prompt: Create a Knex migration that creates the playerNameHistory table with columns: id (UUID), created_at, updated_at, domain (FK to domains), player_id (FK to players), game_server_id (FK to gameservers), name (VARCHAR). Include indexes on (player_id, created_at DESC) and (name). Populate initial data from existing player names.

- [ ] Add PlayerNameHistoryModel class to player.ts
  - Requirement: REQ-002, REQ-005
  - Design ref: Section 3 - New Components
  - Prompt: Create PlayerNameHistoryModel class extending TakaroModel with tableName 'playerNameHistory', fields for playerId, gameServerId, and name. Add relation mapping to PlayerModel.

- [ ] Add NameHistoryOutputDTO to Player service DTOs
  - Requirement: REQ-007, REQ-009
  - Design ref: Section 3 - New Components
  - Prompt: Create NameHistoryOutputDTO class extending TakaroDTO with @IsISO8601() createdAt and @IsString() name fields, following the pattern of IpHistoryOutputDTO.

## Phase 2: Event System

- [ ] Add PLAYER_NEW_NAME_DETECTED to TakaroEvents enum
  - Requirement: REQ-028
  - Design ref: Section 3 - Event System Integration
  - Prompt: Add PLAYER_NEW_NAME_DETECTED: 'player-new-name-detected' to TakaroEvents const in takaroEvents.ts

- [ ] Create TakaroEventPlayerNewNameDetected class
  - Requirement: REQ-029
  - Design ref: Section 3 - New Components
  - Prompt: Create TakaroEventPlayerNewNameDetected class extending BaseEvent with type field set to TakaroEvents.PLAYER_NEW_NAME_DETECTED, @IsString() @IsOptional() oldName field, and @IsString() newName field. Add to TakaroEventsMapping.

## Phase 3: Redis Caching

- [ ] Initialize Redis client for player names in PlayerRepo
  - Requirement: REQ-016, REQ-033
  - Design ref: Section 3 - Redis Cache Layer
  - Prompt: In PlayerRepo constructor or init method, create Redis client using await Redis.getClient('playerNames') and store as private property.

- [ ] Implement cache management methods in PlayerRepo
  - Requirement: REQ-016, REQ-031, REQ-032, REQ-033
  - Design ref: Section 3 - Redis Cache Layer
  - Prompt: Add getCachedName, setCachedName, and invalidateNameCache methods to PlayerRepo. Use cache key pattern `player:name:${this.domainId}:${playerId}` with 3600 second TTL. Include try-catch blocks for Redis failures with fallback to database.

## Phase 4: Core Backend Logic

- [ ] Add getNameHistoryModel method to PlayerRepo
  - Requirement: REQ-006
  - Design ref: Section 3 - Components
  - Prompt: Create getNameHistoryModel method in PlayerRepo following the pattern of getIPHistoryModel, binding PlayerNameHistoryModel to knex and applying domain scoping.

- [ ] Implement observeName method in PlayerRepo
  - Requirement: REQ-001, REQ-003, REQ-004, REQ-028, REQ-031
  - Design ref: Section 3 - Key Algorithms
  - Prompt: Create observeName method following observeIp pattern. Check last name, insert if different, invalidate cache, and fire PLAYER_NEW_NAME_DETECTED event with EventService. Return new record or null if unchanged.

- [ ] Integrate observeName in PlayerService.resolveRef
  - Requirement: REQ-001
  - Design ref: Section 3 - Existing Components Extended
  - Prompt: In PlayerService.resolveRef method after line 220, call this.observeName(player.id, gameServerId, gamePlayer.name) instead of updating name directly in PlayerUpdateDTO.

- [ ] Update PlayerRepo.findOne to include name history
  - Requirement: REQ-007, REQ-008
  - Design ref: Section 3 - Existing Components Extended
  - Prompt: In PlayerRepo.findOne method, after fetching IP history, query nameHistory similar to ipHistory: use `.where({ playerId: data.id }).orderBy('createdAt', 'desc').limit(10)` to get most recent names first, then map to NameHistoryOutputDTO array. Assign to data.nameHistory.

- [ ] Extend PlayerOutputDTO with nameHistory field
  - Requirement: REQ-007
  - Design ref: Section 3 - Existing Components Extended
  - Prompt: Add @ValidateNested({ each: true }) @Type(() => NameHistoryOutputDTO) nameHistory: NameHistoryOutputDTO[] field to PlayerOutputDTO class.

## Phase 5: Frontend Implementation

- [ ] Add Known Aliases section to player info page
  - Requirement: REQ-010, REQ-011, REQ-012
  - Design ref: Section 2 - Player Profile UI Changes
  - Prompt: In player.$playerId/info.tsx, add a new section after IP History called "Known Aliases" that displays player.nameHistory. Show first 5 unique names or "No aliases recorded" if empty.

- [ ] Create NameHistory component with modal for detailed view
  - Requirement: REQ-013, REQ-014, REQ-015
  - Design ref: Section 2 - User Workflows
  - Prompt: Create a component that displays name history entries. On click, open a modal showing all names with timestamps formatted using DateTime.fromISO. Order by most recent first.

- [ ] Style Known Aliases section consistently
  - Requirement: REQ-010
  - Design ref: Section 2 - External Interfaces
  - Prompt: Style the Known Aliases section to match the existing IP History section design, using the same Card components and layout patterns.

## Phase 6: Testing

- [ ] Write unit tests for observeName method
  - Requirement: REQ-003, REQ-004
  - Design ref: Section 3 - Testing Strategy
  - Prompt: Create unit tests for PlayerRepo.observeName that verify: new entries created for changed names, duplicates not created for same name, events fired correctly, cache invalidated.

- [ ] Write integration tests for name history tracking
  - Requirement: REQ-001, REQ-028
  - Design ref: Section 3 - Testing Strategy
  - Prompt: Create integration test that simulates player joining with different names and verifies history is tracked, events are fired, and cache is managed correctly.

- [ ] Test Redis fallback behavior
  - Requirement: REQ-032
  - Design ref: Section 3 - Testing Strategy
  - Prompt: Write tests that simulate Redis unavailability and verify the system falls back to database queries gracefully without errors.

- [ ] Test cache TTL behavior
  - Requirement: REQ-016
  - Design ref: Section 3 - Performance Requirements
  - Prompt: Create test that sets a cached name, waits for TTL to expire, and verifies the cache miss triggers a database query.