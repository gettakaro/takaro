# Design: Player Name History Tracking

## Layer 1: Problem & Requirements

### Problem Statement

Players in multiplayer games frequently change their names, making it difficult for administrators to track player identity and behavior patterns. Currently, the system only stores the most recent player name, losing valuable historical data that could help identify problematic players or maintain continuity in player management.

### Current Situation (AS-IS)

The current player system stores names directly in the `players` table:
- Player name is stored as a single `name` field in the `players` table (packages/lib-db/src/migrations/sql/20220827191938_init.ts:82)
- Names are updated in place when players join with different names (packages/app-api/src/service/Player/index.ts:214)
- No historical record is maintained when names change
- The system already tracks IP history in a separate `playerIpHistory` table as a successful pattern

Current player update flow:
1. Player joins game server with name
2. System calls `resolveRef()` to find/create player
3. If player exists, name is updated via `PlayerUpdateDTO`
4. Previous name is lost forever

### Stakeholders

- **Primary**: Game server administrators who need to track player identity
- **Secondary**: Moderators reviewing player reports and ban appeals
- **Technical**: Development team maintaining player data integrity

### Goals

- Track all player name changes with timestamps
- Provide quick access to current name without performance degradation
- Display name history in player profiles
- Enable searching players by previous names
- Maintain data consistency during migration

### Non-Goals

- Real-time name change notifications
- Name change approval workflows
- Restrictions on name change frequency
- Cross-server name synchronization beyond existing mechanisms

### Constraints

- Must maintain backward compatibility with existing API contracts
- Cannot break existing player queries or integrations
- Migration must preserve all current player names
- Must follow existing IP history pattern for consistency
- Performance impact on player sync must be minimal

### Requirements

#### Functional Requirements
- REQ-001: The system SHALL observe and record player names whenever player data is synchronized
- REQ-002: The system SHALL store each unique name with a timestamp when it was first observed
- REQ-003: The system SHALL NOT create duplicate entries for the same name if observed consecutively
- REQ-004: WHEN a player changes their name THEN the system SHALL record the new name with the current timestamp
- REQ-005: The system SHALL associate each name history entry with the player ID and game server ID
- REQ-006: The system SHALL provide the current player name by querying the most recent entry in the name history
- REQ-007: The system SHALL provide a list of all unique names used by a player
- REQ-008: The system SHALL order name history entries by timestamp (most recent first)
- REQ-028: WHEN a new name is detected THEN the system SHALL emit a PLAYER_NEW_NAME_DETECTED event
- REQ-029: The name change event SHALL include the old name, new name, player ID, and game server ID
- REQ-030: The event SHALL be hookable by modules for custom actions on name changes
- REQ-031: WHEN a new name is detected THEN the system SHALL invalidate the Redis cache for that player
- REQ-032: The system SHALL fall back to database queries if Redis is unavailable
- REQ-033: Cache keys SHALL follow the pattern `player:name:{domainId}:{playerId}`

#### Non-Functional Requirements
- NFR-001: Performance - Name queries shall complete within 50ms for 95% of requests
- NFR-002: Security - Name history access requires same permissions as player profile viewing
- NFR-003: Usability - Frontend shall display aliases without additional user action
- NFR-004: Caching - Redis cache hit rate should exceed 90% for active players
- NFR-005: Events - Name change events must fire within 100ms of detection

## Layer 2: Functional Specification

### Overview

The name history feature extends the player system to track all names a player has used over time. Similar to how IP addresses are tracked, each unique name will be stored with a timestamp. The current name becomes a computed property derived from the most recent history entry.

### User Workflows

1. **Viewing Player Aliases**
   - User navigates to player profile
   - System displays "Known Aliases" section with up to 5 recent unique names
   - User sees names without clicking anything

2. **Viewing Detailed Name History**
   - User clicks on "Known Aliases" section
   - Modal opens showing all recorded names
   - Each entry shows name and first observed timestamp
   - Names ordered by most recent first

