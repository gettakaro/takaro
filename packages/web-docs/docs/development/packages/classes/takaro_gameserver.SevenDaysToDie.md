---
id: "takaro_gameserver.SevenDaysToDie"
title: "Class: SevenDaysToDie"
sidebar_label: "@takaro/gameserver.SevenDaysToDie"
custom_edit_url: null
---

[@takaro/gameserver](../modules/takaro_gameserver.md).SevenDaysToDie

## Implements

- [`IGameServer`](../interfaces/takaro_gameserver.IGameServer.md)

## Constructors

### constructor

• **new SevenDaysToDie**(`config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Record`<`string`, `unknown`\> |

#### Defined in

[packages/lib-gameserver/src/gameservers/7d2d/index.ts:27](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/7d2d/index.ts#L27)

## Properties

### apiClient

• `Private` **apiClient**: `SdtdApiClient`

#### Defined in

[packages/lib-gameserver/src/gameservers/7d2d/index.ts:24](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/7d2d/index.ts#L24)

___

### connectionInfo

• **connectionInfo**: `SdtdConnectionInfo`

#### Implementation of

[IGameServer](../interfaces/takaro_gameserver.IGameServer.md).[connectionInfo](../interfaces/takaro_gameserver.IGameServer.md#connectioninfo)

#### Defined in

[packages/lib-gameserver/src/gameservers/7d2d/index.ts:25](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/7d2d/index.ts#L25)

___

### logger

• `Private` **logger**: `Logger`

#### Defined in

[packages/lib-gameserver/src/gameservers/7d2d/index.ts:23](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/7d2d/index.ts#L23)

## Methods

### getEventEmitter

▸ **getEventEmitter**(): `SevenDaysToDieEmitter`

#### Returns

`SevenDaysToDieEmitter`

#### Implementation of

[IGameServer](../interfaces/takaro_gameserver.IGameServer.md).[getEventEmitter](../interfaces/takaro_gameserver.IGameServer.md#geteventemitter)

#### Defined in

[packages/lib-gameserver/src/gameservers/7d2d/index.ts:41](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/7d2d/index.ts#L41)

___

### getPlayer

▸ **getPlayer**(`id`): `Promise`<``null`` \| [`IGamePlayer`](takaro_gameserver.IGamePlayer.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<``null`` \| [`IGamePlayer`](takaro_gameserver.IGamePlayer.md)\>

#### Implementation of

[IGameServer](../interfaces/takaro_gameserver.IGameServer.md).[getPlayer](../interfaces/takaro_gameserver.IGameServer.md#getplayer)

#### Defined in

[packages/lib-gameserver/src/gameservers/7d2d/index.ts:32](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/7d2d/index.ts#L32)

___

### getPlayers

▸ **getPlayers**(): `Promise`<[`IGamePlayer`](takaro_gameserver.IGamePlayer.md)[]\>

#### Returns

`Promise`<[`IGamePlayer`](takaro_gameserver.IGamePlayer.md)[]\>

#### Implementation of

[IGameServer](../interfaces/takaro_gameserver.IGameServer.md).[getPlayers](../interfaces/takaro_gameserver.IGameServer.md#getplayers)

#### Defined in

[packages/lib-gameserver/src/gameservers/7d2d/index.ts:37](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/7d2d/index.ts#L37)

___

### testReachability

▸ **testReachability**(): `Promise`<[`TestReachabilityOutput`](takaro_gameserver.TestReachabilityOutput.md)\>

Try and connect to the gameserver
If anything goes wrong, this function will report a detailed reason

#### Returns

`Promise`<[`TestReachabilityOutput`](takaro_gameserver.TestReachabilityOutput.md)\>

#### Implementation of

[IGameServer](../interfaces/takaro_gameserver.IGameServer.md).[testReachability](../interfaces/takaro_gameserver.IGameServer.md#testreachability)

#### Defined in

[packages/lib-gameserver/src/gameservers/7d2d/index.ts:46](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/7d2d/index.ts#L46)
