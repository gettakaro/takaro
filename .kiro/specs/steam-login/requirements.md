# Steam Login Integration Requirements

## Introduction

This feature will add Steam authentication to Takaro, allowing users to log in using their Steam accounts. The implementation will use the Steam-auth-proxy project as a middleware to translate Steam's legacy OpenID 2.0 authentication into modern OpenID Connect (OIDC) that is compatible with Ory Kratos.

Steam is a critical authentication provider for gaming communities, and adding Steam login will:
- Enable seamless authentication for gamers who primarily use Steam
- Allow server admins to link their Steam accounts for game server management
- Provide an additional authentication option alongside the existing Discord login

## User Stories

### US-001: Steam Login for New Users
**As a** gamer with a Steam account  
**I want** to log in to Takaro using my Steam credentials  
**So that** I can access Takaro services without creating a separate password-based account

### US-002: Steam Account Linking
**As an** existing Takaro user  
**I want** to link my Steam account to my Takaro profile  
**So that** I can use Steam login as an alternative authentication method

### US-003: Steam Account Management
**As a** user with a linked Steam account  
**I want** to view and unlink my Steam account from my profile settings  
**So that** I can manage my authentication methods

### US-004: Steam Login Button
**As a** user on the login page  
**I want** to see a clearly labeled "Log in with Steam" button  
**So that** I can easily identify and use the Steam authentication option

### US-005: Automatic Player Linking - Web Login
**As a** player who exists in-game with a Steam ID  
**I want** my player profile to be automatically linked when I log in with Steam on the web  
**So that** I don't need to use the /link command manually

### US-006: Automatic Player Linking - Game Join
**As a** user who has already linked Steam to my Takaro account  
**I want** my player profile to be automatically linked when I join a new game server  
**So that** I don't need to use the /link command on each new server

### US-007: Cross-Domain Player Linking
**As a** player who exists across multiple game server domains  
**I want** automatic linking to work across all domains where I play  
**So that** I have seamless access to all my game data without manual intervention

## Acceptance Criteria

### Authentication Flow
- **AC-001**: The system SHALL provide a "Log in with Steam" button on the login page
- **AC-002**: WHEN a user clicks the Steam login button, the system SHALL redirect them to Steam's authentication page
- **AC-003**: After successful Steam authentication, the system SHALL redirect the user back to Takaro
- **AC-004**: IF the user is already registered, THEN the system SHALL log them in automatically
- **AC-005**: IF registration is disabled and the user is not registered, THEN the system SHALL display an appropriate error message
- **AC-006**: The system SHALL handle OAuth callback errors gracefully and display user-friendly error messages

### Account Linking
- **AC-007**: The system SHALL allow authenticated users to link their Steam account from their profile settings
- **AC-008**: WHEN a user links their Steam account, the system SHALL store the Steam ID association
- **AC-009**: The system SHALL NOT allow linking a Steam account that is already linked to another user
- **AC-010**: The system SHALL display the user's Steam username when their account is linked

### Account Unlinking
- **AC-011**: The system SHALL allow users to unlink their Steam account from profile settings
- **AC-012**: WHEN unlinking, the system SHALL require user confirmation
- **AC-013**: IF Steam is the user's only authentication method, THEN the system SHALL NOT allow unlinking

### Security Requirements
- **AC-014**: The system SHALL keep the Steam API key secure and never expose it to the client
- **AC-015**: The system SHALL validate all redirect URIs to prevent open redirect vulnerabilities
- **AC-016**: The system SHALL use HTTPS for all authentication flows in production

### Integration Requirements
- **AC-017**: The Steam auth proxy SHALL be deployed as a separate containerized service
- **AC-018**: The proxy SHALL expose standard OIDC endpoints compatible with Kratos
- **AC-019**: The system SHALL configure Kratos to recognize Steam as a generic OIDC provider
- **AC-020**: The system SHALL map Steam user data appropriately to Takaro user profiles

### User Experience
- **AC-021**: The Steam login button SHALL use Steam's official branding and icon
- **AC-022**: Loading states SHALL be displayed during the authentication process
- **AC-023**: Error messages SHALL be specific and actionable
- **AC-024**: The system SHALL maintain the user's intended destination after successful login

### Compatibility
- **AC-025**: The Steam login feature SHALL work alongside existing Discord and password authentication
- **AC-026**: The system SHALL handle users who have both Discord and Steam accounts linked
- **AC-027**: The feature SHALL be compatible with the existing session management system

### Automatic Player Linking - Web to Game Direction
- **AC-028**: WHEN a user logs in with Steam on the web, the system SHALL search for existing players with matching Steam ID
- **AC-029**: IF matching players are found, THEN the system SHALL automatically link them to the user account
- **AC-030**: The system SHALL link players across ALL domains where the Steam ID exists
- **AC-031**: The automatic linking SHALL emit PLAYER_LINKED events for each domain where linking occurs

### Automatic Player Linking - Game to Web Direction  
- **AC-032**: WHEN a player with a Steam ID joins a game server, the system SHALL search for existing users with matching Steam ID
- **AC-033**: IF a matching user is found, THEN the system SHALL automatically link the player to that user account
- **AC-034**: This automatic linking SHALL occur during the player sync/upsert process
- **AC-035**: The system SHALL emit a PLAYER_LINKED event when automatic linking occurs from game join

### Automatic Linking Constraints
- **AC-036**: IF a player with the Steam ID is already linked to a different user, THEN the system SHALL NOT perform automatic linking
- **AC-037**: IF a user already has a different player linked for that domain, THEN the system SHALL NOT override the existing link
- **AC-038**: The system SHALL log all automatic linking attempts for auditing purposes

### Domain Selection
- **AC-039**: WHEN setting domain cookies after web login, the system SHALL prioritize the domain with the most recent player activity
- **AC-040**: The system SHALL track last seen timestamps for players to enable proper domain prioritization