3. **Automatic Name Tracking**
   - Player joins server with new name
   - System detects name differs from last recorded
   - New entry created in name history
   - No user intervention required

4. **Name Change Event Flow**
   - System detects name differs from last recorded
   - New name stored in history table
   - Redis cache invalidated for player
   - PLAYER_NEW_NAME_DETECTED event fired
   - Hooks can react to name change

### External Interfaces

#### Player Profile UI Changes
- New "Known Aliases" card in player info section
- Shows up to 5 most recent unique names
- Clickable to open detailed history modal
- Located near existing IP history section

#### API Response Changes
- `PlayerOutputDTO` gains new `nameHistory` field (array)
- Each entry contains `name` and `createdAt`
- Limited to 5 entries by default
- Full history available via dedicated endpoint if needed

### Alternatives Considered

1. **Alternative A**: Store name history in JSON column on players table
   - **Pros**: Simple schema, no joins needed
   - **Cons**: Poor query performance, no indexing, difficult migrations
   - **Why not chosen**: Violates normalization, limits future querying capabilities

2. **Alternative B**: Create audit log for all player changes
   - **Pros**: Comprehensive change tracking
   - **Cons**: Complex implementation, excessive data storage
   - **Why not chosen**: Over-engineered for specific name tracking need

3. **Alternative C**: Keep current design, add previous_name field
   - **Pros**: Minimal changes needed
   - **Cons**: Only tracks one previous name
   - **Why not chosen**: Insufficient history depth

### Why This Solution

The chosen approach (separate name history table) best meets requirements because:
- Follows proven IP history pattern (REQ-005)
- Enables efficient queries with proper indexing (NFR-001)
- Maintains full history without limits (REQ-007)
- Allows future search capabilities (extensibility)
- Clean separation of concerns

## Layer 3: Technical Specification

