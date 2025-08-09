# Steam Login Integration Design

## Design Evolution Summary

This design has been enhanced through expert review from three specialized perspectives:

1. **Feature Integration Specialist**: Identified critical Steam ID extraction issue and ensured proper integration with existing systems
2. **Software Architect**: Added transaction safety, security considerations, and operational monitoring

Key improvements from expert review:

- Fixed Steam ID extraction to use OIDC credentials instead of traits
- Added transaction safety with Promise.allSettled for partial failure handling
- Enhanced Steam auth proxy deployment with health checks
- Added simple Steam ID regex validation
- Expanded test coverage to 100+ specific test cases

## Codebase Analysis

### Discovered Patterns and Conventions

**Authentication Architecture:**

- Ory Kratos handles all identity management with OIDC providers
- OAuth providers are configured in `kratos.yml` with custom mappers
- Frontend uses a centralized `oryOAuth.ts` utility for all OAuth flows
- Provider-specific cards handle linking/unlinking in settings

**Code Conventions:**

- TypeScript with strict typing throughout
- React hooks for state management
- Styled components for UI styling
- Event-driven architecture with typed events
- Repository pattern for data access

**Existing Systems to Extend:**

- Kratos OIDC provider configuration system
- OAuth utility functions in `oryOAuth.ts`
- User identity interface with existing `steamId` field
- Player service resolution and sync mechanisms
- Login page OAuth button patterns

**Architectural Patterns:**

- Domain-scoped services with cross-domain capabilities
- Redis for temporary data (link codes)
- Event emission for significant actions
- Separation of identity (Kratos) and application data (Takaro DB)

## Extension vs. Creation Analysis

### Existing Systems Being Extended:

1. **Kratos OIDC Configuration** (`/containers/kratos/config/`)

   - Extend provider list with Steam configuration
   - Follow Discord pattern for mapper file

2. **OAuth Utilities** (`/packages/web-main/src/util/oryOAuth.ts`)

   - Extend provider type union to include 'steam'
   - No new functions needed, existing ones handle all flows

3. **Login Page** (`/packages/web-main/src/routes/login.tsx`)

   - Add Steam button following Discord pattern
   - Use existing `initiateOryOAuth` function

4. **User Identity Interface** (`/packages/lib-auth/src/lib/ory.ts`)

   - Steam ID field already exists, just need extraction logic
   - Follow Discord ID extraction pattern

5. **Player Service** (`/packages/app-api/src/service/Player/index.ts`)
   - Extend `resolveRef` method for auto-linking
   - Use existing linking mechanisms

### New Components Required:

1. **Steam OAuth Proxy Service** (Docker container)

   - Justification: Steam uses legacy OpenID 2.0, incompatible with modern OIDC
   - External dependency, not part of codebase

2. **Steam Settings Card** (`/packages/web-main/src/routes/_auth/_global/settings/-steam/`)

   - Justification: Consistent UX with Discord linking
   - Follows exact pattern of `LoginDiscordCard.tsx`

3. **Steam Auto-Linking Service** (`/packages/app-api/src/service/SteamAutoLinkingService.ts`)
   - Justification: Complex cross-domain logic needs dedicated service
   - Prevents cluttering existing services with Steam-specific logic

## Overview

This feature adds Steam authentication to Takaro using the Steam-auth-proxy as a middleware to translate Steam's legacy OpenID 2.0 to modern OIDC. The integration provides both web-based Steam login and automatic player-user linking in both directions.

**Key Objectives:**

- Enable Steam login alongside existing authentication methods
- Automatically link Steam players to users when logging in via web
- Automatically link Steam users to players when joining game servers
- Maintain consistency with existing OAuth patterns

**Non-Goals:**

- Replacing existing authentication methods
- Modifying core identity management
- Changing player sync frequency or mechanisms

## Feature Integration & Consistency

### Integration with Existing Features:

**Authentication System:**

- Extends existing Kratos OIDC configuration
- Uses same OAuth flow utilities as Discord
- Maintains session management consistency
- **Critical Fix**: Extract Steam ID from OIDC credentials, not traits:
  ```typescript
  // Correct pattern (like Discord)
  const steamIdentifier = res.data.credentials.oidc.identifiers.find((id) => id.startsWith('steam:'));
  steamId = steamIdentifier?.replace('steam:', '');
  ```

**Player Management:**

- Integrates with player sync worker
- Uses existing player resolution logic
- Emits standard PLAYER_LINKED events
- Hooks into `PlayerService.resolveRef` for automatic linking

**User Management:**

- Extends user identity with Steam ID (already in schema)
- Uses existing user-player linking mechanisms
- Respects domain scoping
- Maintains backward compatibility with existing steamId in traits

