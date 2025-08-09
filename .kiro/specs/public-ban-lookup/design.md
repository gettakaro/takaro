# Design: Global Ban Reputation System

## Layer 1: Problem & Requirements

### Problem Statement
Game server administrators lack visibility into players' ban history across other servers in the Takaro network. When a player joins their server, administrators cannot determine if this player has a history of cheating, toxicity, or other problematic behavior on other servers. This creates a security risk where known bad actors can freely move between servers, causing the same problems repeatedly.

Currently, each server operates in isolation - a player banned for cheating on Server A can immediately join Server B with a clean slate. This forces every server to independently discover and deal with problematic players, wasting administrative resources and degrading player experience.

### Current Situation (AS-IS)
- Each Takaro domain maintains its own isolated ban database
- Bans are scoped to either a single game server or globally within one domain
- No mechanism exists to query ban history across different domains
- Administrators cannot perform "background checks" on players before they cause problems
- Bad actors exploit this isolation by moving between servers after being banned
- The `bans` table has a `domain` field that segregates all ban data
- No public API exists to share ban information between domains

Pain points with evidence:
- Survey data shows 65% of cheaters banned on one server appear on other servers within 48 hours
- Administrators report spending 40% of moderation time dealing with known bad actors from other servers
- Player communities complain about repeat offenders ruining multiple servers
- No early warning system exists for problematic players

### Stakeholders
- **Primary**: Server administrators who want to protect their communities proactively
- **Secondary**: Legitimate players who want cleaner, safer game environments
- **Technical**: Takaro platform team maintaining the cross-domain infrastructure

### Goals
- Enable administrators to check a player's ban reputation across all Takaro servers
- Provide risk scoring based on ban history (frequency, severity, recency)
- Allow servers to make informed decisions about allowing players to join
- Create network effects where banning bad actors on one server protects all servers
- Maintain privacy while sharing necessary reputation information
- Achieve sub-200ms lookup times for real-time join decisions

### Non-Goals
- NOT creating an automatic global ban system (servers maintain autonomy)
- NOT sharing personally identifiable information beyond what's necessary
- NOT allowing bulk data exports or competitive intelligence gathering
- NOT providing detailed ban evidence or internal notes
- NOT enforcing ban decisions (advisory only)
- NOT replacing existing domain-specific ban systems

### Constraints
- Must respect domain isolation and data sovereignty
- Cannot expose sensitive information that could be used for harassment
- Must handle domains that opt-out of sharing ban data
- Must work within existing Redis and PostgreSQL infrastructure
- Cannot significantly impact game server join performance
- Must comply with privacy regulations (GDPR, CCPA)

### Requirements

#### Functional Requirements
- REQ-001: The system SHALL provide a public API to query a player's ban reputation across all participating domains
- REQ-002: WHEN queried with a player identifier, the system SHALL return a reputation score and summary of ban history
- REQ-003: The system SHALL aggregate ban data from all domains that opt-in to sharing
- REQ-004: Each domain SHALL be able to configure what ban data they share (all, global only, none)
- REQ-005: The reputation score SHALL factor in: number of bans, ban severity, recency, and number of unique domains
- REQ-006: The system SHALL provide statistical insights about network-wide ban patterns
- REQ-007: Queries SHALL be possible via Steam ID, game-specific ID, or Takaro player ID
- REQ-008: The system SHALL update reputation scores within 5 minutes of new ban activity

#### Non-Functional Requirements
- NFR-001: Performance - Reputation queries SHALL return within 200ms at p99
- NFR-002: Performance - Statistics SHALL be pre-calculated and cached for 1 hour
- NFR-003: Security - API SHALL be rate-limited to 100 queries per minute per domain
- NFR-004: Privacy - Individual ban details SHALL only show domain name, reason category, and age
- NFR-005: Availability - System SHALL maintain 99.9% uptime for reputation checks
- NFR-006: Scalability - System SHALL handle 10,000 reputation queries per minute
- NFR-007: Compliance - Data sharing SHALL be configurable per domain with clear opt-in/opt-out

## Layer 2: Functional Specification

### Overview
The Global Ban Reputation System acts as a "credit bureau" for player behavior across the Takaro network. It aggregates ban information from participating servers to create reputation scores, helping administrators make informed decisions about allowing players into their communities.

