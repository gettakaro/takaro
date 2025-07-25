# Discord Role Sync Design Document

## Overview

This feature implements bidirectional role synchronization between Discord and Takaro, ensuring that role assignments remain consistent across both platforms. The system will react to role changes in real-time through event listeners and provide a scheduled sync mechanism as a fallback for missed events.

**Prerequisites**: Users must have their Discord accounts linked to their Takaro profiles for role synchronization to work. This is accomplished through Discord OAuth integration accessible from the user settings and the link page.

### Key Objectives
- Enable users to link Discord accounts to Takaro profiles
- Real-time bidirectional role synchronization between Discord and Takaro
- Event-driven architecture with fallback scheduled sync
- Configurable source of truth for conflict resolution
- Seamless integration with existing role management systems

### Non-goals and Scope Limitations
- This feature does not handle Discord permission synchronization
- It does not create new roles automatically - roles must be manually linked
- It does not sync role metadata (color, position, etc.) - only role assignments
- It does not handle Discord bot permissions management

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        Takaro Platform                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌─────────────────┐    ┌──────────────┐ │
│  │   Discord    │────►│    Discord       │───►│    Event     │ │
│  │     Bot      │     │    Service       │    │   Service    │ │
│  └──────────────┘     └─────────────────┘    └──────────────┘ │
│         ▲                      │                      │        │
│         │                      │                      ▼        │
│  ┌──────────────┐             │              ┌──────────────┐ │
│  │   Settings   │◄────────────┘              │    Role      │ │
│  │   Service    │                            │   Service    │ │
│  └──────────────┘                            └──────────────┘ │
│                                                      │        │
│                                                      ▼        │
│                        ┌─────────────────┐    ┌──────────────┐ │
│                        │  System Worker  │    │   Database   │ │
│                        │  (Hourly Sync) │    │              │ │
│                        └─────────────────┘    └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Discord → Takaro Flow**
   - Discord bot receives `guildMemberUpdate` event
   - DiscordBot forwards event to DiscordService
   - DiscordService verifies user has Discord ID linked in Takaro profile
   - If no Discord ID found, logs warning and skips sync
   - Service queries Role table for linked Discord roles
   - If match found, calls RoleService to assign/remove role
   - RoleService emits `ROLE_ASSIGNED`/`ROLE_REMOVED` event for audit trail

2. **Takaro → Discord Flow**
   - RoleService emits `ROLE_ASSIGNED`/`ROLE_REMOVED` event
   - DiscordService listens for these events
   - Verifies user has Discord ID in their profile
   - If no Discord ID found, logs warning and skips sync
   - Checks if role has linkedDiscordRoleId
   - Calls DiscordBot methods to update Discord member roles
   - Handles API errors with retry logic

3. **Scheduled Sync Flow**
   - System Worker runs hourly and schedules all system tasks
   - For domains with Discord sync enabled, executes `syncDiscordRoles`
   - Fetches all users with Discord IDs from UserService
   - For each user, compares Discord and Takaro roles
   - Resolves conflicts based on source of truth setting
   - Batch processes updates through respective services

## Components and Interfaces

### Backend Components

#### 1. Enhanced DiscordService
```typescript
// Add to existing DiscordService class
export class DiscordService extends TakaroService<DiscordGuildModel, GuildOutputDTO, GuildCreateInputDTO, GuildUpdateDTO> {
  // Existing methods...
  
  // New role sync methods
  async syncUserRoles(userId: string): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.discordRoleSyncEnabled) return;
    
    const user = await new UserService(this.domainId).findOne(userId);
    if (!user.discordId) {
      this.log.warn(`User ${userId} has no Discord ID linked`);
      return;
    }
    
    // Implementation continues...
  }
  
  async handleRoleAssignment(event: TakaroEventRoleAssigned): Promise<void> {
    // Sync to Discord when role assigned in Takaro
  }
  
  async handleRoleRemoval(event: TakaroEventRoleRemoved): Promise<void> {
    // Sync to Discord when role removed in Takaro
  }
  
  async handleDiscordMemberUpdate(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    // Sync to Takaro when Discord roles change
  }
  
  private async getSettings() {
    const settingsService = new SettingsService(this.domainId);
    return {
      discordRoleSyncEnabled: await settingsService.get('discordRoleSync.enabled') === 'true',
      sourceOfTruthIsDiscord: await settingsService.get('discordRoleSync.sourceOfTruth') === 'true',
    };
  }
}
```

