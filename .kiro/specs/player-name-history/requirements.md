# Player Name History Tracking Requirements

## Introduction

This feature adds the ability to track player name changes over time, similar to how IP address history is currently tracked. This provides administrators with valuable insights into player identity changes and helps identify players who frequently change their names.

## User Stories

### As an administrator
- **I want** to see a history of names a player has used
- **So that** I can identify players who change their names frequently and track player identity across name changes

### As an administrator viewing a player profile
- **I want** to see the player's known aliases prominently displayed
- **So that** I can quickly identify if this player has used other names

### As an administrator
- **I want** to see detailed name history with timestamps
- **So that** I can understand when name changes occurred and identify patterns

### As a system operator
- **I want** name history to be automatically tracked without manual intervention
- **So that** the system maintains a complete audit trail of player names

## Acceptance Criteria

### Data Collection
- **REQ-001**: The system SHALL observe and record player names whenever player data is synchronized
- **REQ-002**: The system SHALL store each unique name with a timestamp when it was first observed
- **REQ-003**: The system SHALL NOT create duplicate entries for the same name if observed consecutively
- **REQ-004**: WHEN a player changes their name THEN the system SHALL record the new name with the current timestamp
- **REQ-005**: The system SHALL associate each name history entry with the player ID and game server ID

### Event System
- **REQ-028**: WHEN a new name is detected THEN the system SHALL emit a PLAYER_NEW_NAME_DETECTED event
- **REQ-029**: The name change event SHALL include the old name, new name, player ID, and game server ID
- **REQ-030**: The event SHALL be hookable by modules for custom actions on name changes

### Data Retrieval
- **REQ-006**: The system SHALL provide the current player name by querying the most recent entry in the name history
- **REQ-007**: The system SHALL provide a list of all unique names used by a player
- **REQ-008**: The system SHALL order name history entries by timestamp (most recent first)
- **REQ-009**: The system SHALL provide the timestamp when each name was first observed

### Frontend Display
- **REQ-010**: The player profile page SHALL display a "Known Aliases" section
- **REQ-011**: The Known Aliases section SHALL show up to 5 most recent unique names
- **REQ-012**: WHEN no name history exists THEN the system SHALL display "No aliases recorded"
- **REQ-013**: The Known Aliases section SHALL be clickable to open a detailed view
- **REQ-014**: The detailed view modal SHALL display all recorded names with timestamps
- **REQ-015**: The detailed view SHALL display names in reverse chronological order

### Performance Requirements
- **REQ-016**: The system SHALL cache the current player name in Redis with a 1-hour TTL
- **REQ-017**: The system SHALL use appropriate database indexes for name history queries
- **REQ-018**: The system SHALL limit the initial display to 5 aliases to minimize data transfer
- **REQ-031**: WHEN a new name is detected THEN the system SHALL invalidate the Redis cache for that player
- **REQ-032**: The system SHALL fall back to database queries if Redis is unavailable
- **REQ-033**: Cache keys SHALL follow the pattern `player:name:{domainId}:{playerId}`

### Data Integrity
- **REQ-019**: The system SHALL maintain referential integrity between name history and player records
- **REQ-020**: WHEN a player is deleted THEN their name history SHALL also be deleted
- **REQ-021**: The system SHALL handle null or empty names gracefully
- **REQ-022**: The system SHALL NOT lose the current name when migrating existing data

## Non-Functional Requirements

### Compatibility
- **REQ-023**: The system SHALL maintain backward compatibility with existing player queries
- **REQ-024**: The migration SHALL preserve all existing player names as the initial history entry
- **REQ-025**: The system SHALL work with all supported game server types

### Security
- **REQ-026**: Name history SHALL respect domain-based data isolation
- **REQ-027**: Access to name history SHALL require the same permissions as viewing player profiles

### Performance
- **NFR-001**: Name queries SHALL complete within 50ms for 95% of requests
- **NFR-002**: Redis cache hit rate SHALL exceed 90% for active players
- **NFR-003**: Name change events SHALL fire within 100ms of detection

## Constraints

- The implementation must follow the existing pattern used for IP history tracking
- The solution must be compatible with the existing player data model
- Database migrations must be reversible
- The feature must not significantly impact player sync performance

## Success Metrics

- All existing player names are preserved after migration
- Name changes are tracked within one sync cycle
- Frontend displays aliases without noticeable performance impact
- No increase in player sync errors after deployment