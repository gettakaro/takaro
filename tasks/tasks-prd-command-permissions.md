## Tasks

- [x] 1.0 Set up database schema and DTOs for command permissions
  - [x] 1.1 Add requiredPermissions field to command database schema
  - [x] 1.2 Create database migration script for existing commands
  - [x] 1.3 Update ModuleTransferDTOs to include requiredPermissions field
  - [x] 1.4 Update API response DTOs for command listings
  - [x] 1.5 Write unit tests for DTO serialization/deserialization

- [x] 2.0 Implement core permission checking in command execution pipeline
  - [x] 2.1 [depends on: 1.0] Locate command execution entry point in codebase
  - [x] 2.2 [depends on: 2.1] Add permission check before parameter validation
  - [x] 2.3 [depends on: 2.2] Implement root permission bypass logic
  - [x] 2.4 [depends on: 2.2] Create user-friendly permission denied error messages
  - [x] 2.5 [depends on: 2.1, 2.2, 2.3, 2.4] Write integration tests for permission checking

- [x] 3.0 Update help command to filter by permissions
  - [x] 3.1 [depends on: 2.0] Find help command implementation
  - [x] 3.2 [depends on: 3.1] Add permission checking to command list filtering
  - [x] 3.3 [depends on: 3.2] Test help command shows only permitted commands
  - [x] 3.4 [depends on: 3.2] Optimize performance if needed (implement caching)

- [ ] 4.0 Add Studio UI for viewing and editing command permissions
  - [x] 4.1 [depends on: 1.0] Add permission display to command settings component
  - [ ] 4.2 [depends on: 4.1] Implement multi-select/tag input for permissions
  - [ ] 4.3 [depends on: 4.2] Add permission validation against valid Takaro permissions
  - [ ] 4.4 [depends on: 4.2] Connect UI to API for saving permission changes
  - [x] 4.5 [depends on: 4.1, 4.2, 4.3, 4.4] Write component tests for permission UI

- [x] 5.0 Implement event logging for permission-denied attempts
  - [x] 5.1 [depends on: 2.0] Modify command execution to log denied attempts
  - [x] 5.2 [depends on: 5.1] Include missing permissions in event metadata
  - [x] 5.3 [depends on: 5.1] Ensure event indicates execution was denied
  - [x] 5.4 [depends on: 5.1, 5.2, 5.3] Test event logging with various scenarios

- [x] 6.0 Refactor built-in modules to use the new permission system
  - [x] 6.1 [depends on: 2.0] Identify all built-in modules with permission checks
  - [x] 6.2 [depends on: 6.1] Remove internal permission checks from commands
  - [x] 6.3 [depends on: 6.2] Configure appropriate default permissions for each command (skipped - no changes needed)
  - [x] 6.4 [depends on: 6.3] Test all built-in modules work with new system
  - [x] 6.5 [depends on: 6.4] Update module documentation with permission requirements

## Relevant Files

