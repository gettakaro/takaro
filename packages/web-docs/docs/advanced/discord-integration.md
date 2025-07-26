---
sidebar_position: 8
---

# Discord Integration

Connect your game servers to Discord for real-time communication. Sync roles, bridge chat, and send notifications.

## Prerequisites

You'll need:
- Admin access to your Discord server
- Admin permissions in Takaro
- A Discord account

## Connect Discord Bot

### 1. Add Bot to Discord

1. Go to **Settings → Discord**
2. Click **"Connect Discord"**
3. Select your Discord server
4. Grant the requested permissions
5. The bot joins your server automatically

### 2. Bot Permissions

The Takaro bot needs several Discord permissions to work properly. It must read messages to see commands, send messages to respond, and manage roles for synchronization. The bot also needs to read message history for processing commands, embed links for rich formatting, and manage webhooks if you're using chat bridge features.

## Features

### Chat Bridge

Connect game chat to Discord channels for two-way communication. In-game messages appear in your Discord channels, and Discord messages get sent to your game. You can filter which messages to bridge and customize how they look on each platform.

[Learn more about Chat Bridge →](../modules/chatBridge.mdx)

### Role Synchronization

Keep Discord and Takaro roles in sync. When you update roles in one place, they update everywhere.

#### Before You Start

1. Users must link their Discord accounts
2. You must map Discord roles to Takaro roles
3. Bot needs "Manage Roles" permission

#### Set Up Role Sync

**Step 1: Enable Discord linking**

Players link accounts at `/link`. Logged-in users see "Connect Discord Account".

**Step 2: Map your roles**

1. Go to **Roles**
2. Edit a role
3. Select a Discord role from "Linked Discord Role"
4. Save

**Step 3: Configure sync**

1. Go to **Settings → Game Servers**
2. Enable "Discord Role Sync Enabled"
3. Choose your source of truth:
   - OFF: Takaro controls roles
   - ON: Discord controls roles

#### How It Works

Role changes sync instantly between platforms, with a scheduled backup that runs periodically to catch anything missed. Only roles you've explicitly mapped will synchronize. When conflicts arise, your source of truth setting determines which platform wins.

#### Source of Truth

Takaro controls (OFF):
- Takaro changes override Discord
- Good for game-driven permissions

Discord controls (ON):
- Discord changes override Takaro
- Good for Discord-driven communities

### Discord Commands

Create commands that interact with your game servers. Use modern slash commands or traditional prefix commands, set role requirements for who can use them, and send rich embedded responses with game information.

### Event Notifications

Send game events to Discord channels. Get notified when players join, leave, or earn achievements. See server restarts, updates, and errors as they happen. Track economy events like purchases and transfers. Create custom notifications from your own modules.

## Troubleshooting

### Bot Won't Respond

1. Check bot's online in Discord
2. Verify bot permissions
3. Ensure bot sees the channel
4. Check Takaro logs

### Role Sync Issues

Common user issues include not linking Discord accounts, missing from the Discord server, or having an invalid Discord ID in Takaro.

For permission problems, check if the bot has "Manage Roles" permission and sits high enough in the role hierarchy. The Discord audit log can reveal permission errors.

Setup issues often involve role sync being disabled, roles not being mapped, or the wrong source of truth selected.

### Chat Bridge Problems

If messages aren't appearing, verify your channel IDs are correct, the bot has proper permissions, and the chat bridge module is installed.

For formatting problems, review your configuration settings, check for special characters causing issues, and verify webhook settings if you're using them.

## Best Practices

Place the Takaro bot role high in Discord's hierarchy so it can manage other roles. Use dedicated channels for different game servers to keep things organized. Review permissions regularly and test new configurations with a test account first. Keep an eye on logs to catch errors early.

## Security

Request only the OAuth scopes you actually need. Be cautious when mapping powerful roles between platforms. Limit bot access to necessary channels only. Enable audit logs in both Discord and Takaro for security tracking.

## Advanced Setup

### Multiple Discord Servers

Connect different game servers to different Discords:
- Each server gets its own connection
- Role mappings are server-specific
- Chat bridges route independently

### Custom Module Integration

Your custom modules can send formatted embeds, create interactive buttons, handle Discord events, and access user Discord data when needed.

See the [Custom Modules guide](./custom-modules.md) for details.