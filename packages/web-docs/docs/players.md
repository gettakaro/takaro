---
sidebar_position: 3
---

# Players

Takaro regularly syncs player data from your servers into the Takaro database. Online players get synced in a time interval of a couple of seconds. If some event happens, that data can be synced immediately.

## Global Player Profile

- Uniform Across All Servers: The global 'Player' profile remains consistent across all game servers. This profile represents the player's universal identity in Takaro.
- Tracks General Information: It includes global data such as the player's name, SteamID, and other platform-wide details.

## Server-Specific Player Profile (PlayerOnGameServer)

- Unique to Each Server: A 'PlayerOnGameServer' profile is created for each game server a player joins. This means a player will have separate profiles for each server they are part of.
Example Scenario: If a player plays on both your PvE and PvP servers, they will have two distinct 'PlayerOnGameServer' profiles, one for each server, but only one global 'Player' profile.

- Stores Server-Specific Data: This profile keeps track of server-specific information such as inventory, position, and other in-game details.
