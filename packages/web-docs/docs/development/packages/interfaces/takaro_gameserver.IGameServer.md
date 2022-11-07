---
id: "takaro_gameserver.IGameServer"
title: "Interface: IGameServer"
sidebar_label: "@takaro/gameserver.IGameServer"
custom_edit_url: null
---

[@takaro/gameserver](../modules/takaro_gameserver.md).IGameServer

## Implemented by

- [`Mock`](../classes/takaro_gameserver.Mock.md)
- [`Rust`](../classes/takaro_gameserver.Rust.md)
- [`SevenDaysToDie`](../classes/takaro_gameserver.SevenDaysToDie.md)

## Properties

### connectionInfo

• **connectionInfo**: `unknown`

#### Defined in

[packages/lib-gameserver/src/interfaces/GameServer.ts:16](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GameServer.ts#L16)

## Methods

### getEventEmitter

▸ **getEventEmitter**(): [`TakaroEmitter`](../classes/takaro_gameserver.TakaroEmitter.md)

#### Returns

[`TakaroEmitter`](../classes/takaro_gameserver.TakaroEmitter.md)

#### Defined in

[packages/lib-gameserver/src/interfaces/GameServer.ts:20](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GameServer.ts#L20)

___

### getPlayer

▸ **getPlayer**(`id`): `Promise`<``null`` \| [`IGamePlayer`](../classes/takaro_gameserver.IGamePlayer.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<``null`` \| [`IGamePlayer`](../classes/takaro_gameserver.IGamePlayer.md)\>

#### Defined in

[packages/lib-gameserver/src/interfaces/GameServer.ts:18](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GameServer.ts#L18)

___

### getPlayers

▸ **getPlayers**(): `Promise`<[`IGamePlayer`](../classes/takaro_gameserver.IGamePlayer.md)[]\>

#### Returns

`Promise`<[`IGamePlayer`](../classes/takaro_gameserver.IGamePlayer.md)[]\>

#### Defined in

[packages/lib-gameserver/src/interfaces/GameServer.ts:19](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GameServer.ts#L19)

___

### testReachability

▸ **testReachability**(): `Promise`<[`TestReachabilityOutput`](../classes/takaro_gameserver.TestReachabilityOutput.md)\>

Try and connect to the gameserver
If anything goes wrong, this function will report a detailed reason

#### Returns

`Promise`<[`TestReachabilityOutput`](../classes/takaro_gameserver.TestReachabilityOutput.md)\>

#### Defined in

[packages/lib-gameserver/src/interfaces/GameServer.ts:26](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GameServer.ts#L26)
