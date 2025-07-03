---
sidebar_position: 5
---

# Economy

Takaro allows users to enable an economy system on their server. This is a virtual currency system that allows users to earn and spend money on the server. This is a great way to encourage users to be active on the server and reward them for their activity.

Players can earn money in many ways using some of the [built-in modules](./modules/overview.mdx) or you can create your own custom modules to allow players to earn money in other ways.

Currency is kept per gameserver, so if you have multiple gameservers, each gameserver will have its own currency. This makes it easier to balance the economy on each gameserver; you might want different prices on your PvP server than on your PvE server for example.

Do note that we have in global settings, an option to enable Economy. You can override the global settings in each gameserver setting.

## Shop

Takaro offers a built-in shop system to complement the server's economy. This feature allows community managers to create shop listings where they can sell individual items or bundles at specified prices. Each game server can have its own unique shop.

To allow players to use the shop, they need to be linked to both Takaro and your game community. The player linking process is described in the [players](./players.md) section.

### Prerequisites

1. **Enable the economy** for your game server.
2. Ensure **players are linked** to both Takaro and your game community (see [players](./players.md) for details).
3. Install the built-in module, [EconomyUtils](./modules/overview.mdx), on your game server.

### Shop Functionalities

- **Create Shop Listing**: Allows you to list items for sale, either individually or as packages. You can set the item quality and upload custom images for your listings.
- **Orders**: Provides an overview of the orders placed by players and their status.

### Claiming an Item

An item can be claimed in two ways:

- In Takaro, by going to "Orders" and clicking "Claim Item". You need to be in-game for this to work; otherwise, you'll receive an error message.
- In-game, by typing the command `/link`.

### In-Game Store

The shop can be accessed in-game using the command `/shop`. The structure works as follows:

- `/shop 1`: Shows the first page of items.
- `/shop 1 1`: Displays the details of the first item.
- `/shop 1 1 buy`: Purchases the item.
