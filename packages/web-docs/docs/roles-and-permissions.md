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

Keep Discord and Takaro roles in sync. Update roles in one place, they update everywhere.

### Prerequisites

- Discord bot connected to Takaro
- Users linked their Discord accounts
- Roles mapped between platforms

### How It Works

Changes apply instantly when roles are modified, with a scheduled backup that catches any missed updates. Only the roles you've mapped between platforms will synchronize.

### Set Up Role Sync

**1. Link Discord accounts**

Users connect at `/link`. They'll see "Connect Discord Account" when logged in.

**2. Map your roles**

1. Go to **Roles**
2. Edit a role
3. Pick a Discord role from "Linked Discord Role"
4. Save

**3. Configure sync**

1. Go to **Settings → Game Servers**
2. Enable "Discord Role Sync Enabled"
3. Pick your source of truth

### Source of Truth

Choose which platform controls roles:

Takaro controls (default):
- Takaro overrides Discord
- Best for game-driven permissions

Discord controls:
- Discord overrides Takaro
- Best for Discord-driven communities

### Important Notes

The first sync uses your source of truth setting to determine which platform wins. Unmapped roles never synchronize, and system roles (Root, User, Player) can't be synced. The bot needs role management permissions to work. If you have multiple Discord servers, remember that mappings are server-specific.
