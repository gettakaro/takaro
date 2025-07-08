# PRD: Command Permissions Feature

## Introduction/Overview

This feature introduces a permission requirement system for module commands in Takaro. Currently, permission checks must be implemented inside each command's code, which is inefficient and provides no visibility into permission requirements outside of the code. This feature will allow module installers to configure which permissions are required to execute specific commands at the module level, making the system more transparent and manageable.

## Goals

1. Enable configuration of required permissions for module commands without modifying command code
2. Prevent unauthorized command execution at the system level before command code runs
3. Provide visibility of permission requirements in the help system and Studio interface
4. Integrate seamlessly with Takaro's existing permission and role system
5. Improve security auditing by tracking permission-denied command attempts

## User Stories

1. **As a server administrator**, I want to configure which permissions are required for each command in a module, so that I can control access without modifying code.

2. **As a player**, I want to see only the commands I have permission to use when I type 'help', so that I don't get confused by commands I cannot execute.

3. **As a module developer**, I want to define default permission requirements for my commands, so that server administrators have sensible defaults to work with.

4. **As a server administrator**, I want to see and edit command permissions in Studio, so that I can easily manage access control through the UI.

5. **As a security auditor**, I want to see logs of permission-denied command attempts, so that I can monitor potential unauthorized access attempts.

## Functional Requirements

1. **Database Schema Extension**
   - The system must add a field to store required permissions for each command in the database
   - The system must support storing multiple permission codes per command
   - The system must default existing commands to "no permission required" upon migration

2. **Permission Checking**
   - The system must check required permissions before executing any command
   - The system must check permissions before parameter validation
   - The system must respect the 'root' permission as a bypass for all permission checks
   - The system must return a clear error message when a user lacks required permissions

3. **Help Command Integration**
   - The help command must filter its output based on user permissions
   - The help command must only display commands the requesting user has permission to execute
   - The system must check all required permissions for a command before including it in help output

4. **Studio Interface**
   - The system must display required permissions for each command in Studio
   - The system must allow editing of required permissions through the Studio interface
   - The permission configuration must be part of the command settings section
   - The system must validate permission codes against existing Takaro permissions

5. **API and DTO Updates**
   - The ModuleTransferDTOs must include a field for required permissions
   - The API must expose required permissions when listing modules and commands
   - The system must maintain backwards compatibility for existing API consumers

6. **Event Logging**
   - The system must create a command-executed event for permission-denied attempts
   - The event metadata must indicate the command execution was denied due to permissions
   - The event must include which permissions were missing

7. **Built-in Module Support**
   - The system must support permission requirements for built-in modules
   - Existing built-in modules must be refactored to use the new permission system
   - The system must remove internal permission checks from commands where appropriate

## Non-Goals (Out of Scope)

1. Creating new permission types or modifying the existing permission system
2. Implementing permission groups or hierarchical permissions
3. Bulk editing of permissions across multiple commands
4. Changing how permissions are assigned to roles
5. Implementing command-specific permission logic (permissions remain role-based)
6. Creating a separate UI for permission management outside of Studio

## Design Considerations

- The permission configuration UI in Studio should follow existing Takaro design patterns
- Permission codes should be presented as a multi-select or tag-based input
- The UI should validate permission codes against the list of valid Takaro permissions
- Error messages for permission denials should be user-friendly and informative

## Technical Considerations

1. **Database Migration**
   - A migration script must add the new permissions field to the command table
   - The migration must handle existing data gracefully

2. **Permission Format**
   - Permissions should be stored as an array of permission codes (e.g., ["USE_TELEPORTS", "MANAGE_PLAYERS"])
   - Empty array should indicate no permissions required

3. **Performance**
   - Permission checks should be efficient as they run before every command
   - Consider caching permission data if necessary

4. **Integration Points**
   - Command execution pipeline must be modified to include permission checks
   - Help command logic must be updated to filter based on permissions
   - Studio API endpoints must be extended to handle permission updates

## Success Metrics

1. 100% of command executions are preceded by permission checks
2. Zero unauthorized command executions after implementation
3. Help command response time remains within 5% of current performance
4. All built-in modules successfully migrated to use the new system
5. No breaking changes for existing API consumers
6. Reduction in custom permission checking code within individual commands

## Open Questions

1. Should there be a way to define default permissions for all commands in a module?
2. How should permission requirements be displayed in the help command output?
3. Should module developers be able to mark certain permissions as "recommended" vs "required"?
4. What should be the exact format of the permission-denied error message?
5. Should permission checks be cached, and if so, for how long?