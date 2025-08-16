# Implementation Tasks for Steam Login Integration

## Overview

The Steam login integration will be implemented in 5 phases:
1. Infrastructure setup (Steam auth proxy deployment)
2. Backend Kratos configuration and identity extraction
3. Frontend OAuth integration and UI components
4. Automatic player linking implementation
5. Testing and polish

Each phase builds on the previous, allowing for incremental deployment and testing.

## Phase 1: Infrastructure Setup

Deploy and configure the Steam auth proxy service that translates Steam's legacy OpenID 2.0 to modern OIDC.

- [x] Task 1.1: Add Steam auth proxy to docker-compose
  - **Prompt**: Add the Steam auth proxy service to docker-compose.yml with proper health checks, environment variables for STEAM_API_KEY, client ID/secret, and base URL. Include restart policy and expose port 19000.
  - **Requirements**: AC-017, AC-018
  - **Design ref**: Implementation Details - Steam Auth Proxy Deployment
  - **Files**: docker-compose.yml

- [x] Task 1.2: Add Steam environment variables to .env.example
  - **Prompt**: Add STEAM_API_KEY, STEAM_CLIENT_ID, STEAM_CLIENT_SECRET, and STEAM_AUTH_PROXY_URL environment variables to .env.example with clear descriptions and example values.
  - **Requirements**: AC-014
  - **Design ref**: Implementation Details - Environment Configuration
  - **Files**: .env.example

## Phase 2: Backend Kratos Configuration

Configure Ory Kratos to recognize Steam as an OIDC provider and extract Steam IDs correctly.

- [x] Task 2.1: Create Steam OIDC mapper for Kratos
  - **Prompt**: Create containers/kratos/config/steam.jsonnet following the Discord mapper pattern. Return empty traits to prevent overwriting user data during account linking. Add appropriate comments explaining the mapper's purpose.
  - **Requirements**: AC-019, AC-020
  - **Design ref**: Extension vs. Creation Analysis - Kratos OIDC Configuration
  - **Files**: containers/kratos/config/steam.jsonnet

- [x] Task 2.2: Add Steam provider to Kratos configuration
  - **Prompt**: Update containers/kratos/config/kratos.yml to add Steam as a generic OIDC provider. Use environment variables for client ID/secret, set the mapper_url to the steam.jsonnet file, configure auth/token URLs to point to the proxy, and include openid scope.
  - **Requirements**: AC-019
  - **Design ref**: Components and Interfaces - Kratos Configuration
  - **Files**: containers/kratos/config/kratos.yml

- [x] Task 2.3: Update Ory identity extraction for Steam ID
  - **Prompt**: In packages/lib-auth/src/lib/ory.ts, update the getIdentity function to extract Steam ID from OIDC credentials (not traits). Follow the Discord ID extraction pattern: find identifier starting with 'steam:', remove prefix, and add to returned identity object.
  - **Requirements**: AC-020
  - **Design ref**: Feature Integration - Critical Fix for Steam ID extraction
  - **Files**: packages/lib-auth/src/lib/ory.ts

- [x] Task 2.4: Update User service to handle Steam ID
  - **Prompt**: In packages/app-api/src/service/User/index.ts, update the me() method to include Steam ID from Ory identity. Follow the Discord ID pattern: use oryIdentity.steamId || user.steamId to maintain backward compatibility.
  - **Requirements**: AC-020
  - **Design ref**: Components and Interfaces - User Service Updates
  - **Files**: packages/app-api/src/service/User/index.ts

## Phase 3: Frontend OAuth Integration

Add Steam login button and OAuth flow handling to the frontend.

- [x] Task 3.1: Extend OAuth provider types
  - **Prompt**: In packages/web-main/src/util/oryOAuth.ts, add 'steam' to the OAuthProvider type union. No other changes needed as existing functions handle all OAuth flows.
  - **Requirements**: AC-001
  - **Design ref**: Extension vs. Creation Analysis - OAuth Utilities
  - **Files**: packages/web-main/src/util/oryOAuth.ts

- [x] Task 3.2: Add Steam icon import
  - **Prompt**: Find or create a Steam icon component. If using react-icons, import FaSteam. Otherwise, create a simple Steam SVG icon component following the project's icon patterns.
  - **Requirements**: AC-021
  - **Design ref**: User Experience requirements
  - **Files**: TBD based on icon source

- [x] Task 3.3: Add Steam login button to login page
  - **Prompt**: In packages/web-main/src/routes/login.tsx, add a Steam login button below the Discord button. Create handleSteamLogin function that calls initiateOryOAuth with provider 'steam'. Use Steam icon, proper loading state, and follow Discord button's styling pattern exactly.
  - **Requirements**: AC-001, AC-021, AC-022
  - **Design ref**: Components and Interfaces - Login Page
  - **Files**: packages/web-main/src/routes/login.tsx

- [x] Task 3.4: Create Steam settings card component
  - **Prompt**: Create packages/web-main/src/routes/_auth/_global/settings/-steam/LoginSteamCard.tsx following the Discord card pattern exactly. Show Steam connection status, handle link/unlink actions, display Steam username when linked. Include proper TypeScript types and loading states.
  - **Requirements**: AC-007, AC-010, AC-011, AC-012
  - **Design ref**: New Components - LoginSteamCard
  - **Files**: packages/web-main/src/routes/_auth/_global/settings/-steam/LoginSteamCard.tsx

