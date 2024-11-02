---
sidebar_position: 1
---

# Modules

The core of Takaro is built around Modules. Modules are a very powerful and flexible way of creating features..

Takaro comes with a set of [built-in modules](../modules/overview.mdx). When you enable these on a Gameserver, you will be able to change the configuration of the module to customize it but you cannot edit the code. This allows Takaro to automatically keep the built-in modules up-to-date.

Each module consists of one or more of the following components:

- Hooks
- Cronjobs
- Commands

## Hooks

Hooks are triggered when a certain event happens on a Gameserver. Think of it as a callback function that is executed when a certain event happens. For example, when a player joins a server, a Hook can be triggered that will send a message to the player.

You can optionally add a string filter to hooks, allowing you more control over when it fires exactly. For advanced users, [regex](https://en.wikipedia.org/wiki/Regular_expression) filtering is also supported.

## Cronjobs

Cronjobs are triggered based on time. This can be a simple repeating pattern like "Every 5 minutes" or "Every day" or you can use raw [Cron](https://en.wikipedia.org/wiki/Cron) syntax to define more complex patterns like "Every Monday, Wednesday and Friday at 2 PM";

## Commands

Commands are triggered by a user. They are triggered when a player sends a chat message starting with the configured command prefix. Note that this means that commands are a _manual_ action, unlike Hooks and Cronjobs which are triggered with any user-intervention.

### Arguments

Commands support arguments, allowing you to pass data to the Function. For example, you can create a command that allows players to teleport to a specific location. The command could look like `/teleport homeBase`.

Arguments can have different types, such as `string`, `number`, `boolean` and `player`. Each of these types gets validated before the command is executed. If the validation fails, the user will get an error message. So if you set an argument to be a `number`, but the user passes a string like `test`, the command will not be executed, and the user will get an error message.

The `player` type is a special type that allows you to pass a player as an argument. This is useful for commands that require a player to be passed, such as `/kick John Doe`. The `player` type can be a partial name, so `/kick John` would also work. It also supports case insensitivity, so `/kick john` would also work. You can also pass IDs to be most precise. If multiple players match the name, the user will get an error message.

## Configuration

Takaro modules have two types of configuration:

### User Configuration

User configuration (`userConfig`) is what you define for your module. These are settings that server owners can adjust through the Takaro dashboard. Examples might include:

- Welcome messages
- Maximum allowed items
- Feature toggles
- Custom thresholds

Access user configuration like this:

```javascript
import { takaro, data } from '@takaro/helpers';

async function main() {
  const { module: mod } = data;

  // Access your custom config values
  const welcomeMessage = mod.userConfig.welcomeMessage;
  const maxItems = mod.userConfig.maxItems;
  const isFeatureEnabled = mod.userConfig.enableAdvancedFeatures;
}

await main();
```

### System Configuration

System configuration (`systemConfig`) is automatically managed by Takaro and includes settings that apply to all module components. You don't need to handle these in your code - Takaro takes care of applying them automatically. Examples include:

- Command costs
- Command cooldowns
- Hook filters
- Channel IDs for Discord integrations

The key difference is that you control userConfig through your module's configuration schema, while systemConfig is managed by Takaro itself.
