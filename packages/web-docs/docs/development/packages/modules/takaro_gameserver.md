---
id: "takaro_gameserver"
title: "Module: @takaro/gameserver"
sidebar_label: "@takaro/gameserver"
sidebar_position: 0
custom_edit_url: null
---

## Enumerations

- [GameEvents](../enums/takaro_gameserver.GameEvents.md)

## Classes

- [BaseEvent](../classes/takaro_gameserver.BaseEvent.md)
- [EventChatMessage](../classes/takaro_gameserver.EventChatMessage.md)
- [EventLogLine](../classes/takaro_gameserver.EventLogLine.md)
- [EventPlayerConnected](../classes/takaro_gameserver.EventPlayerConnected.md)
- [EventPlayerDisconnected](../classes/takaro_gameserver.EventPlayerDisconnected.md)
- [IGamePlayer](../classes/takaro_gameserver.IGamePlayer.md)
- [Mock](../classes/takaro_gameserver.Mock.md)
- [Rust](../classes/takaro_gameserver.Rust.md)
- [SevenDaysToDie](../classes/takaro_gameserver.SevenDaysToDie.md)
- [TakaroEmitter](../classes/takaro_gameserver.TakaroEmitter.md)
- [TestReachabilityOutput](../classes/takaro_gameserver.TestReachabilityOutput.md)

## Interfaces

- [IGameServer](../interfaces/takaro_gameserver.IGameServer.md)

## Type Aliases

### EventMapping

Ƭ **EventMapping**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `chat-message` | [`EventChatMessage`](../classes/takaro_gameserver.EventChatMessage.md) |
| `log` | [`EventLogLine`](../classes/takaro_gameserver.EventLogLine.md) |
| `player-connected` | [`EventPlayerConnected`](../classes/takaro_gameserver.EventPlayerConnected.md) |
| `player-disconnected` | [`EventPlayerDisconnected`](../classes/takaro_gameserver.EventPlayerDisconnected.md) |

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:13](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L13)
