---
sidebar_position: 1
---

# Modules

You can create your own features in Takaro using Modules. 

Each modules consists of one or more of the following components:

- Hooks
- Cronjobs
- Commands

Each of these has a [Function](./functions.md) attached to it. The Function is the actual code that is executed when the Hook, Cronjob or Command is triggered. The main difference between Hooks, Cronjobs and Commands is how they are triggered.

## Hooks

Hooks are triggered when a certain event happens on a Gameserver. Think of it as a callback function that is executed when a certain event happens. For example, when a player joins a server, a Hook can be triggered that will send a message to the player.

You can optionally add a string filter to hooks, allowing you more control over when it fires exactly. For advanced users, [regex](https://en.wikipedia.org/wiki/Regular_expression) filtering is also supported.

## Cronjobs

Cronjobs are triggered based on time. This can be a simple repeating pattern like "Every 5 minutes" or "Every day" or you can use raw [Cron](https://en.wikipedia.org/wiki/Cron) syntax to define more complex patterns like "Every Monday, Wednesday and Friday at 2 PM";

## Commands

Commands are triggered by a user. They are triggered when a player sends a chat message starting with the configured command prefix. Note that this means that commands are a *manual* action, unlike Hooks and Cronjobs which are triggered with any user-intervention.

Commands support parameters, allowing you to pass data to the Function. For example, you can create a command that allows players to teleport to a specific location. The command could look like `/teleport homeBase`