- [x] Task 3.5: Add Steam card to profile settings
  - **Prompt**: In the profile/settings page, import and add the LoginSteamCard component below the Discord card. Pass the session prop and ensure consistent spacing with other cards.
  - **Requirements**: AC-007
  - **Design ref**: Frontend Integration patterns
  - **Files**: packages/web-main/src/routes/_auth/_global/settings/index.tsx (or similar)

## Phase 4: Automatic Player Linking

Implement bidirectional automatic linking between Steam users and game players.

- [x] Task 4.1: Create SteamAutoLinkingService
  - **Prompt**: Create packages/app-api/src/service/SteamAutoLinkingService.ts with linkOnWebLogin and linkOnGameJoin methods. Use Promise.allSettled for cross-domain linking, validate constraints (no existing conflicting links), emit PLAYER_LINKED events, and include comprehensive logging. Add simple inline Steam ID validation (17 digit regex).
  - **Requirements**: AC-028, AC-029, AC-030, AC-031, AC-032, AC-033, AC-035, AC-036, AC-037, AC-038
  - **Design ref**: New Components - SteamAutoLinkingService, Transaction Safety section
  - **Files**: packages/app-api/src/service/SteamAutoLinkingService.ts

- [x] Task 4.2: Add cross-domain player search by Steam ID
  - **Prompt**: In packages/app-api/src/db/player.ts, add findBySteamIdAcrossDomains method that searches for players with matching Steam ID across all domains. Return player records with their domain IDs. Consider adding an index on steamId for performance.
  - **Requirements**: AC-028, AC-030
  - **Design ref**: Data access patterns
  - **Files**: packages/app-api/src/db/player.ts

- [x] Task 4.3: Integrate auto-linking into player resolution
  - **Prompt**: In packages/app-api/src/service/Player/index.ts, update resolveRef method to trigger auto-linking after player creation/update. If gamePlayer has steamId and player has no userId, call SteamAutoLinkingService.linkOnGameJoin. Wrap in try-catch to not fail player resolution on linking errors.
  - **Requirements**: AC-032, AC-033, AC-034
  - **Design ref**: Implementation Details - Auto-Linking Implementation
  - **Files**: packages/app-api/src/service/Player/index.ts

- [x] Task 4.4: Add web login auto-linking hook
  - **Prompt**: Create a post-authentication hook that triggers after successful Steam login. When a user logs in with Steam ID, call SteamAutoLinkingService.linkOnWebLogin to find and link all matching players across domains. Consider where this best fits - possibly in the User service or as middleware.
  - **Requirements**: AC-028, AC-029, AC-030, AC-031
  - **Design ref**: Integration Points for Automatic Steam Linking
  - **Files**: TBD based on architecture decision

- [x] Task 4.5: Add domain cookie logic for Steam login
  - **Prompt**: After Steam login with auto-linking, set the domain cookie to the most recently active domain. Query player last seen timestamps, select the most recent, and set the takaro-domain cookie following existing patterns.
  - **Requirements**: AC-039, AC-040
  - **Design ref**: Domain Selection requirements
  - **Files**: TBD based on where auto-linking hook is placed

## Phase 5: Testing and Polish

Add comprehensive tests and handle edge cases.

- [ ] Task 5.1: Add Steam OAuth integration tests
  - **Prompt**: Create integration tests for Steam OAuth flow including successful login, registration disabled scenario, auth proxy errors, and auto-linking trigger. Follow existing OAuth test patterns in the codebase.
  - **Requirements**: AC-004, AC-005, AC-006
  - **Design ref**: Testing Strategy - Authentication Flow Test Cases
  - **Files**: packages/app-api/src/controllers/__tests__/Auth.integration.test.ts (or similar)

- [ ] Task 5.2: Add SteamAutoLinkingService unit tests
  - **Prompt**: Create comprehensive unit tests for SteamAutoLinkingService covering successful linking, constraint validation, partial failure handling, and event emission. Mock dependencies and test both linkOnWebLogin and linkOnGameJoin methods.
  - **Requirements**: All auto-linking ACs
  - **Design ref**: Testing Strategy - Automatic Player Linking Test Cases
  - **Files**: packages/app-api/src/service/__tests__/SteamAutoLinkingService.unit.test.ts

- [ ] Task 5.3: Add frontend component tests
  - **Prompt**: Create tests for LoginSteamCard component including rendering states, link/unlink actions, error handling, and loading states. Follow the Discord card test patterns.
  - **Requirements**: AC-007, AC-010, AC-011, AC-012
  - **Design ref**: Testing Strategy - Account Linking Test Cases
  - **Files**: packages/web-main/src/routes/_auth/_global/settings/-steam/__tests__/LoginSteamCard.test.tsx

- [ ] Task 5.4: Add E2E test for Steam login flow
  - **Prompt**: Create an E2E test that clicks Steam login button, handles the OAuth redirect (mock if needed), verifies successful login, and checks that the Steam account appears in settings. Follow existing E2E patterns.
  - **Requirements**: AC-001, AC-002, AC-003, AC-024
  - **Design ref**: Testing Strategy - End-to-End tests
  - **Files**: packages/e2e/src/web-main/steamAuth.spec.ts

- [ ] Task 5.5: Handle Steam auth unavailability gracefully
  - **Prompt**: Add error boundary and fallback UI for when Steam auth proxy is unavailable. Show appropriate message on login page, disable Steam button with tooltip explanation, and handle errors in settings page. Log errors for monitoring.
  - **Requirements**: AC-006, AC-023
  - **Design ref**: Error Handling - Proxy Errors
  - **Files**: Multiple frontend files where Steam auth is used