#### 2. Enhanced Discord Bot
```typescript
// Add to existing DiscordBot class in lib/DiscordBot.ts
class DiscordBot {
  // Existing methods...
  
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // Add this intent
      ],
    });
    
    // Add new event listener
    this.client.on('guildMemberUpdate', this.handleGuildMemberUpdate.bind(this));
  }
  
  // New methods for role management
  async assignRole(guildId: string, userId: string, roleId: string): Promise<void> {
    const guild = await this.client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    await member.roles.add(roleId);
    DiscordMetrics.recordRoleAssigned(guildId, userId, roleId);
  }
  
  async removeRole(guildId: string, userId: string, roleId: string): Promise<void> {
    const guild = await this.client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    await member.roles.remove(roleId);
    DiscordMetrics.recordRoleRemoved(guildId, userId, roleId);
  }
  
  async getMemberRoles(guildId: string, userId: string): Promise<string[]> {
    const guild = await this.client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    return Array.from(member.roles.cache.keys());
  }
  
  private async handleGuildMemberUpdate(oldMember: GuildMember, newMember: GuildMember) {
    const domainId = await DiscordService.NOT_DOMAIN_SCOPED_resolveDomainFromGuildId(newMember.guild.id);
    if (!domainId) return;
    
    const discordService = new DiscordService(domainId);
    await discordService.handleDiscordMemberUpdate(oldMember, newMember);
  }
}
```

#### 3. DTOs

```typescript
// Update existing RoleUpdateInputDTO
export class RoleUpdateInputDTO extends TakaroDTO<RoleUpdateInputDTO> {
  @Length(3, 20)
  @IsOptional()
  name?: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionInputDTO)
  @IsOptional()
  permissions?: PermissionInputDTO[];
  
  @IsString()
  @IsOptional()
  @Length(18, 18)
  linkedDiscordRoleId?: string;
}

// Add to RoleOutputDTO
export class RoleOutputDTO extends TakaroModelDTO<RoleOutputDTO> {
  @IsString()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionOnRoleDTO)
  permissions: PermissionOnRoleDTO[];
  
  @IsString()
  @IsOptional()
  linkedDiscordRoleId?: string;
}

```

#### 4. System Worker Integration

```typescript
// Add to packages/app-api/src/workers/systemWorkerDefinitions.ts
export enum SystemTaskType {
  // Existing tasks...
  SYNC_DISCORD_ROLES = 'syncDiscordRoles',
}

export const systemTaskDefinitions: Record<SystemTaskType, TaskDefinition> = {
  // Existing definitions...
  [SystemTaskType.SYNC_DISCORD_ROLES]: { perGameserver: false },
};

// Add to packages/app-api/src/workers/systemWorker.ts
async function syncDiscordRoles(domainId: string): Promise<void> {
  const settingsService = new SettingsService(domainId);
  const enabled = await settingsService.get('discordRoleSync.enabled');
  
  if (enabled !== 'true') {
    log.debug('Discord role sync disabled for domain', { domainId });
    return;
  }
  
  const discordService = new DiscordService(domainId);
  const userService = new UserService(domainId);
  
  try {
    // Get all users with Discord IDs
    const users = await userService.find({
      filters: {
        discordId: { $ne: null },
      },
    });
    
    if (users.results.length === 0) {
      log.debug('No users with Discord IDs found', { domainId });
      return;
    }
    
    log.info('Starting Discord role sync', { 
      domainId, 
      userCount: users.results.length 
    });
    
    let rolesAdded = 0;
    let rolesRemoved = 0;
    let errors = 0;
    
    // Process users in batches
    const batchSize = 50;
    for (let i = 0; i < users.results.length; i += batchSize) {
      const batch = users.results.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (user) => {
          try {
            const result = await discordService.syncUserRoles(user.id);
            rolesAdded += result.rolesAdded;
            rolesRemoved += result.rolesRemoved;
          } catch (error) {
            errors++;
            log.error('Failed to sync Discord roles for user', { 
              userId: user.id, 
              domainId,
              error 
            });
          }
        })
      );
    }
    
    log.info('Discord role sync completed', {
      domainId,
      usersProcessed: users.results.length,
      rolesAdded,
      rolesRemoved,
      errors,
    });
    
  } catch (error) {
    log.error('Discord role sync failed', { domainId, error });
    throw error;
  }
}

// In processJob function, add case:
case SystemTaskType.SYNC_DISCORD_ROLES:
  await syncDiscordRoles(job.data.domainId);
  break;
```