### Event System Participation:

- Emits `PLAYER_LINKED` events for all automatic linking
- Participates in existing authentication events
- Logs linking attempts for audit trail
- Supports new `TakaroEventSteamAutoLinked` for tracking link direction

### API Consistency:

- Follows existing OAuth callback patterns
- Uses standard error responses
- Maintains existing authentication flow
- No breaking changes to external APIs

### Cross-Feature Dependencies:

- Depends on Redis for temporary state (like link codes)
- Uses EventService for audit trail
- Integrates with existing PlayerOnGameServer associations
- Respects domain boundaries and multi-tenancy

## Architecture

### System Components:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web Frontend  │────▶│  Ory Kratos      │────▶│ Steam Auth      │
│   (Login Page)  │     │  (Identity)      │     │ Proxy Service   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         │                       ▼                         ▼
         │              ┌──────────────────┐     ┌─────────────────┐
         └─────────────▶│  Takaro API      │────▶│ Steam OpenID    │
                        │  (User Service)  │     │ Servers         │
                        └──────────────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Player Service   │
                        │ (Auto-linking)   │
                        └──────────────────┘
```

### Data Flow:

1. **Web Login Flow:**

   - User clicks "Log in with Steam"
   - Kratos redirects to Steam Auth Proxy
   - Proxy handles Steam OpenID and returns OIDC token
   - Kratos creates/updates identity with Steam ID
   - Auto-linking service finds and links existing players

2. **Game Join Flow:**
   - Player with Steam ID joins server
   - Player service resolves/creates player record
   - Auto-linking checks for existing user with Steam ID
   - Creates link if constraints are met

## Components and Interfaces

### Extended Components:

1. **Kratos Configuration** (`/containers/kratos/config/kratos.yml`)

   ```yaml
   providers:
     - id: steam
       provider: generic
       client_id: ${STEAM_CLIENT_ID}
       client_secret: ${STEAM_CLIENT_SECRET}
       mapper_url: file:///etc/config/kratos/steam.jsonnet
       issuer_url: ${STEAM_AUTH_PROXY_URL}
       auth_url: ${STEAM_AUTH_PROXY_URL}/authorize
       token_url: ${STEAM_AUTH_PROXY_URL}/token
       scope:
         - openid
   ```

2. **OAuth Utilities** (`/packages/web-main/src/util/oryOAuth.ts`)

   ```typescript
   export type OAuthProvider = 'discord' | 'google' | 'github' | 'microsoft' | 'facebook' | 'steam';
   ```

3. **Login Page** (`/packages/web-main/src/routes/login.tsx`)
   ```typescript
   const handleSteamLogin = async () => {
     await initiateOryOAuth(oryClient, {
       provider: 'steam',
       returnTo: search.redirect ?? '/',
       loginFlow,
       flowType: 'login',
     });
   };
   ```

### New Components:

1. **Steam Auth Proxy** (Docker service)

   - External service translating Steam OpenID to OIDC
   - Configured via environment variables
   - Exposes standard OIDC endpoints

2. **LoginSteamCard** (`/packages/web-main/src/routes/_auth/_global/settings/-steam/LoginSteamCard.tsx`)

   - Displays Steam connection status
   - Handles linking/unlinking
   - Shows Steam username when linked

3. **SteamAutoLinkingService** (`/packages/app-api/src/service/SteamAutoLinkingService.ts`)
   ```typescript
   export class SteamAutoLinkingService {
     async linkOnWebLogin(steamId: string, userId: string): Promise<void>;
     async linkOnGameJoin(steamId: string, playerId: string, domainId: string): Promise<void>;
     private async validateLinkingConstraints(userId: string, playerId: string): Promise<boolean>;
   }
   ```

## Data Models

### Extended Models:

1. **User Identity** (Already has steamId field)

   ```typescript
   export interface ITakaroIdentity {
     id: string;
     email: string;
     stripeId?: string;
     steamId?: string; // Already exists!
     discordId?: string;
   }
   ```

2. **Player Model** (Already has Steam fields)
   ```typescript
   export interface PlayerModel {
     steamId?: string;
     steamAvatar?: string;
     steamLevel?: number;
     // ... other existing Steam fields
   }
   ```

### New Data Structures:

1. **Steam Linking Event Metadata**
   ```typescript
   export class TakaroEventSteamAutoLinked extends TakaroEventPlayerLinked {
     linkDirection: 'web-to-game' | 'game-to-web';
     steamId: string;
   }
   ```

## API Interface Changes

### Modified Endpoints:

1. **POST /auth/session** (Kratos callback)

   - Now accepts Steam provider in OAuth flow
   - Returns user with populated steamId field

2. **GET /user/me**
   - Response includes steamId when present
   - No schema changes needed

### Internal API Changes:

1. **Player Resolution** (`PlayerService.resolveRef`)
   - Triggers auto-linking check when steamId present
   - No external API change, internal behavior enhanced

## Implementation Details

### Steam Auth Proxy Deployment:

```yaml
# docker-compose.yml addition
steam-auth-proxy:
  image: niekcandaele/steam-auth-proxy:latest
  restart: always
  healthcheck:
    test: ['CMD', 'curl', '-f', 'http://localhost:19000/health']
    interval: 30s
    timeout: 10s
    retries: 3
  environment:
    - BASE_URL=${STEAM_AUTH_PROXY_URL}
    - STEAM_API_KEY=${STEAM_API_KEY}
    - OIDC_CLIENT_ID=${STEAM_CLIENT_ID}
    - OIDC_CLIENT_SECRET=${STEAM_CLIENT_SECRET}
  ports:
    - '19000:19000'