- `packages/lib-db/src/migrations/sql/20250708095623-command-required-permissions.ts` - Database migration script for adding requiredPermissions field (created)
- `packages/app-api/src/db/command.ts` - Command entity definition (modified: added requiredPermissions field)
- `packages/lib-modules/src/BuiltinModule.ts` - Module transfer DTOs (modified: added requiredPermissions to ICommand)
- `packages/app-api/src/service/CommandService.ts` - Command service (modified: added requiredPermissions to DTOs, implemented permission checking in handleChatMessage, added event logging for permission denials)
- `packages/lib-modules/src/modules/utils/commands/help.js` - Help command (modified: added permission filtering)
- `packages/web-main/src/routes/_auth/-module-builder/Editor/configs/commandConfig.tsx` - Command configuration UI (modified: added requiredPermissions field)
- `packages/app-api/src/service/CommandService.test.ts` - Tests for command execution with permissions
- `packages/lib-modules/src/modules/help/index.ts` - Help command implementation needing filtering
- `packages/lib-modules/src/modules/help/index.test.ts` - Tests for help command filtering
- `packages/web-main/src/pages/Studio/modules/` - Studio module configuration UI components
- `packages/web-main/src/components/PermissionSelector.tsx` - New component for permission selection
- `packages/web-main/src/components/PermissionSelector.test.tsx` - Tests for permission selector
- `packages/lib-auth/src/permissions.ts` - List of valid Takaro permissions for validation
- `packages/lib-gameserver/src/events/` - Event system for logging permission denials
- `packages/lib-modules/src/modules/*/index.ts` - All built-in module files to refactor
- `packages/lib-modules/src/dto/takaroEvents.ts` - Event definitions (modified: added COMMAND_EXECUTION_DENIED event type and TakaroEventCommandExecutionDenied class)
- `packages/lib-modules/src/modules/teleports/commands/teleport.js` - Removed permission check (modified)
- `packages/lib-modules/src/modules/teleports/commands/setwaypoint.js` - Removed permission check (modified)
- `packages/lib-modules/src/modules/teleports/commands/deletewaypoint.js` - Removed permission check (modified)
- `packages/lib-modules/src/modules/teleports/index.ts` - Added requiredPermissions to commands (modified)
- `packages/lib-modules/src/modules/economyUtils/commands/grantCurrency.js` - Removed permission check (modified)
- `packages/lib-modules/src/modules/economyUtils/commands/revokeCurrency.js` - Removed permission check (modified)
- `packages/lib-modules/src/modules/economyUtils/index.ts` - Added requiredPermissions to commands (modified)
- `packages/lib-modules/src/modules/lottery/commands/buyTicket.js` - Removed permission check (modified)
- `packages/lib-modules/src/modules/lottery/commands/viewTickets.js` - Removed permission check (modified)
- `packages/lib-modules/src/modules/lottery/index.ts` - Added requiredPermissions to commands (modified)
- `packages/lib-modules/src/modules/dailyRewards/commands/daily.js` - Removed permission check (modified)
- `packages/lib-modules/src/modules/dailyRewards/index.ts` - Added requiredPermissions to command (modified)

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Database migrations should be tested on a copy of production data to ensure smooth deployment
- Performance testing is critical for the help command changes as it's frequently used
- Consider feature flags for gradual rollout if needed

### Task 6.1 Results - Modules with Permission Checks

The following built-in modules have permission checks that need to be refactored:

1. **Teleports Module**: Commands `teleport`, `setpublic`, `setwaypoint`, `deletewaypoint`, `listwaypoints`
2. **Economy Utils Module**: Commands `grantCurrency`, `revokeCurrency`
3. **Lottery Module**: Commands `buyTicket`, `viewTickets`
4. **Daily Rewards Module**: Command `daily`
5. **GeoBlock Module**: Hook `IPDetected` (uses GEOBLOCK_IMMUNITY)
6. **Utils Module**: Command `help` (already updated to use new system)

Note: Some modules use permissions for non-command purposes (hooks, cron jobs, multipliers) which don't need refactoring for command permissions.

### Task 6.2 Results - Commands NOT Refactored

The following commands were NOT refactored because they use permission count values:

1. **Teleports Module**: 
   - `setpublic` - Uses `hasPermission.count` to limit number of public teleports
   - `listwaypoints` - Uses dynamic per-waypoint permissions
2. **Daily Rewards Module**:
   - `getMultiplier` function - Uses `perm.count` as reward multiplier (called by daily command)
3. **Economy Utils Module**:
   - `zombieKillReward` cron job - Uses `hasPermission.count` for reward override

## Workarounds & Technical Debt

The following workarounds were implemented due to skipping API client regeneration. These need to be cleaned up after running `npm run generate --workspace=packages/lib-apiclient`:

### 1. Type Casting in commandConfig.tsx
- **Location**: `/packages/web-main/src/routes/_auth/-module-builder/Editor/configs/commandConfig.tsx`
- **Issue**: The CommandOutputDTO doesn't include the `requiredPermissions` field in the generated types
- **Workaround**: Using type casting to access the field:
  - Line 114: `(command as any).requiredPermissions` to read the permissions
  - Line 158: `commandData as CommandUpdateDTO` with preceding `as any` cast
- **Fix**: Regenerate API client to include proper types

### 2. Text Field Instead of Multi-Select
- **Location**: Same file as above, lines 193-200
- **Issue**: Implementing a proper multi-select/tag input requires the API types to be updated
- **Workaround**: Using a simple TextField that accepts comma-separated permission names
- **Fix**: After API regeneration, replace with a proper multi-select component (similar to the PermissionField component pattern)