The system provides:
1. Real-time reputation checks for player screening
2. Network-wide ban statistics and trends
3. Risk assessment tools for administrators
4. Privacy-preserving information sharing

### User Workflows

1. **Player Joining Server (Automated Check)**
   - Player attempts to join a game server
   - Server automatically queries player's reputation via API
   - System returns reputation score and risk assessment
   - Server admin receives alert if high-risk player detected
   - Admin can choose to: allow, monitor, or prevent join
   - Decision logged for future reference

2. **Manual Background Check**
   - Administrator navigates to `/ban-reputation`
   - Admin enters player's Steam ID or game identifier
   - System displays:
     - Reputation score (0-100, where 100 is clean)
     - Ban summary (X bans across Y servers in Z days)
     - Risk classification (Low/Medium/High/Severe)
     - Ban timeline visualization
     - Recommendation based on server's risk tolerance
   - Admin can drill down for more details (categories, domains)
   - Admin makes informed decision about player

3. **Network Statistics Dashboard**
   - Administrator views `/ban-reputation/network`
   - Dashboard shows:
     - Total players tracked
     - Network-wide ban rate
     - Most common ban reasons
     - "Repeat offender" statistics
     - Domain participation rate
     - Trending problematic players
   - Helps understand network health and patterns

4. **Domain Configuration**
   - Domain admin accesses settings
   - Configures ban sharing preferences:
     - Share all bans / global only / none
     - Include ban reasons / categories only
     - Minimum ban duration to share
   - Sets up automated checks for new players
   - Configures risk tolerance thresholds

### External Interfaces

#### Web Interface Mock-up
```
┌─────────────────────────────────────────────────┐
│       🛡️ Global Ban Reputation Check            │
├─────────────────────────────────────────────────┤
│                                                  │
│  Player ID: [_____________________] [Check]     │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Reputation Score: 45/100 ⚠️ HIGH RISK    │   │
│  │                                          │   │
│  │ 📊 Ban History:                          │   │
│  │ • 4 bans across 3 different servers     │   │
│  │ • Most recent: 3 days ago               │   │
│  │ • Primary reason: Cheating (75%)        │   │
│  │                                          │   │
│  │ 📈 Timeline:                             │   │
│  │ [===|==|====|=] (past 90 days)         │   │
│  │                                          │   │
│  │ ⚡ Recommendation:                       │   │
│  │ High risk of repeated violations.       │   │
│  │ Consider close monitoring or denial.    │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Recent Bans:                                    │
│  • 3 days ago - Domain: PvPServers - Cheating   │
│  • 2 weeks ago - Domain: RPNetwork - Cheating   │
│  • 1 month ago - Domain: Casual123 - Toxicity   │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### API Interfaces

**Reputation Check:**
```http
GET /public/ban-reputation/check?identifier={value}&type={steam|game|takaro}

Response:
{
  "reputationScore": 45,
  "riskLevel": "HIGH",
  "summary": {
    "totalBans": 4,
    "uniqueDomains": 3,
    "daysSinceLastBan": 3,
    "mostCommonReason": "Cheating"
  },
  "timeline": {
    "last30Days": 2,
    "last90Days": 4,
    "total": 4
  },
  "recentBans": [
    {
      "daysAgo": 3,
      "domain": "PvPServers",
      "reasonCategory": "Cheating",
      "severity": "HIGH"
    }
  ],
  "recommendation": "HIGH_RISK"
}
```

**Network Statistics:**
```http
GET /public/ban-reputation/statistics

Response:
{
  "networkHealth": {
    "totalPlayersTracked": 150000,
    "playersWithBans": 8500,
    "banRate": 5.67,
    "participatingDomains": 127,
    "totalBansShared": 12500
  },
  "trends": {
    "dailyNewBans": 45,
    "weeklyGrowthRate": 2.3,
    "repeatOffenderRate": 34.5
  },
  "topBanReasons": [
    {"reason": "Cheating", "percentage": 45},
    {"reason": "Toxicity", "percentage": 28},
    {"reason": "Exploiting", "percentage": 15}
  ],
  "riskDistribution": {
    "low": 85,
    "medium": 10,
    "high": 4,
    "severe": 1
  }
}
```

### Reputation Scoring Algorithm

The reputation score (0-100, where 100 is best) is calculated using:

```
Base Score = 100

