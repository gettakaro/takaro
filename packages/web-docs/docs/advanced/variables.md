---
sidebar_position: 1
---

# Variables

What if you want to keep track of some data in different executions? For example, you want to keep track of how many times a player has joined the server. You can use Variables for this.

Variables are key-value pairs stored in the database. Each variable can be linked to a specific GameServer, Player, and/or Module. This flexibility allows you to store data relevant to a specific player, server, or module.

Variable keys must be unique per combination of GameServer, Player, and Module. This means you can have a variable with the key `playerJoinedCount` for each unique combination of a player, a game server, and a module, but you cannot have two variables with the same key for the same combination.

## Usage

### Creating a variable

Creating a variable is as simple as calling the `variableControllerCreate` function.

```js
await takaro.variable.variableControllerCreate({
  key: 'my_teleport',
  value: JSON.stringify({
    x: data.player.positionX,
    y: data.player.positionY,
    z: data.player.positionZ,
  }),
  gameServerId: data.gameServerId,
  moduleId: mod.moduleId,
  playerId: player.playerId,
});
```

Notice that we define `gameServerId`, `moduleId` AND `playerId` here. This is because we want to store the position of the player, so we need to store it for the specific player, on the specific server, and for the specific module. Doing it this way allows another player to also create a teleport called `'my_teleport'` without overwriting the first player's teleport.

Note that in these examples, we often use `moduleId: mod.moduleId`. This limits the results to only Variables in the
current Module. This is good practice, as it will prevent key collisions with other Modules.

### Retrieving a variable

Retrieving a variable uses the `variableControllerSearch` function. This function allows you to search for variables based on a set of filters. In this case, we want to retrieve the teleport we created earlier.

```js
const ownedTeleports = await takaro.variable.variableControllerSearch({
  filters: {
    key: ['my_teleport'],
    gameServerId: [gameServerId],
    playerId: [player.playerId],
    moduleId: [mod.moduleId],
  },
});
```

Notice we are using the same IDs as we used when creating the variable. Let's say we omitted the playerId in this example, this search could return the `'my_teleport'` variable for playerX AND playerY.

Let's say that we are interested in retrieving all teleports for a specific player. We can do this by omitting the `key` filter.

```js
const ownedTeleports = await takaro.variable.variableControllerSearch({
  filters: {
    gameServerId: [gameServerId],
    playerId: [player.playerId],
    moduleId: [mod.moduleId],
  },
});
```

Or if we want to get a list of all teleports on a specific server

```js
const ownedTeleports = await takaro.variable.variableControllerSearch({
  filters: {
    gameServerId: [gameServerId],
  },
});
```

There are many more filters and combinations available, check out the [API reference](/advanced/api) for more information.

### Updating a variable

Updating a variable is done with the `variableControllerUpdate`.

Notice that updating a variable uses the ID of the database record, not the key.

```js
await takaro.variable.variableControllerUpdate(variableId, {
  value: new Date().toISOString(),
});
```

### Deleting a variable

Deleting a variable is done with the `variableControllerDelete`.

```js
await takaro.variable.variableControllerDelete(variableId);
```