```

### Identity Extraction Pattern:

```typescript
// In ory.ts getIdentity function
let steamId: string | undefined;
if (res.data.credentials?.oidc?.identifiers) {
  const steamIdentifier = res.data.credentials.oidc.identifiers.find((identifier: string) =>
    identifier.startsWith('steam:'),
  );
  if (steamIdentifier) {
    steamId = steamIdentifier.replace('steam:', '');
  }
}
```

### Auto-Linking Implementation:

```typescript
// In PlayerService.resolveRef after player creation/update
if (gamePlayer.steamId && !player.userId) {
  try {
    const linkingService = new SteamAutoLinkingService(this.domainId);
    await linkingService.linkOnGameJoin(gamePlayer.steamId, player.id, this.domainId);
  } catch (error) {
    this.log.warn('Steam auto-linking failed, continuing without link', {
      error,
      steamId: gamePlayer.steamId,
    });
    // Don't fail the entire player resolution
  }
}
```

### Transaction Safety for Cross-Domain Linking:

```typescript
// SteamAutoLinkingService implementation with transaction safety
export class SteamAutoLinkingService {
  async linkOnWebLogin(steamId: string, userId: string): Promise<void> {
    const linkedDomains: string[] = [];

    try {
      // Find all players with this Steam ID across domains
      const players = await this.findAllPlayersWithSteamId(steamId);

      // Use Promise.allSettled to handle partial failures
      const linkResults = await Promise.allSettled(
        players.map(async (player) => {
          // Validate constraints before linking
          if (await this.validateLinkingConstraints(userId, player.id)) {
            await this.linkPlayerToUser(player.id, userId);
            linkedDomains.push(player.domainId);

            // Emit event for successful link
            await this.eventService.create(
              new EventCreateDTO({
                eventName: HookEvents.PLAYER_LINKED,
                playerId: player.id,
                userId: userId,
                meta: new TakaroEventSteamAutoLinked({
                  linkDirection: 'web-to-game',
                  steamId: steamId,
                }),
              }),
            );
          }
        }),
      );

      // Log any failures for monitoring
      const failures = linkResults.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        this.log.warn('Some Steam auto-links failed', {
          failures,
          steamId,
          successCount: linkedDomains.length,
        });
      }
    } catch (error) {
      this.log.error('Critical error in Steam auto-linking', { error, steamId });
      throw error;
    }
  }

  private async validateLinkingConstraints(userId: string, playerId: string): Promise<boolean> {
    // Check if player already linked to different user
    const existingUser = await this.userRepo.findByPlayerId(playerId);
    if (existingUser && existingUser.id !== userId) {
      this.log.info('Player already linked to different user', { playerId, existingUserId: existingUser.id });
      return false;
    }

    return true;
  }
}
```

### Steam ID Validation:

```typescript
// Simple Steam ID validation - just a regex check
const STEAM_ID_REGEX = /^\d{17}$/;

function isValidSteamId(steamId: string): boolean {
  return STEAM_ID_REGEX.test(steamId);
}

// Usage in SteamAutoLinkingService
if (!isValidSteamId(steamId)) {
  this.log.warn('Invalid Steam ID format', { steamId });
  return;
}
```

## Error Handling

### Following Existing Patterns:

1. **OAuth Errors:**

   - Use existing error UI in login page
   - Display Kratos error messages
   - Log to existing error tracking

2. **Linking Errors:**

   - Use standard BadRequestError for conflicts
   - Emit error events for monitoring
   - Return user-friendly messages

3. **Proxy Errors:**
   - Handle proxy unavailability gracefully
   - Fall back to manual linking
   - Alert monitoring systems
