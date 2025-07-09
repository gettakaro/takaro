# Writing Takaro Modules

## Introduction

Welcome to the Takaro module development guide! Whether you're looking to create simple commands or complex automated systems, this guide will walk you through everything you need to know. We'll start with the basics and gradually move to more advanced topics.

## What are Modules?

At their core, Takaro modules are collections of features that add functionality to your game server. A module might be as simple as a single command that welcomes players, or as complex as a complete economy system with multiple commands, scheduled tasks, and persistent data storage.

Every module can contain:

- Commands: Features that players can trigger with chat messages
- Hooks: Code that runs in response to events
- Cronjobs: Tasks that run on a schedule
- Functions: Reusable code that can be shared between different parts of your module
- Permissions: Rules about who can use your module's features
- Configuration: Settings that server owners can adjust

## Your First Module: Hello World

Let's start with something simple - a module that greets players when they type a command. Through this basic example, we'll learn the fundamental concepts of module development.

Here's what the command implementation looks like:

```javascript
import { takaro, data } from '@takaro/helpers';

async function main() {
  const { player } = data;
  await player.pm('Hello, world!');
}

await main();
```

When a player types the command (let's say `/hello`), this code sends them a private message saying "Hello, world!". Simple, right? Let's break down what's happening:

1. `import { takaro, data }` - This gives us access to Takaro's helper functions and the data about who ran the command
2. `const { player }` - This extracts the player information from the data
3. `player.pm()` - This sends a private message to the player

## Working with Commands

Now that we have our feet wet, let's look at some practical command features. Commands are the primary way players will interact with your module, so it's important to make them user-friendly and robust.

### Executing Game Commands

When you need to execute a game command, use the `gameServerControllerExecuteCommand` function:

```javascript
import { takaro, data } from '@takaro/helpers';

async function main() {
  const { gameServerId, player, pog } = data;

  await takaro.gameserver.gameServerControllerExecuteCommand(gameServerId, {
    command: `teleportplayer EOS_${pog.gameId} 489 57 -241`,
  });

  await player.pm('Teleported to lobby!');
}

await main();
```

This function allows you to execute any game command remotely. The command string should match exactly what you would type in the game console.

### Handling Arguments

Most commands need to accept input from players. Let's modify our greeting to use the player's name:

```javascript
import { takaro, data } from '@takaro/helpers';

async function main() {
  const { player, arguments: args } = data;
  await player.pm(`Hello, ${args.name}!`);
}

await main();
```

### Error Handling

Players don't always use commands correctly. It's important to handle errors gracefully:

```javascript
import { takaro, data, TakaroUserError } from '@takaro/helpers';

async function main() {
  const { player, arguments: args } = data;

  if (!args.name) {
    throw new TakaroUserError('Please provide a name!');
    return;
  }

  await player.pm(`Hello, ${args.name}!`);
}

await main();
```

Using `TakaroUserError` ensures the error message is displayed nicely to the player.

### Command Permissions

You can restrict commands to players with specific permissions by setting the `requiredPermissions` field when defining your command:

```javascript
// In your module definition
{
  name: 'adminTeleport',
  trigger: 'admintp',
  helpText: 'Teleport any player to any location',
  requiredPermissions: ['ADMIN_TELEPORT'],
  arguments: [
    {
      name: 'player',
      type: 'player',
      helpText: 'Player to teleport',
      position: 0
    },
    {
      name: 'location',
      type: 'string',
      helpText: 'Location name',
      position: 1
    }
  ]
}
```

When a player without the required permission tries to use the command:
- They receive an automatic permission denied message
- The command function is never executed
- A `COMMAND_EXECUTION_DENIED` event is logged

This is more secure than checking permissions inside your command function, as it prevents the code from running at all.

## Responding to Events with Hooks

Sometimes you want your module to react to things that happen in the game automatically. That's where hooks come in. Let's look at a hook that welcomes players when they join the server:

```javascript
import { takaro, data } from '@takaro/helpers';

async function main() {
  const { player, gameServerId } = data;

  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `Welcome to the server, ${player.name}!`,
  });
}

await main();
```

## Storing Data with Variables

Most modules need to remember information between player sessions or commands. Takaro provides a variable system for this purpose. Let's create a command that counts how many times a player has used it:

```javascript
import { takaro, data } from '@takaro/helpers';

async function main() {
  const { player, gameServerId, module: mod } = data;

  // Try to find existing count
  const countVar = await takaro.variable.variableControllerSearch({
    filters: {
      key: ['command_count'],
      gameServerId: [gameServerId],
      playerId: [player.id],
      moduleId: [mod.moduleId],
    },
  });

  let count = 1;
  if (countVar.data.data.length > 0) {
    // Existing count found, increment it
    count = parseInt(countVar.data.data[0].value) + 1;
    await takaro.variable.variableControllerUpdate(countVar.data.data[0].id, {
      value: count.toString(),
    });
  } else {
    // No existing count, create new variable
    await takaro.variable.variableControllerCreate({
      key: 'command_count',
      value: '1',
      gameServerId,
      moduleId: mod.moduleId,
      playerId: player.id,
    });
  }

  await player.pm(`You've used this command ${count} times!`);
}

await main();
```
### Variables with an expiration date
Sometimes you want to add an expiration date to a variable. 
```javascript
// Create a variable with expiration
const expiresAt = new Date(Date.now() + data.module.userConfig.expirationTime);
await takaro.variable.variableControllerCreate({
    key: 'variableName',
    value: 'value',
    playerId: player.id,        // Optional: Link to player
    gameServerId: gameServerId, // Optional: Link to server
    moduleId: mod.moduleId,     // Optional: Link to module
    expiresAt: expiresAt
});