### Frontend Components

#### 1. Enhanced Link Page
```typescript
// Update existing file: packages/web-main/src/routes/_single-page/link.tsx
import { LoginDiscordCard } from '../_auth/_global/settings/-discord/LoginDiscordCard';

function Component() {
  // Existing code...
  const { data: session } = useQuery({ ...userMeQueryOptions(), initialData: loaderData?.session });
  
  return (
    <Container>
      {/* Existing player linking form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Existing fields... */}
      </form>
      
      {/* Add Discord linking section for logged-in users */}
      {session && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Connect Discord Account</h2>
          <p>Link your Discord account to enable role synchronization between Discord and Takaro.</p>
          <LoginDiscordCard />
        </div>
      )}
    </Container>
  );
}
```

#### 2. Role Configuration UI
```typescript
// Update existing file: packages/web-main/src/routes/_auth/_global/-roles/RoleCreateUpdateForm.tsx
export const Route = createFileRoute('/_auth/_global/roles/$roleId/update')({
  loader: async ({ context, params }) => {
    const role = await context.queryClient.ensureQueryData(roleQueryOptions(params.roleId));
    const discordGuilds = await context.queryClient.ensureQueryData(
      discordGuildInfiniteQueryOptions({ page: 0 })
    );
    return { role, discordGuilds };
  },
  component: Component,
});

function Component() {
  const { role, discordGuilds } = Route.useLoaderData();
  const { control, handleSubmit } = useForm<RoleUpdateInputDTO>({
    values: role,
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Existing fields... */}
      
      <Card>
        <Card.Title>Discord Integration</Card.Title>
        <Card.Body>
          <SelectQueryField
            name="linkedDiscordRoleId"
            label="Linked Discord Role"
            placeholder="Select a Discord role to sync"
            control={control}
            render={(selectedItems) => {
              if (!selectedItems.length) return <span>No role selected</span>;
              const role = discordRoles.find(r => r.id === selectedItems[0]);
              return <span>{role?.name}</span>;
            }}
          >
            {/* Populate with Discord roles */}
          </SelectQueryField>
        </Card.Body>
      </Card>
    </form>
  );
}
```

#### 3. Settings Integration
The Discord sync settings are integrated into the existing settings system and will automatically appear in the gameservers settings page. No new frontend files are needed as the settings page dynamically renders based on backend settings.

## Data Models

### Database Schema Changes

```typescript
// Migration file: packages/lib-db/src/migrations/sql/20250726000000-discord-role-sync.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add linkedDiscordRoleId to roles table
  await knex.schema.alterTable('roles', (table) => {
    table.string('linkedDiscordRoleId').nullable();
    table.index('linkedDiscordRoleId');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('roles', (table) => {
    table.dropColumn('linkedDiscordRoleId');
  });
}
```

### Settings Keys
```typescript
// Settings stored in existing settings table
const DISCORD_SYNC_SETTINGS = {
  'discordRoleSync.enabled': 'false', // default - boolean setting
  'discordRoleSync.sourceOfTruth': 'false', // default - boolean (true = Discord, false = Takaro)
};
```