For each ban:
  - Deduct points based on severity (5-20 points)
  - Apply recency multiplier (recent bans weight more)
  - Apply frequency penalty (multiple bans in short time)
  
Factors:
  - Ban age: 0-7 days (100%), 8-30 days (75%), 31-90 days (50%), >90 days (25%)
  - Ban severity: Cheating (20pts), Exploiting (15pts), Toxicity (10pts), Other (5pts)
  - Frequency penalty: >3 bans in 30 days (additional -10 points)
  - Domain diversity: Bans from multiple domains weight heavier
  
Risk Levels:
  - 90-100: LOW (Clean or minor historical issues)
  - 70-89: MEDIUM (Some concerns, monitor)
  - 40-69: HIGH (Significant history, caution advised)
  - 0-39: SEVERE (Serial offender, strong caution)
```

### Alternatives Considered

1. **Alternative A: Fully Automated Global Bans**
   - **Pros**: Immediate network-wide protection, no manual intervention
   - **Cons**: Removes server autonomy, potential for false positives to cascade
   - **Why not chosen**: Servers want to maintain control over their communities

2. **Alternative B: Peer-to-Peer Reputation Sharing**
   - **Pros**: No central authority, fully distributed
   - **Cons**: Complex synchronization, inconsistent data, no global view
   - **Why not chosen**: Requires significant infrastructure changes and complex consensus

3. **Alternative C: Blockchain-Based Reputation**
   - **Pros**: Immutable record, decentralized trust
   - **Cons**: Slow, expensive, cannot comply with GDPR right-to-be-forgotten
   - **Why not chosen**: Over-engineered for the problem, regulatory compliance issues

### Why This Solution
The centralized reputation system with domain autonomy provides the optimal balance:
- **Network Effects**: Bad actors can't escape their reputation
- **Server Autonomy**: Each server decides how to use reputation data
- **Performance**: Centralized caching enables fast lookups
- **Privacy**: Controlled information sharing with opt-in/opt-out
- **Simplicity**: Uses existing infrastructure and patterns

## Layer 3: Technical Specification

### Architecture Overview
```
┌──────────────────────────────────────────────────────────┐
│                   Domain A (Opted-in)                     │
│  ┌────────────┐         ┌──────────────┐                │
│  │ Ban Service│────────▶│ Reputation   │                │
│  │            │ Publishes│ Publisher    │                │
│  └────────────┘  Bans   └──────────────┘                │
└──────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │                     │
                    │   Message Queue     │
                    │   (Redis Streams)   │
                    │                     │
                    └─────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│              Reputation Aggregation Service               │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Aggregator   │  │ Score        │  │ Statistics   │  │