// Search for variable
const existingVariable = await takaro.variable.variableControllerSearch({
    filters: {
        key: ['variableName'],
        playerId: [player.id],
        gameServerId: [gameServerId],
        moduleId: [mod.moduleId]
    }
});

// Update variable with new expiration, this will be in milliseconds
const newExpiresAt = new Date(Date.now() + data.module.userConfig.expirationTime);
await takaro.variable.variableControllerUpdate(existingVariable.data.data[0].id, {
    value: 'newValue',
    expiresAt: newExpiresAt
});

// Delete variable
await takaro.variable.variableControllerDelete(existingVariable.data.data[0].id);
```
await main();
## Permissions

As your module grows more complex, you'll want to control who can use certain features. Takaro has a robust permissions system that integrates with the server's role system.

### Checking Permissions

Here's how to check if a player has permission to use a feature:

```javascript
import { takaro, data, checkPermission, TakaroUserError } from '@takaro/helpers';

async function main() {
  const { pog, player } = data;

  if (!checkPermission(pog, 'MY_FEATURE_USE')) {
    throw new TakaroUserError('You do not have permission to use this feature!');
  }

  await player.pm('Access granted!');
}

await main();
```

### Permission with Count

Some permissions can have a count attached. This is useful for features like limiting how many teleport locations a player can set:

```javascript
import { takaro, data, checkPermission, TakaroUserError } from '@takaro/helpers';

async function main() {
  const { pog, player } = data;

  const teleportPermission = checkPermission(pog, 'TELEPORTS_USE');
  if (!teleportPermission) {
    throw new TakaroUserError('You do not have permission to use teleports!');
  }

  // teleportPermission.count contains the maximum number of teleports allowed
  if (currentTeleports >= teleportPermission.count) {
    throw new TakaroUserError(`You can only have ${teleportPermission.count} teleports!`);
  }

  await player.pm('Teleport created!');
}

await main();
```

## Scheduled Tasks with Cronjobs

Cronjobs allow your module to perform tasks on a schedule. Let's look at an example that sends a server-wide message every hour:

```javascript
import { data, takaro } from '@takaro/helpers';

async function main() {
  const { gameServerId } = data;

  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: "Don't forget to check out our shop!",
  });
}

await main();
```

## Sharing Code with Functions

As your module grows, you'll often find yourself repeating similar code in different commands or hooks. Functions let you share this code. Place shared code in your module's functions directory, and it becomes available to all your module's components.

Common uses for functions include:

- Utility functions for data formatting
- Shared business logic

## Working with Configuration

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

## Advanced Patterns and Best Practices

### 1. Parallelizing API Calls

When making multiple calls to Takaro's API, use `Promise.all` or `Promise.allSettled` to run them in parallel:

```javascript
import { takaro, data } from '@takaro/helpers';

async function main() {
  const { gameServerId } = data;

  // Bad: Sequential calls
  const playerA = await takaro.player.playerControllerGetOne(playerAId);
  const playerB = await takaro.player.playerControllerGetOne(playerBId);
  const playerC = await takaro.player.playerControllerGetOne(playerCId);

  // Good: Parallel calls
  const [playerA, playerB, playerC] = await Promise.all([
    takaro.player.playerControllerGetOne(playerAId),
    takaro.player.playerControllerGetOne(playerBId),
    takaro.player.playerControllerGetOne(playerCId),
  ]);

  // When some calls might fail
  const results = await Promise.allSettled([
    takaro.player.playerControllerGetOne(playerAId),
    takaro.player.playerControllerGetOne(playerBId),
    takaro.player.playerControllerGetOne(playerCId),
  ]);

  // Handle results
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      // Handle success
      console.log(result.value);
    } else {
      // Handle failure
      console.error(result.reason);
    }
  });
}

await main();
```

### 2. Consistent Error Handling

Always use `TakaroUserError` when returning errors to users. This ensures errors are displayed properly in the game:

```javascript
import { takaro, data, TakaroUserError } from '@takaro/helpers';

async function main() {
  const { player } = data;

  if (!checkPermission(data.pog, 'REQUIRED_PERMISSION')) {
    throw new TakaroUserError('You do not have permission to use this command');
  }

  await data.player.pm('Action completed successfully!');
}

await main();
```
## Recurring Code snippets
### Checking for online players
Query online players and exit if none found - prevents running unnecessary code on empty servers
```javascript
    // Get online players through PlayerOnGameServer search
    const currentPlayers = (await takaro.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
            gameServerId: [gameServerId],
            online: [true]
        }
    })).data.meta;

    // If no players online, exit early
    if (currentPlayers.total === 0) {
        return;
    }
```

## Conclusion

Throughout this guide, you've seen various uses of the Takaro API via the `takaro` helper - from sending messages to managing variables. All these functions come from our comprehensive API, which offers many more features than we could cover here. You can explore the full API and try it out in our [interactive playground](https://api.takaro.io/api.html).

Want to see how to put all these concepts together? Check out our built-in modules! They're real-world examples of how to build robust modules and are a great source of patterns and best practices. You can find them in your Takaro dashboard or our [Github repository](https://github.com/gettakaro/takaro/tree/development/packages/lib-modules/src/modules).

Ready to build your first module? Join our Discord community if you have questions or want to share what you're working on!
