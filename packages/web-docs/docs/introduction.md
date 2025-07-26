---
sidebar_position: 1
hide_table_of_contents: true
slug: /
---

# Introduction

Takaro is a platform that unites gamers with their communities across different games. It features a web interface to manage your game servers, and a REST API to interact with them.

<iframe className="aspect-video w-full" src="https://www.youtube.com/embed/mbdXSR_p-i8" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" width="100%" height="500px" allowFullScreen />

## Modules

Takaro is centered around modules. You can choose from built-in modules or create custom ones to meet your community's unique needs. Modules come with customizable permissions that can be assigned to roles. You can install them globally or per game server, as well as across games.

### Built-in Modules

Takaro comes with several [built-in Modules](./modules/overview.mdx) that can be installed on each server of each game. Each module is configurable, allowing you to tailor it to your specific requirements. Here are a few examples of built-in modules:

- **AFK-Kick Module**: This module automatically monitors player activity and removes players from the server if they have been inactive for a specified period. The duration of inactivity is configurable, enabling community managers to set different thresholds based on server preferences. This is useful for keeping the server active and freeing up space for other players.
- **Teleport Module**: The teleport module enables players to create teleportation points within the game and travel between them using specific in-game commands. You can configure the module to limit the number of teleport points a player can create or set cooldowns to prevent players from escaping certain situations unfairly. This helps manage player movement and maintain balance within the game.

### Custom Modules

Takaro allows you to build your own [Custom Modules](./advanced/modules.md) through the [Module Builder](./advanced/custom-modules.md). Creating custom modules requires some coding knowledge, but it offers great flexibility to extend and enhance the platform’s functionality.

## Game Support

Takaro currently supports popular games like _Rust_ and _7 Days to Die_, with _Minecraft_ support coming soon. Our platform is designed to support more games in the future.

## Unified Player Profile

Takaro unifies your [players](./players.md) across games and servers into one profile, tracking their roles, inventory, history, and activities.

## Permissions and roles

You can control access to modules by assigning [roles and permissions](./roles-and-permissions.md) to your [players](./players.md) and users.

## Discord

Takaro seamlessly integrates with Discord, linking communication between your game servers and communities. Key features include:

- **Chat Bridge**: Two-way communication between game chat and Discord channels
- **Role Synchronization**: Automatically sync roles between Discord and Takaro for consistent permissions
- **Event Notifications**: Get real-time updates about game events in Discord
- **Bot Commands**: Control your game servers directly from Discord

Learn more about [Discord Integration →](./advanced/discord-integration.md)

## Economy and Shop

You can enable [economy](./economy.md) for each game server. This allows you to monetize your community through an in-game shop, where players can make purchases directly linked to their profiles.

## How to get started?

Takaro is built to support communities of all sizes with powerful, scalable tools for managing game servers, players, and monetization. Dive into the [How-To Guides](./how-to-guides/connect-7dtd-server.md) for step-by-step instructions on setting up and customizing your platform.

## Feature requests

Have ideas for new features? Submit or vote on existing feature requests at [roadmap.takaro.io](https://roadmap.takaro.io/).
