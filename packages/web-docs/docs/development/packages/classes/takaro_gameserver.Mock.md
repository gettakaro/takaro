---
id: "takaro_gameserver.Mock"
title: "Class: Mock"
sidebar_label: "@takaro/gameserver.Mock"
custom_edit_url: null
---

[@takaro/gameserver](../modules/takaro_gameserver.md).Mock

## Implements

- [`IGameServer`](../interfaces/takaro_gameserver.IGameServer.md)

## Constructors

### constructor

• **new Mock**(`config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Record`<`string`, `unknown`\> |

#### Defined in

[packages/lib-gameserver/src/gameservers/mock/index.ts:33](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/mock/index.ts#L33)

## Properties

### connectionInfo

• **connectionInfo**: `MockConnectionInfo`

#### Implementation of

[IGameServer](../interfaces/takaro_gameserver.IGameServer.md).[connectionInfo](../interfaces/takaro_gameserver.IGameServer.md#connectioninfo)

#### Defined in

[packages/lib-gameserver/src/gameservers/mock/index.ts:31](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/mock/index.ts#L31)

___

### logger

• `Private` **logger**: `Logger`

#### Defined in

[packages/lib-gameserver/src/gameservers/mock/index.ts:30](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/mock/index.ts#L30)

## Methods

### getEventEmitter

▸ **getEventEmitter**(): `MockEmitter`

#### Returns

`MockEmitter`

#### Implementation of

[IGameServer](../interfaces/takaro_gameserver.IGameServer.md).[getEventEmitter](../interfaces/takaro_gameserver.IGameServer.md#geteventemitter)

#### Defined in

[packages/lib-gameserver/src/gameservers/mock/index.ts:46](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/mock/index.ts#L46)

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

[packages/lib-gameserver/src/gameservers/mock/index.ts:37](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/mock/index.ts#L37)

___

### getPlayers

▸ **getPlayers**(): `Promise`<[`IGamePlayer`](takaro_gameserver.IGamePlayer.md)[]\>

#### Returns

`Promise`<[`IGamePlayer`](takaro_gameserver.IGamePlayer.md)[]\>

#### Implementation of

[IGameServer](../interfaces/takaro_gameserver.IGameServer.md).[getPlayers](../interfaces/takaro_gameserver.IGameServer.md#getplayers)

#### Defined in

[packages/lib-gameserver/src/gameservers/mock/index.ts:42](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/mock/index.ts#L42)

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

[packages/lib-gameserver/src/gameservers/mock/index.ts:51](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/mock/index.ts#L51)