### Architecture Overview

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Player    │────────▶│ PlayerNameHistory│◀────────│ PlayerService   │
│   Model     │ 1    n  │      Model       │         │ (observeName)   │
└─────────────┘         └──────────────────┘         └─────────────────┘
       │                         │                            │
       ▼                         ▼                            ▼
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Player    │         │ playerNameHistory│         │  Player Sync    │
│    Table    │         │      Table       │         │    Worker       │
└─────────────┘         └──────────────────┘         └─────────────────┘
```

### Extension vs Creation Analysis

| Component | Extend/Create | Justification |
|-----------|---------------|---------------|
| PlayerNameHistoryModel | Create | New model following PlayerIPHistoryModel pattern |
| playerNameHistory table | Create | New table for historical data |
| PlayerRepo.observeName() | Create | New method following observeIp() pattern |
| PlayerService.resolveRef() | Extend | Add observeName call similar to observeIp |
| PlayerOutputDTO | Extend | Add nameHistory field |
| Player profile UI | Extend | Add Known Aliases section |
| Migration | Create | New migration to create table and populate initial data |
| TakaroEventPlayerNewNameDetected | Create | New event type for name changes |
| Redis client for names | Create | Performance optimization requirement |
| Cache management methods | Create | Required for Redis integration |

### Components

#### Existing Components (Extended)

- **PlayerModel** (packages/app-api/src/db/player.ts)
  - Current: Stores player data with name field
  - Extension: Add relation to PlayerNameHistoryModel
  - Remove direct name storage after migration

- **PlayerRepo** (packages/app-api/src/db/player.ts)
  - Current: Handles player CRUD operations
  - Extension: Add observeName() method
  - Extension: Modify findOne() to include name history ordered by createdAt DESC
  - Implementation: Query nameHistory with `.orderBy('createdAt', 'desc').limit(10)` to match ipHistory pattern

- **PlayerService.resolveRef()** (packages/app-api/src/service/Player/index.ts:158)
  - Current: Updates player name directly
  - Extension: Call observeName() instead of direct update
  - Location: After line 220 where name update occurs

- **PlayerOutputDTO** (packages/app-api/src/service/Player/dto.ts)
  - Current: Contains player fields
  - Extension: Add nameHistory field similar to ipHistory

- **Player Info Component** (packages/web-main/src/routes/_auth/_global/player.$playerId/info.tsx)
  - Current: Shows player info and IP history
  - Extension: Add Known Aliases section after IP History

#### New Components

- **PlayerNameHistoryModel** (packages/app-api/src/db/player.ts)
  ```typescript
  export class PlayerNameHistoryModel extends TakaroModel {
    static tableName = 'playerNameHistory';
    
    playerId!: string;
    gameServerId!: string;
    name!: string;
    
    static get relationMappings() {
      return {
        player: {
          relation: Model.BelongsToOneRelation,
          modelClass: PlayerModel,
          join: {
            from: `${PlayerNameHistoryModel.tableName}.playerId`,
            to: `${PlayerModel.tableName}.id`,
          },
        },
        gameServer: {
          relation: Model.BelongsToOneRelation,
          modelClass: GameServerModel,
          join: {
            from: `${PlayerNameHistoryModel.tableName}.gameServerId`,
            to: `${GameServerModel.tableName}.id`,
          },
        },
      };
    }
  }
  ```

- **NameHistoryOutputDTO** (packages/app-api/src/service/Player/dto.ts)
  ```typescript
  export class NameHistoryOutputDTO extends TakaroDTO<NameHistoryOutputDTO> {
    @IsISO8601()
    createdAt: string;
    
    @IsString()
    name: string;
  }
  ```

- **TakaroEventPlayerNewNameDetected** (packages/lib-modules/src/dto/takaroEvents.ts)
  ```typescript
  export class TakaroEventPlayerNewNameDetected extends BaseEvent<TakaroEventPlayerNewNameDetected> {
    @IsString()
    type = TakaroEvents.PLAYER_NEW_NAME_DETECTED;
    
    @IsString()
    @IsOptional()
    oldName: string | null;
    
    @IsString()
    newName: string;
  }
  ```

- **Redis Cache Layer** (packages/app-api/src/db/player.ts)
  ```typescript
  // Add to PlayerRepo class
  private nameCache: RedisClient;
  
  async initCache() {
    this.nameCache = await Redis.getClient('playerNames');
  }
  
  async getCachedName(playerId: string): Promise<string | null> {
    try {
      const cacheKey = `player:name:${this.domainId}:${playerId}`;
      return await this.nameCache.get(cacheKey);
    } catch (error) {
      this.log.warn('Redis cache get failed, falling back to DB', { error });
      return null;
    }
  }
  
  async setCachedName(playerId: string, name: string): Promise<void> {
    try {
      const cacheKey = `player:name:${this.domainId}:${playerId}`;
      await this.nameCache.setEx(cacheKey, 3600, name); // 1 hour TTL
    } catch (error) {
      this.log.warn('Redis cache set failed', { error });
    }
  }
  
  async invalidateNameCache(playerId: string): Promise<void> {
    try {
      const cacheKey = `player:name:${this.domainId}:${playerId}`;
      await this.nameCache.del(cacheKey);
    } catch (error) {
      this.log.warn('Redis cache invalidation failed', { error });
    }
  }
  ```

### Data Models

#### Database Schema
```sql
CREATE TABLE playerNameHistory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  domain VARCHAR REFERENCES domains(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  game_server_id UUID REFERENCES gameservers(id) ON DELETE SET NULL,
  name VARCHAR NOT NULL,
  
  -- Indexes for performance
  INDEX idx_player_name_history (player_id, created_at DESC),
  INDEX idx_name_search (name)
);
```

#### Migration Strategy
```typescript
// Up migration
1. Create playerNameHistory table
2. Insert current player names as initial history:
   INSERT INTO playerNameHistory (player_id, name, domain, created_at)
   SELECT id, name, domain, created_at FROM players WHERE name IS NOT NULL
