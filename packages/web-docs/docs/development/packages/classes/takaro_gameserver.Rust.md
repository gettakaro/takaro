---
id: "takaro_gameserver.Rust"
title: "Class: Rust"
sidebar_label: "@takaro/gameserver.Rust"
custom_edit_url: null
---

[@takaro/gameserver](../modules/takaro_gameserver.md).Rust

## Implements

- [`IGameServer`](../interfaces/takaro_gameserver.IGameServer.md)

## Constructors

### constructor

• **new Rust**(`config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Record`<`string`, `unknown`\> |

#### Defined in

[packages/lib-gameserver/src/gameservers/rust/index.ts:23](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/rust/index.ts#L23)

## Properties

### connectionInfo

• **connectionInfo**: `RustConnectionInfo`

#### Implementation of

[IGameServer](../interfaces/takaro_gameserver.IGameServer.md).[connectionInfo](../interfaces/takaro_gameserver.IGameServer.md#connectioninfo)

#### Defined in

[packages/lib-gameserver/src/gameservers/rust/index.ts:21](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/rust/index.ts#L21)

___

### logger

• `Private` **logger**: `Logger`

#### Defined in

[packages/lib-gameserver/src/gameservers/rust/index.ts:20](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/rust/index.ts#L20)

## Methods

### getEventEmitter

▸ **getEventEmitter**(): `RustEmitter`

#### Returns

`RustEmitter`

#### Implementation of

[IGameServer](../interfaces/takaro_gameserver.IGameServer.md).[getEventEmitter](../interfaces/takaro_gameserver.IGameServer.md#geteventemitter)

#### Defined in

[packages/lib-gameserver/src/gameservers/rust/index.ts:36](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/rust/index.ts#L36)

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

[packages/lib-gameserver/src/gameservers/rust/index.ts:27](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/rust/index.ts#L27)

___

### getPlayers

▸ **getPlayers**(): `Promise`<[`IGamePlayer`](takaro_gameserver.IGamePlayer.md)[]\>

#### Returns

`Promise`<[`IGamePlayer`](takaro_gameserver.IGamePlayer.md)[]\>

#### Implementation of

[IGameServer](../interfaces/takaro_gameserver.IGameServer.md).[getPlayers](../interfaces/takaro_gameserver.IGameServer.md#getplayers)

#### Defined in

[packages/lib-gameserver/src/gameservers/rust/index.ts:32](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/rust/index.ts#L32)

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

[packages/lib-gameserver/src/gameservers/rust/index.ts:41](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/gameservers/rust/index.ts#L41)