These settings will automatically appear in the gameservers settings page:
- `discordRoleSync.enabled` - Rendered as a Switch component with label "Discord Role Sync Enabled"
- `discordRoleSync.sourceOfTruth` - Rendered as a Switch component with label "Discord Role Sync Source Of Truth" (on = Discord, off = Takaro)

The backend settings system will provide these keys with appropriate descriptions, and the frontend will dynamically render them without any code changes needed.

### API Endpoints

#### 1. Role Controller Updates
```typescript
// Update existing RoleController
@JsonController('/role')
export class RoleController {
  // Existing endpoints...
  
  @Put('/:id')
  @UseBefore(RateLimiterMiddleware)
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_ROLES]))
  async update(@Params('id') id: string, @Body() data: RoleUpdateInputDTO) {
    // Existing validation...
    
    // Validate Discord role if provided
    if (data.linkedDiscordRoleId) {
      const discordService = new DiscordService(ctx.domain);
      // Verify role exists in connected guilds
    }
    
    return apiResponse(await this.service.update(id, data));
  }
}
```

#### 2. Discord Controller
The existing Discord controller does not need any modifications for role sync functionality. The sync happens automatically through events and scheduled tasks.

## Implementation Details

### Key Algorithms

#### 1. Role Sync Algorithm
```typescript
async syncUserRoles(userId: string): Promise<void> {
  const user = await new UserService(this.domainId).findOne(userId);
  
  // Check if user has Discord ID linked
  if (!user.discordId) {
    this.log.warn('User has no Discord ID linked, skipping sync', { userId });
    return;
  }
  
  const settings = await this.getSettings();
  const roleService = new RoleService(this.domainId);
  
  // Get all roles with Discord links
  const takaroRoles = await roleService.find({
    filters: {
      linkedDiscordRoleId: { $ne: null },
    },
  });
  
  // Get user's current roles in both systems
  const userTakaroRoles = await roleService.getRolesForUser(userId);
  const userDiscordRoles = await discordBot.getMemberRoles(guildId, user.discordId);
  
  // Build role mappings
  const roleMap = new Map(
    takaroRoles.results.map(role => [role.linkedDiscordRoleId!, role.id])
  );
  
  // Determine differences and resolve conflicts
  const changes = this.calculateRoleChanges(
    userTakaroRoles,
    userDiscordRoles,
    roleMap,
    settings.sourceOfTruthIsDiscord
  );
  
  // Apply changes
  await this.applyRoleChanges(userId, user.discordId, changes);
}
```

#### 2. Conflict Resolution
```typescript
private calculateRoleChanges(
  takaroRoles: RoleOutputDTO[],
  discordRoleIds: string[],
  roleMap: Map<string, string>,
  sourceOfTruthIsDiscord: boolean
): RoleChanges {
  const takaroRoleIds = new Set(takaroRoles.map(r => r.id));
  const discordRoleSet = new Set(discordRoleIds);
  
  const changes: RoleChanges = {
    addToTakaro: [],
    removeFromTakaro: [],
    addToDiscord: [],
    removeFromDiscord: [],
  };
  
  // Check each mapped role
  for (const [discordRoleId, takaroRoleId] of roleMap) {
    const hasInTakaro = takaroRoleIds.has(takaroRoleId);
    const hasInDiscord = discordRoleSet.has(discordRoleId);
    
    if (hasInTakaro && !hasInDiscord) {
      if (!sourceOfTruthIsDiscord) { // Takaro is source of truth
        changes.addToDiscord.push(discordRoleId);
      } else {
        changes.removeFromTakaro.push(takaroRoleId);
      }
    } else if (!hasInTakaro && hasInDiscord) {
      if (sourceOfTruthIsDiscord) { // Discord is source of truth
        changes.addToTakaro.push(takaroRoleId);
      } else {
        changes.removeFromDiscord.push(discordRoleId);
      }
    }
  }
  
  return changes;
}
```

### Performance Considerations

1. **Batch Processing**
   - Process role updates in batches of 100 users
   - Use BullMQ's built-in rate limiting
   - Implement Discord API rate limit awareness

2. **Caching**
   - Cache role mappings for 5 minutes using Redis
   - Cache Discord guild roles for 10 minutes
   - Invalidate cache on role configuration changes

