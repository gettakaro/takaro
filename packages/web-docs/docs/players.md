---
sidebar_position: 3
---

# Players

Takaro regularly syncs player data from your servers into the Takaro database. Online players get synced within intervals of a few seconds. If an event occurs, that data can be synced immediately.

## Global Player Profile

- Uniform Across All Servers: The global 'Player' profile remains consistent across all game servers. This profile represents the player's universal identity in Takaro.
- Tracks General Information: It includes global data such as the player's name, platform identifiers, and other platform-wide details.

## Platform Identification

Takaro supports multiple ways to identify players across different gaming platforms. Each player can have one or more of the following platform identifiers:

### Supported Platform Identifiers

- **Steam ID**: For players using Steam platform (e.g., `76561198123456789`)
- **Xbox Live ID**: For players using Xbox Live platform
- **Epic Online Services ID**: For players using Epic Games Store platform
- **Platform ID**: Generic identifier for other platforms using the format `platform:id`

### Platform ID Format

The Platform ID is a flexible system that supports games and platforms beyond Steam, Xbox, and Epic. It uses a standardized format:

**Format**: `platform:identifier`

**Examples**:
- `minecraft:550e8400-e29b-41d4-a716-446655440000` - Minecraft player UUID
- `battlenet:PlayerName#1234` - Battle.net player tag
- `origin:OriginPlayerID` - Origin/EA platform
- `discord:123456789012345678` - Discord user ID (see Discord Integration below)
- `custom-game:unique-player-id` - Custom game platform

### How Platform Identification Works

1. **Priority System**: Takaro will use the most specific platform identifier available
2. **Fallback Support**: If a game-specific ID (Steam, Xbox, Epic) isn't available, Platform ID provides a generic alternative
3. **Multiple Identifiers**: A single player can have multiple platform identifiers if they play across different platforms
4. **Cross-Platform Play**: Platform ID enables support for games that don't use traditional gaming platforms

You can view all of a player's platform identifiers in their profile page under the "General" information section.

## Server-Specific Player Profile (PlayerOnGameServer)

- Unique to Each Server: A 'PlayerOnGameServer' profile is created for each game server a player joins. This means a player will have separate profiles for each server they are part of.
Example Scenario: If a player plays on both your PvE and PvP servers, they will have two distinct 'PlayerOnGameServer' profiles, one for each server, but only one global 'Player' profile.

- Stores Server-Specific Data: This profile keeps track of server-specific information such as inventory, position, and other in-game details.

## Player Linking

Players can link to your community and receive login credentials to access it through Takaro. This feature allows players to visit the shop via the web browser.

### How to Link

1. In-game, type the command `/link`.
2. After entering the command, you'll receive a weblink.
4. Click the link to be redirected to Takaro, where you can create your user account.
5. Once linked, you'll have access to Takaro and the associated game community.

If you wish to link to another game community, simply repeat the `/link` process. Within Takaro, you can easily switch between game communities by using the domain widgets in the bottom left.
To know more about how to use the shop, please visit [Economy page](./economy.md).

## Discord Integration

Link your Discord account for role sync and community features.

### Link Your Discord Account

1. Link your player profile with `/link` first
2. Visit `/link` while logged in
3. Click "Connect Discord Account"
4. Authorize Takaro access
5. You're linked!

### Why Link Discord?

Linking Discord lets your roles sync between platforms, so Discord roles automatically apply in-game. You'll get notifications through Discord, access Discord-exclusive commands, and can sign in using your Discord account.

### How Role Sync Works

When admins enable role sync:
- Discord roles automatically apply in-game
- Game roles can update your Discord roles
- Only mapped roles sync
- System roles never sync

See the [Discord Integration guide](./advanced/discord-integration.md) for more.
