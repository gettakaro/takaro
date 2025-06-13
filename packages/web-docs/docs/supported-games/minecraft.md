# Minecraft

Takaro supports Minecraft servers through our generic connector and the Takaro Minecraft mod. This integration enables real-time player event streaming, server log forwarding, player management capabilities, and remote server control.

## Installation

To connect your Minecraft server to Takaro, you'll need to install the Takaro Minecraft plugin on your existing Minecraft server.

### Requirements

- Minecraft 1.21.5 server running Spigot
- Administrative access to your server files

### Plugin Installation

1. Download the latest Takaro Minecraft plugin from the [GitHub releases page](https://github.com/gettakaro/takaro-minecraft/releases)
2. Place the plugin JAR file in your server's `plugins` directory
3. Restart your Minecraft server
4. The plugin will create a configuration file at `plugins/TakaroMinecraft/config.yml`

## Configuration

After installation, you'll need to configure the plugin with your Takaro authentication tokens.

Edit the configuration file at `plugins/TakaroMinecraft/config.yml`:

```yaml
takaro:
  authentication:
    identity_token: 'your-server-name'
    registration_token: 'your-takaro-registration-token'
```

### Getting Your Tokens

1. **Identity Token**: Use a unique identifier for your Minecraft server
2. **Registration Token**: Obtain this from your Takaro dashboard when adding a new server

After updating the configuration, restart your Minecraft server for the changes to take effect.

## Features and Status

For the most up-to-date information about supported features, API methods, and development status, visit the [Takaro Minecraft GitHub repository](https://github.com/gettakaro/takaro-minecraft).