3. **Event Debouncing**
   - Debounce rapid role changes using BullMQ's delay option
   - Coalesce multiple role changes for same user
   - Process final state after 5-second delay

### Security Considerations

1. **Permission Validation**
   - Verify Discord bot has MANAGE_ROLES permission
   - Ensure bot role is higher than roles being managed
   - Check user permissions for manual sync triggers

2. **Audit Trail**
   - Log all role sync operations to database
   - Include source of change (Discord/Takaro/Scheduled)
   - Track user who triggered manual syncs

3. **Rate Limiting**
   - Respect Discord API rate limits
   - Implement exponential backoff on failures
   - Limit manual sync frequency per domain

## Error Handling

### Error Scenarios

1. **Discord API Errors**
   - 403 Forbidden: Bot lacks permissions
   - 429 Rate Limited: Back off and retry
   - 404 Not Found: Role/User deleted
   - 5xx Server Error: Retry with exponential backoff

2. **Database Errors**
   - Connection failures: Use existing retry logic
   - Constraint violations: Log and skip user
   - Transaction failures: Rollback and retry

3. **Sync Conflicts**
   - User without Discord ID linked: Log warning and skip
   - User not in Discord guild: Skip Discord sync
   - Role deleted: Remove mapping and log
   - Invalid role mapping: Alert admin via event

### Error Handling Implementation
```typescript
private async handleSyncError(error: Error, context: SyncContext): Promise<void> {
  if (error.code === 50013) { // Discord missing permissions
    this.log.error('Bot lacks permissions', { context });
    // Could notify admins through other means if needed
  } else if (error.code === 429) { // Rate limited
    const retryAfter = error.retry_after || 60;
    // For rate limiting, we'll let the next scheduled sync handle it
    this.log.warn('Discord rate limited, will retry in next sync cycle', {
      retryAfter,
      context
    });
  } else if (error instanceof errors.NotFoundError) {
    this.log.warn('Entity not found during sync', { error, context });
    // Continue with next user
  } else {
    this.log.error('Unexpected sync error', { error, context });
    throw error; // Let system worker handle the error
  }
}
```

## Testing Strategy

### Unit Tests

1. **Service Tests**
   ```typescript
   describe('DiscordService', () => {
     describe('syncUserRoles', () => {
       it('should skip users without Discord ID');
       it('should respect source of truth setting');
       it('should handle role mapping correctly');
       it('should return sync statistics');
     });
   });
   ```

2. **System Worker Tests**
   ```typescript
   describe('SystemWorker - Discord Role Sync', () => {
     it('should skip sync when disabled');
     it('should process domains with sync enabled');
     it('should handle errors gracefully');
     it('should update last sync timestamp');
     it('should process users in batches');
   });
   ```

### Integration Tests

1. **API Integration**
   ```typescript
   describe('Discord Role Sync Integration', () => {
     it('should sync roles when Discord member updated');
     it('should sync roles when Takaro role assigned');
     it('should handle settings changes');
   });
   ```

2. **End-to-End Scenarios**
   - User links Discord account → roles appear
   - Admin changes source of truth → conflicts resolved
   - Scheduled sync corrects inconsistencies

## Migration and Rollout

### Database Migration

```typescript
// File: packages/lib-db/src/migrations/sql/20250726000000-discord-role-sync.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add linkedDiscordRoleId to roles table
  await knex.schema.alterTable('roles', (table) => {
    table.string('linkedDiscordRoleId').nullable();
    table.index('linkedDiscordRoleId');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('roles', (table) => {
    table.dropColumn('linkedDiscordRoleId');
  });
  
  await knex('settings')
    .where('key', 'like', 'discordRoleSync.%')
    .delete();
}
```

### Backwards Compatibility

1. **API Compatibility**
   - Role endpoints remain backward compatible
   - New linkedDiscordRoleId field is optional
   - Settings use existing key-value system

2. **Event Compatibility**
   - Existing role assignment/removal events continue to work unchanged
   - Discord sync reacts to existing events without breaking other listeners