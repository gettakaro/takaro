---
sidebar_position: 4
---

# Roles and permissions

In Takaro, roles are flexible and customizable according to the needs of the users. To start with, Takaro provides a set of default roles like 'Admin' and 'Moderator' These roles serve as a foundation upon which users can build and customize their roles.

The roles consist of multiple Permissions. Permissions in Takaro can be built-in, like "Manage modules" or "Read players", or dynamic Module permissions. Module permissions allow for a high degree of customization. They can be created based on installed/configured Modules. For example, a Module permission could be created to allow only moderators to set public teleports, or to allow only VIP users to be rewarded for zombie kills.

Roles can be assigned to Users and/or Players. User roles define what actions users can take on the API/dashboard of Takaro. Player roles control what actions can be taken in-game.

Players can be assigned Roles in two ways:
1. **Globally (Across All Game Servers)**: These roles are applicable across all game servers in Takaro. For example, if a player has a global role that allows them to `USE_TELEPORTS`, they can utilize this feature on every game server.
   
2. **Game-Server Specific**: These roles are only applicable to a particular game server. For instance, a player might have a role on Game Server A that grants them the `SET_TELEPORTS` permission, but this doesn't grant them the same permission on Game Server B.

**Additive Nature of Roles**: It's important to note that player roles are cumulative. This means global roles and game-server specific roles combine to determine a player's total permissions. For clarity, consider the following scenario:

- A player has a global role allowing `USE_TELEPORTS`.
- The same player also has a game-server specific role on Game Server A allowing `SET_TELEPORTS`.

In this case, the player can use teleports on all servers due to their global role, but they can only set teleports on Game Server A because of their game-server specific role.

### Timed roles

When assigning a role to a user or to a player, you can optionally specify an expiration date. This allows you to create timed roles that will automatically expire after a certain amount of time. This is useful for things like temporary bans or temporary VIP access.

### System roles

There are 3 system roles that are automatically created when Takaro is installed and have special meaning

#### Root

The root role is the most powerful role in Takaro. It has **all permissions** and cannot be deleted or modified. It is intended to be used for the initial setup of Takaro and should not be assigned to any users or players.

#### User and Player

The "User" and "Player" roles are automatically assigned to all users and players respectively. These roles cannot be deleted but permissions in the roles can be modified. These roles are intended to be used as a base for all users and players. "User" is used for any API-based checks while "Player" is used inside modules.

## Command Permissions

Module commands can require specific permissions to execute. This provides fine-grained control over who can use administrative or powerful commands.

### How it works

1. **Permission Check**: Before executing a command, Takaro checks if the player has all required permissions
2. **Access Denied**: Players without required permissions receive a message like: "You need the 'Permission Name' permission to use this command"
3. **Event Logging**: Failed attempts trigger a `COMMAND_EXECUTION_DENIED` event for monitoring
4. **ROOT Bypass**: Players with the ROOT permission can execute any command regardless of requirements

### Example

The `economyUtils` module uses command permissions:
- `/balance` - No permission required (anyone can check their balance)
- `/grantcurrency` - Requires `ECONOMY_UTILS_MANAGE_CURRENCY` permission
- `/revokecurrency` - Requires `ECONOMY_UTILS_MANAGE_CURRENCY` permission

This ensures only authorized staff can modify player currencies while allowing all players to view their balance.

## Discord Role Synchronization

Takaro supports bidirectional role synchronization between Discord and Takaro, allowing you to manage permissions across both platforms seamlessly.

### Prerequisites

- Discord bot must be connected to your Takaro instance
- Users must link their Discord account through the player linking page
- Discord roles must be mapped to Takaro roles

### How It Works

Discord role sync ensures that role assignments remain consistent between Discord and Takaro:

1. **Real-time Synchronization**: When roles change in either platform, they automatically sync to the other
2. **Scheduled Sync**: A background task runs periodically to ensure consistency and catch any missed events
3. **Selective Sync**: Only roles explicitly linked between platforms are synchronized

### Setting Up Role Synchronization

1. **Link Your Discord Account**: 
   - Navigate to the player link page (`/link`)
   - Click "Connect Discord Account" if you're logged in
   - Authorize Takaro to access your Discord account

2. **Map Discord Roles to Takaro Roles**:
   - Go to Roles management in the dashboard
   - Create or edit a role
   - Select a Discord role from the "Linked Discord Role" dropdown
   - Save the role mapping

3. **Configure Synchronization Settings**:
   - Navigate to Settings → Game Servers
   - Enable "Discord Role Sync Enabled"
   - Choose your source of truth (see below)

### Source of Truth Configuration

The source of truth determines which platform takes precedence when role conflicts occur:

- **Takaro as Source of Truth** (default): 
  - Takaro role assignments override Discord roles
  - Changes in Takaro are pushed to Discord
  - Discord role changes for mapped roles are ignored

- **Discord as Source of Truth**:
  - Discord role assignments override Takaro roles
  - Changes in Discord are synced to Takaro
  - Takaro role changes for mapped roles are ignored

### Important Considerations

- **Initial Sync**: When first enabling sync, roles will be synchronized based on your source of truth setting
- **Unmapped Roles**: Roles without a Discord mapping are never synchronized
- **System Roles**: The system roles (Root, User, Player) cannot be synchronized
- **Permissions**: Users need appropriate Discord permissions for the bot to manage their roles
- **Multiple Servers**: If you have multiple Discord servers connected, role mappings are server-specific
