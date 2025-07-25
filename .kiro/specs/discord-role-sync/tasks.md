# Implementation Tasks for Discord Role Sync

## Overview
Implementation of bidirectional role synchronization between Discord and Takaro platforms. The feature will be built in 6 phases, starting with database schema changes and progressing through backend services, frontend integration, and comprehensive testing.

## Phase 1: Database & Data Transfer Objects
Set up the foundational data layer for Discord role synchronization.

- [x] Task 1: Create database migration for linkedDiscordRoleId
  - **Prompt**: Create a Knex migration file that adds a `linkedDiscordRoleId` column to the roles table. The column should be nullable, string type, and indexed. Follow the existing migration pattern in packages/lib-db/src/migrations/sql/.
  - **Requirements**: REQ-005
  - **Design ref**: Section: Database Schema Changes
  - **Files**: packages/lib-db/src/migrations/sql/20250726000000-discord-role-sync.ts

- [x] Task 2: Update Role DTOs to include linkedDiscordRoleId
  - **Prompt**: Update RoleUpdateInputDTO and RoleOutputDTO to include the optional linkedDiscordRoleId field. Add proper validation decorators (@IsString, @IsOptional, @Length(18, 18)) following the existing DTO patterns.
  - **Requirements**: REQ-005
  - **Design ref**: Section: DTOs
  - **Files**: packages/lib-apiclient/src/generated/api.ts

- [x] Task 3: Add Discord sync settings to SettingsService defaults
  - **Prompt**: Add default settings for 'discordRoleSync.enabled' (false) and 'discordRoleSync.sourceOfTruth' (false) to the settings service. Ensure they are included in the SettingsControllerGetKeysEnum and have proper descriptions.
  - **Requirements**: REQ-004, REQ-006
  - **Design ref**: Section: Settings Keys
  - **Files**: packages/app-api/src/service/SettingsService.ts

## Phase 2: Discord Bot Enhancement
Add role management capabilities to the Discord bot.

- [x] Task 4: Add GuildMembers intent to Discord bot
  - **Prompt**: Update the Discord bot client configuration to include the GuildMembers intent. This is required to receive guildMemberUpdate events for role changes.
  - **Requirements**: REQ-002
  - **Design ref**: Section: Enhanced Discord Bot
  - **Files**: packages/app-api/src/lib/DiscordBot.ts

- [x] Task 5: Implement Discord role management methods
  - **Prompt**: Add assignRole, removeRole, and getMemberRoles methods to the DiscordBot class. Each method should handle Discord API interactions, include proper error handling, and record metrics. Follow the existing method patterns in DiscordBot.
  - **Requirements**: REQ-001
  - **Design ref**: Section: Enhanced Discord Bot
  - **Files**: packages/app-api/src/lib/DiscordBot.ts

- [x] Task 6: Add guildMemberUpdate event listener
  - **Prompt**: Implement the guildMemberUpdate event listener in DiscordBot. When roles change, resolve the domain ID and forward to DiscordService. Include error handling and logging.
  - **Requirements**: REQ-002
  - **Design ref**: Section: Enhanced Discord Bot
  - **Files**: packages/app-api/src/lib/DiscordBot.ts

## Phase 3: Backend Services
Implement core synchronization logic in services.

- [x] Task 7: Add sync methods to DiscordService
  - **Prompt**: Implement syncUserRoles method in DiscordService that compares user roles between platforms and applies changes based on preference setting. Include proper logging and error handling. Skip users without Discord ID linked.
  - **Requirements**: REQ-000, REQ-001, REQ-004
  - **Design ref**: Section: Enhanced DiscordService, Role Sync Algorithm
  - **Files**: packages/app-api/src/service/DiscordService.ts

- [x] Task 8: Implement Discord event handlers in DiscordService
  - **Prompt**: Add handleDiscordMemberUpdate method that processes Discord role changes and syncs to Takaro. Only sync roles that have linkedDiscordRoleId configured. Include conflict resolution based on preference setting.
  - **Requirements**: REQ-001, REQ-002
  - **Design ref**: Section: Discord → Takaro Flow
  - **Files**: packages/app-api/src/service/DiscordService.ts

- [x] Task 9: Add Takaro role event listeners
  - **Prompt**: Implement handleRoleAssignment and handleRoleRemoval methods that listen to ROLE_ASSIGNED and ROLE_REMOVED events. Sync changes to Discord for users with Discord ID linked and roles with linkedDiscordRoleId.
  - **Requirements**: REQ-001, REQ-002
  - **Design ref**: Section: Takaro → Discord Flow
  - **Files**: packages/app-api/src/service/DiscordService.ts

- [x] Task 10: Implement conflict resolution logic
  - **Prompt**: Create calculateRoleChanges method that determines which roles to add/remove based on preference setting. When preferDiscord is true, Discord takes precedence; otherwise Takaro does.
  - **Requirements**: REQ-004
  - **Design ref**: Section: Conflict Resolution
  - **Files**: packages/app-api/src/service/DiscordService.ts