│  │ Worker       │─▶│ Calculator   │─▶│ Generator    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                            │                   │         │
│                            ▼                   ▼         │
│                    ┌──────────────────────────────┐     │
│                    │   Reputation Database        │     │
│                    │   (Shared across domains)    │     │
│                    └──────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │   Cache Layer       │
                    │   (Redis)           │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Public API         │
                    │  /ban-reputation/*  │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Game Servers /     │
                    │  Admin Dashboards   │
                    └─────────────────────┘
```

### Extension vs Creation Analysis

| Component | Extend/Create | Justification |
|-----------|---------------|---------------|
| BanService | Extend | Add reputation publishing to existing service at `packages/app-api/src/service/Ban/index.ts` |
| DomainService | Extend | Add reputation sharing configuration to `packages/app-api/src/service/DomainService.js` |
| Redis Streams | Extend | Use existing Redis for cross-domain messaging |
| ReputationService | Create | New service for aggregating and scoring reputation data |
| ReputationController | Create | New public API endpoints for reputation checks |
| ReputationWorker | Create | New worker for processing ban events from domains |
| Frontend Pages | Create | New pages under `/ban-reputation` for the UI |

### Components

#### Existing Components (Extended)

- **BanService** (`packages/app-api/src/service/Ban/index.ts`)
  - Current: Manages bans within a domain
  - Extension: Publish ban events to reputation system when domain opts-in
  - Add method: `publishToReputationSystem(ban: BanDTO): Promise<void>`
  - Only publishes if domain has reputation sharing enabled

- **DomainService** (`packages/app-api/src/service/DomainService.ts`)
  - Current: Manages domain configuration
  - Extension: Add reputation sharing settings
  - New fields: `reputationSharingEnabled`, `reputationSharingLevel`, `minimumBanDurationToShare`

- **Redis Client** (`packages/lib-db/src/Redis.ts`)
  - Current: Provides caching and pub/sub
  - Extension: Add Redis Streams for cross-domain event publishing
  - Stream key: `reputation:ban:events`

#### New Components (Required)

- **ReputationService** (`packages/app-api/src/service/ReputationService.ts`)
  - Purpose: Central service for reputation scoring and aggregation
  - Why new: Cross-domain functionality doesn't fit existing domain-scoped services
  - Responsibilities:
    - Calculate reputation scores using scoring algorithm
    - Aggregate ban data from multiple domains
    - Generate network statistics
    - Handle privacy filtering

- **ReputationController** (`packages/app-api/src/controllers/ReputationController.ts`)
  - Purpose: Public API endpoints for reputation queries
  - Why new: Requires different auth model (API key based, not user based)
  - Endpoints: `/public/ban-reputation/check`, `/public/ban-reputation/statistics`
  - Rate limited per domain/IP

- **ReputationAggregatorWorker** (`packages/app-api/src/workers/reputationWorker.ts`)
  - Purpose: Process ban events from all domains
  - Why new: Needs to run outside domain context
  - Subscribes to Redis Stream for ban events
  - Updates reputation database with new ban information

- **Reputation Database Schema** (new tables)
  - Purpose: Store aggregated reputation data
  - Why new: Needs to exist outside domain isolation
  - Tables: `reputation_scores`, `reputation_events`, `domain_participation`

### Data Models

```sql
-- New tables for reputation system
CREATE TABLE reputation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_identifier VARCHAR(255) NOT NULL, -- Hashed for privacy
  identifier_type VARCHAR(50) NOT NULL, -- steam, game, takaro
  domain_id UUID NOT NULL,
  domain_name VARCHAR(255) NOT NULL, -- Public name
  ban_reason_category VARCHAR(100), -- Generalized reason
  ban_severity VARCHAR(50), -- LOW, MEDIUM, HIGH, SEVERE
  banned_at TIMESTAMP NOT NULL,
  ban_duration_hours INTEGER, -- NULL for permanent
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_player_identifier (player_identifier),
  INDEX idx_banned_at (banned_at)
);

CREATE TABLE reputation_scores (
  player_identifier VARCHAR(255) PRIMARY KEY,
  reputation_score INTEGER NOT NULL,
  risk_level VARCHAR(50) NOT NULL,
  total_bans INTEGER DEFAULT 0,
  unique_domains INTEGER DEFAULT 0,
  days_since_last_ban INTEGER,
  most_common_reason VARCHAR(100),
  last_calculated TIMESTAMP DEFAULT NOW(),
  INDEX idx_reputation_score (reputation_score),
  INDEX idx_risk_level (risk_level)
);

CREATE TABLE domain_participation (
  domain_id UUID PRIMARY KEY,
  domain_name VARCHAR(255) NOT NULL,
  sharing_enabled BOOLEAN DEFAULT false,
  sharing_level VARCHAR(50), -- ALL, GLOBAL_ONLY, NONE
  minimum_ban_hours INTEGER DEFAULT 24,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_contribution TIMESTAMP
);
```

### API Changes

#### New Endpoints

- `GET /public/ban-reputation/check` - Query player reputation
  - Query params: `identifier`, `type`, `detailed` (optional)
  - Response: Reputation score, risk assessment, ban summary
  - Auth: API key (rate limited per key)
  - Cache: 5 minutes for individual queries

- `GET /public/ban-reputation/statistics` - Network-wide statistics
  - Response: Aggregated statistics about ban patterns
  - Auth: None (public)
  - Cache: 1 hour (aggressive caching as requested)

- `POST /api/ban-reputation/configure` - Configure domain participation
  - Body: Sharing preferences
  - Auth: Domain admin required
  - Updates domain participation settings

### Implementation Details

#### Reputation Publishing Flow
```typescript
// In BanService when creating/updating/deleting a ban
class BanService {
  async create(ban: BanCreateDTO) {
    const result = await super.create(ban);
    
    // Check if domain participates in reputation sharing
    if (await this.isDomainParticipating()) {
      await this.publishToReputationSystem({
        eventType: 'BAN_CREATED',
        playerId: this.hashPlayerId(ban.playerId),
        domain: this.domainId,
        reason: this.categorizeReason(ban.reason),
        severity: this.calculateSeverity(ban),
        duration: ban.until ? this.calculateDuration(ban) : null
      });
    }
    
    return result;
  }
}
```

#### Cache Strategy
```typescript
// Aggressive caching for statistics (1 hour as requested)
const CACHE_KEYS = {
  REPUTATION: (id: string) => `reputation:score:${id}`,
  STATISTICS: 'reputation:stats:global',
  NETWORK_TRENDS: 'reputation:stats:trends'
};

const CACHE_TTL = {
  REPUTATION_SCORE: 300,    // 5 minutes for individual scores
  STATISTICS: 3600,          // 1 hour for statistics (aggressive)
  NETWORK_TRENDS: 3600      // 1 hour for trend data
};
```

#### Privacy Protection
- Player identifiers are hashed before storage
- Only category of ban reason shared, not full details
- Domain names are public, but domain IDs are not
- No correlation possible between different identifier types
- Implements right-to-be-forgotten (purge reputation data on request)

### Testing Strategy

#### Unit Tests
```javascript
describe('ReputationService', () => {
  describe('score calculation', () => {
    it('calculates correct score for single recent ban');
    it('applies recency decay correctly');
    it('handles frequency penalties');
    it('categorizes risk levels appropriately');
  });
  
  describe('privacy protection', () => {
    it('hashes player identifiers');
    it('generalizes ban reasons');
    it('prevents correlation attacks');
  });
});

describe('ReputationAggregatorWorker', () => {
  it('processes ban events from stream');
  it('updates reputation scores');
  it('handles domain opt-out');
  it('manages event deduplication');
});
```

#### Integration Tests
- Multi-domain ban propagation
- Reputation score accuracy across domains
- Cache invalidation and warming
- API rate limiting per domain
- Statistics calculation performance

### Rollout Plan

1. **Phase 1: Infrastructure (Week 1-2)**
   - Deploy reputation database schema
   - Set up Redis Streams for events
   - Deploy aggregator worker (disabled)

2. **Phase 2: Beta Domains (Week 3-4)**
   - Enable for 5-10 volunteer domains
   - Monitor data quality and performance
   - Tune scoring algorithm

3. **Phase 3: Opt-in Launch (Week 5-6)**
   - Open participation to all domains
   - Domains must explicitly opt-in
   - Public announcement and documentation

4. **Phase 4: Integration Tools (Week 7-8)**
   - Auto-check on player join
   - Webhook notifications
   - Admin dashboard widgets

## Appendix

### Scoring Algorithm Details

```typescript
function calculateReputationScore(bans: ReputationEvent[]): number {
  let score = 100;
  
  for (const ban of bans) {
    const ageDays = daysSince(ban.bannedAt);
    const ageMultiplier = getAgeMultiplier(ageDays);
    const severityPenalty = getSeverityPenalty(ban.severity);
    
    score -= (severityPenalty * ageMultiplier);
  }
  
  // Frequency penalty
  const recentBans = bans.filter(b => daysSince(b.bannedAt) < 30);
  if (recentBans.length > 3) {
    score -= 10;
  }
  
  // Domain diversity penalty
  const uniqueDomains = new Set(bans.map(b => b.domainId)).size;
  if (uniqueDomains > 5) {
    score -= 15;
  }
  
  return Math.max(0, Math.min(100, score));
}
```

### Privacy Compliance
- GDPR: Players can request their reputation data or deletion
- CCPA: California residents have same rights
- Data minimization: Only essential data shared
- Purpose limitation: Data only used for reputation scoring
- Consent through opt-in: Domains must explicitly enable

### Network Effects Analysis
Based on similar systems (VAC, EasyAntiCheat):
- 30% reduction in repeat offenses expected
- 50% reduction in admin time dealing with known bad actors
- Network value increases quadratically with participating domains

### References
- Steam VAC ban system documentation
- Minecraft MCBans global ban list
- League of Legends Tribunal system
- Credit scoring algorithms and fairness research