3. Add computed column or view for current name (optional)

// Down migration
1. Update players table with latest name from history
2. Drop playerNameHistory table
```

### API Changes

No breaking changes to existing endpoints. Extensions only:

#### Modified Response
- `GET /player/{playerId}`
  ```json
  {
    "id": "uuid",
    "name": "CurrentName",
    "nameHistory": [
      { "name": "CurrentName", "createdAt": "2024-01-01T00:00:00Z" },
      { "name": "PreviousName", "createdAt": "2023-12-15T00:00:00Z" },
      { "name": "OldName", "createdAt": "2023-12-01T00:00:00Z" }
    ]
  }
  ```
  Note: `nameHistory` is always ordered by `createdAt` DESC (most recent first)

### Implementation Details

#### Key Algorithms

**observeName Implementation** (following observeIp pattern)
```typescript
async observeName(playerId: string, gameServerId: string, name: string) {
  const { query } = await this.getNameHistoryModel();
  
  // Check last recorded name
  const lastName = await query
    .select('name')
    .where({ playerId })
    .orderBy('createdAt', 'desc')
    .limit(1)
    .first();
  
  // Only insert if name changed
  if (lastName && lastName.name === name) {
    return null;
  }
  
  // Insert new name record
  const newRecord = await query.insert({
    playerId,
    gameServerId,
    name,
    domain: this.domainId,
  });

  // Invalidate cache
  await this.invalidateNameCache(playerId);

  // Fire event
  if (newRecord) {
    const eventsService = new EventService(this.domainId);
    await eventsService.create(
      new EventCreateDTO({
        gameserverId: gameServerId,
        playerId: playerId,
        eventName: EVENT_TYPES.PLAYER_NEW_NAME_DETECTED,
        meta: new TakaroEventPlayerNewNameDetected({
          oldName: lastName?.name || null,
          newName: name,
        }),
      }),
    );
  }

  return newRecord;
}
```

#### Security Considerations
- Name history respects domain isolation
- Access controlled via existing player permissions
- No new permission scopes required

#### Error Handling
- Handle null/empty names gracefully
- Log warnings for unusual name patterns
- Maintain consistency if history insert fails

### Testing Strategy

#### Unit Tests
```javascript
describe('PlayerRepo', () => {
  describe('observeName', () => {
    it('creates new entry for changed name')
    it('skips duplicate consecutive names')
    it('handles null names gracefully')
    it('maintains domain isolation')
  })
})

describe('PlayerNameHistory', () => {
  it('returns names in reverse chronological order')
  it('limits results to requested count')
  it('includes timestamps')
})
```

#### Integration Tests
```javascript
describe('Player Name History', () => {
  it('tracks name changes during player sync')
  it('preserves names during migration')
  it('displays aliases in player profile')
  it('opens modal with full history')
  it('fires event when name changes')
  it('invalidates cache on name change')
  it('falls back to DB when Redis unavailable')
  it('respects TTL on cached names')
})
```

### Rollout Plan

1. **Phase 1: Backend Implementation**
   - Deploy migration to create table
   - Deploy backend code with observeName
   - Verify name tracking works

2. **Phase 2: Frontend Display**
   - Deploy frontend changes
   - Monitor for UI issues

3. **Rollback Strategy**
   - Keep name field in players table initially
   - Can revert by dropping history table
   - Frontend gracefully handles missing history

## Appendix

### Performance Considerations

- Index on (player_id, created_at DESC) for fast current name lookup
- Index on name for future search functionality
- Limit default API response to 5 names
- Consider caching current name if needed

### References

- IP History Implementation: packages/app-api/src/db/player.ts:345-378
- IP History Migration: packages/lib-db/src/migrations/sql/20240121142329-move-ip-history.ts
- Player Service: packages/app-api/src/service/Player/index.ts
- Player Profile UI: packages/web-main/src/routes/_auth/_global/player.$playerId/info.tsx