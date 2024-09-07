---
sidebar_position: 1
hide_table_of_contents: true
slug: /
---

# Introduction

Takaro is a web-based, multi-gameserver manager. It features a web interface to manage your gameservers, and a REST API to interact with them.

## Concrete

Takaro offers a versatile collection of [modules](./advanced/modules.md), simplifying your gameserver management tasks while also extending game functionality.
Each module can be enabled/disabled per game server you manage. Each module has its own configuration which you can further fine tune to your own needs.

Here are some examples of modules that are available:

- **AFK-kick module**:
  incorporates a time-bound tracking system to monitor player activity and act accordingly;
  When enabling the module, the module configuration allows you to set a specific duration of inactivity after which a player should be removed from the game.

- **Teleport module**:
  offers set of in-game commands enabling players to create their own teleport points and teleport to them. Again, the module configuration can be adjusted to e.g. limit the number of teleport points per player or set a waiting period before teleporting, to prevent escaping from certain situations.

The above modules represent only a tiny fraction of the [modules maintained by the Takaro team](./built-in-modules).
If however the current modules provided by Takaro don't cater to your specific needs, don't worry. Takaro also provides a development environment to create your [own custom modules](./advanced/custom-modules.md).
