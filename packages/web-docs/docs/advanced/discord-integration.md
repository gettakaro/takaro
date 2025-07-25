---
sidebar_position: 8
---

# Discord Integration

Takaro provides deep integration with Discord, enabling seamless communication between your game servers and Discord community. This guide covers all aspects of Discord integration, from basic setup to advanced features like role synchronization.

## Prerequisites

Before setting up Discord integration, ensure you have:
- Admin access to your Discord server
- Administrative permissions in Takaro
- A Discord account

## Setting Up Discord Bot

### 1. Connect Discord to Takaro

1. Navigate to **Settings → Discord** in your Takaro dashboard
2. Click **"Connect Discord"**
3. Select the Discord server you want to connect
4. Grant the necessary permissions when prompted
5. The bot will automatically join your Discord server

### 2. Bot Permissions

The Takaro bot requires the following Discord permissions:
- **Read Messages**: To monitor commands and messages
- **Send Messages**: To send notifications and responses
- **Manage Roles**: For role synchronization features
- **Read Message History**: To process commands properly
- **Embed Links**: To send rich embeds
- **Manage Webhooks**: For advanced chat bridge features

## Features

### Chat Bridge

The chat bridge creates a two-way communication channel between your game servers and Discord:

- **Game → Discord**: In-game chat appears in designated Discord channels
- **Discord → Game**: Messages from Discord channels are sent to game chat
- **Filtering**: Configure which types of messages are bridged
- **Formatting**: Customize how messages appear on each platform

[Learn more about Chat Bridge configuration →](../modules/chatBridge.mdx)

### Role Synchronization

Discord role sync ensures consistent permissions across Discord and Takaro platforms.

#### Prerequisites for Role Sync

1. **Discord OAuth Setup**: Users must link their Discord accounts
2. **Role Mapping**: Discord roles must be mapped to Takaro roles
3. **Bot Permissions**: The bot needs "Manage Roles" permission

#### Configuring Role Sync

1. **Enable Discord OAuth**:
   - Players can link their Discord accounts at `/link`
   - Logged-in users will see a "Connect Discord Account" option

2. **Map Roles**:
   - Go to **Roles** in the dashboard
   - Create or edit a role
   - Select a Discord role from the "Linked Discord Role" dropdown
   - Save the mapping

3. **Configure Sync Settings**:
   - Navigate to **Settings → Game Servers**
   - Toggle "Discord Role Sync Enabled" to enable the feature
   - Set "Discord Role Sync Source Of Truth":
     - **OFF (default)**: Takaro is the source of truth
     - **ON**: Discord is the source of truth

#### How Role Sync Works

- **Real-time Updates**: Role changes sync immediately via Discord events
- **Scheduled Sync**: A backup sync runs periodically (configurable)
- **Selective Sync**: Only explicitly mapped roles are synchronized
- **Conflict Resolution**: Source of truth setting determines precedence

#### Source of Truth Explained

**Takaro as Source of Truth** (Source of Truth = OFF):
- Takaro role assignments take precedence
- Adding/removing roles in Takaro updates Discord
- Discord role changes for mapped roles are ignored
- Best for: Communities where game permissions drive Discord roles

**Discord as Source of Truth** (Source of Truth = ON):
- Discord role assignments take precedence
- Adding/removing roles in Discord updates Takaro
- Takaro role changes for mapped roles are ignored
- Best for: Communities where Discord hierarchy drives game permissions

### Discord Commands

Configure custom Discord commands that interact with your game servers:

- **Slash Commands**: Modern Discord slash commands for better UX
- **Prefix Commands**: Traditional prefix-based commands
- **Permissions**: Commands can require specific Discord roles
- **Responses**: Rich embeds with game server information

### Event Notifications

Send game events to Discord channels:

- **Player Events**: Joins, leaves, deaths, achievements
- **Server Events**: Restarts, updates, errors
- **Economic Events**: Shop purchases, currency transfers
- **Custom Events**: From your custom modules

## Troubleshooting

### Bot Not Responding

1. Check bot is online in Discord
2. Verify bot has necessary permissions
3. Ensure bot can see the channel
4. Check Takaro logs for errors

### Role Sync Not Working

1. **User Issues**:
   - Ensure user has linked their Discord account
   - Check user has valid Discord ID in Takaro
   - Verify user is in the Discord server

2. **Permission Issues**:
   - Bot must have "Manage Roles" permission
   - Bot's role must be higher than roles it manages
   - Check Discord audit log for permission errors

3. **Configuration Issues**:
   - Verify role sync is enabled in settings
   - Check roles are properly mapped
   - Ensure source of truth is configured correctly

### Chat Bridge Issues

1. **Messages Not Appearing**:
   - Verify channel IDs are correct
   - Check bot can read/write in channels
   - Ensure chat bridge module is installed

2. **Formatting Problems**:
   - Review chat bridge configuration
   - Check for special characters causing issues
   - Verify webhook settings if using webhooks

## Best Practices

1. **Role Hierarchy**: Place the Takaro bot role high in Discord's role hierarchy
2. **Dedicated Channels**: Use separate channels for different game servers
3. **Permission Auditing**: Regularly review role mappings and permissions
4. **Testing**: Test role sync with a test account before enabling globally
5. **Monitoring**: Watch logs during initial setup to catch issues early

## Security Considerations

- **OAuth Scopes**: Only request necessary Discord OAuth scopes
- **Role Permissions**: Be cautious with powerful role mappings
- **Channel Access**: Limit bot access to necessary channels only
- **Audit Logging**: Enable audit logs in both Discord and Takaro

## Advanced Configuration

### Multiple Discord Servers

Takaro supports connecting multiple Discord servers:
- Each game server can connect to a different Discord
- Role mappings are Discord-server specific
- Chat bridges can route to different servers

### Custom Module Integration

Integrate Discord features in custom modules:
- Send custom embeds
- Create interactive buttons
- Handle Discord events
- Access user Discord data

See the [Custom Modules guide](./custom-modules.md) for implementation details.