- [x] Task 11: Register event listeners in service initialization
  - **Prompt**: Update DiscordService initialization to register event listeners for ROLE_ASSIGNED and ROLE_REMOVED events. Only register if Discord sync is enabled in settings.
  - **Requirements**: REQ-002, REQ-006
  - **Design ref**: Section: Enhanced DiscordService
  - **Files**: packages/app-api/src/service/DiscordService.ts

## Phase 4: System Worker Integration
Implement scheduled synchronization as a fallback mechanism.

- [x] Task 12: Add SYNC_DISCORD_ROLES task type
  - **Prompt**: Add SYNC_DISCORD_ROLES to SystemTaskType enum and systemTaskDefinitions with perGameserver: false. Follow the existing pattern for system task definitions.
  - **Requirements**: REQ-003
  - **Design ref**: Section: System Worker Integration
  - **Files**: packages/app-api/src/workers/systemWorkerDefinitions.ts

- [x] Task 13: Implement syncDiscordRoles function
  - **Prompt**: Create syncDiscordRoles function in systemWorker that fetches all users with Discord IDs and syncs their roles in batches of 50. Include progress logging and error handling. Skip if sync is disabled.
  - **Requirements**: REQ-003
  - **Design ref**: Section: System Worker Integration
  - **Files**: packages/app-api/src/workers/systemWorker.ts

- [x] Task 14: Add system worker case handler
  - **Prompt**: Add case for SystemTaskType.SYNC_DISCORD_ROLES in the processJob function that calls syncDiscordRoles. Follow the existing pattern for system task handling.
  - **Requirements**: REQ-003
  - **Design ref**: Section: System Worker Integration
  - **Files**: packages/app-api/src/workers/systemWorker.ts

## Phase 5: Frontend Integration
Update user interfaces to support Discord role linking.

- [x] Task 15: Add Discord linking to link page
  - **Prompt**: Update the link page component to show LoginDiscordCard for logged-in users. Add a section after the existing form with appropriate heading and description. Only display if user session exists.
  - **Requirements**: REQ-000
  - **Design ref**: Section: Enhanced Link Page
  - **Files**: packages/web-main/src/routes/_single-page/link.tsx

- [x] Task 16: Update role form with Discord role selection
  - **Prompt**: Add linkedDiscordRoleId field to RoleCreateUpdateForm using SelectQueryField component. Load Discord roles from available guilds and display role names. Follow existing form field patterns.
  - **Requirements**: REQ-005
  - **Design ref**: Section: Role Configuration UI
  - **Files**: packages/web-main/src/routes/_auth/_global/-roles/RoleCreateUpdateForm.tsx

- [x] Task 17: Add booleanFields configuration for sync settings
  - **Prompt**: Update the booleanFields array to include 'discordRoleSync.enabled' and 'discordRoleSync.preferDiscord' so they render as Switch components in the settings page.
  - **Requirements**: REQ-006
  - **Design ref**: Section: Settings Integration
  - **Files**: packages/web-main/src/util/settings.ts

## Phase 6: Testing & Validation
Comprehensive testing of the Discord role sync feature.

- [ ] Task 18: Unit tests for sync logic
  - **Prompt**: Write unit tests for DiscordService.syncUserRoles method. Test scenarios: user without Discord ID, preference setting variations, role mapping, and error cases. Use existing test patterns.
  - **Requirements**: REQ-001, REQ-004, REQ-007
  - **Design ref**: Section: Unit Tests
  - **Files**: packages/app-api/src/service/__tests__/DiscordService.test.ts

- [ ] Task 19: Unit tests for conflict resolution
  - **Prompt**: Write unit tests for calculateRoleChanges method. Test all combinations of role presence/absence with both source of truth settings. Verify correct add/remove decisions.
  - **Requirements**: REQ-004
  - **Design ref**: Section: Conflict Resolution
  - **Files**: packages/app-api/src/service/__tests__/DiscordService.test.ts

- [ ] Task 20: Integration tests for event handling
  - **Prompt**: Write integration tests that verify role sync triggers correctly on both Discord and Takaro events. Mock Discord API calls and verify correct service interactions.
  - **Requirements**: REQ-001, REQ-002
  - **Design ref**: Section: Integration Tests
  - **Files**: packages/app-api/src/controllers/__tests__/DiscordRoleSync.integration.test.ts

- [ ] Task 21: System worker tests
  - **Prompt**: Write tests for the Discord role sync system worker task. Test batch processing, error handling, and settings checks. Verify it skips when disabled.
  - **Requirements**: REQ-003, REQ-006
  - **Design ref**: Section: System Worker Tests
  - **Files**: packages/app-api/src/workers/__tests__/systemWorker.test.ts

- [ ] Task 22: End-to-end validation
  - **Prompt**: Create a test script that validates the complete flow: link Discord account, configure role mapping, trigger sync via event, verify bidirectional sync works correctly.
  - **Requirements**: REQ-000, REQ-001
  - **Design ref**: Section: End-to-End Scenarios
  - **Files**: packages/e2e/src/tests/discord-role-sync.test.ts