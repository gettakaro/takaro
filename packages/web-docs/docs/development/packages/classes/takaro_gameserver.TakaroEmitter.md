---
id: "takaro_gameserver.TakaroEmitter"
title: "Class: TakaroEmitter"
sidebar_label: "@takaro/gameserver.TakaroEmitter"
custom_edit_url: null
---

[@takaro/gameserver](../modules/takaro_gameserver.md).TakaroEmitter

## Constructors

### constructor

• **new TakaroEmitter**()

#### Defined in

[packages/lib-gameserver/src/TakaroEmitter.ts:36](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/TakaroEmitter.ts#L36)

## Properties

### listenerMap

• `Private` **listenerMap**: `Map`<keyof `IEventMap`, ((`log`: [`EventLogLine`](takaro_gameserver.EventLogLine.md)) => `Promise`<`void`\> \| (`player`: [`EventPlayerConnected`](takaro_gameserver.EventPlayerConnected.md)) => `Promise`<`void`\> \| (`player`: [`EventPlayerDisconnected`](takaro_gameserver.EventPlayerDisconnected.md)) => `Promise`<`void`\> \| (`chatMessage`: [`EventChatMessage`](takaro_gameserver.EventChatMessage.md)) => `Promise`<`void`\> \| (`error`: `TakaroError` \| `Error`) => `void` \| `Promise`<`void`\>)[]\>

#### Defined in

[packages/lib-gameserver/src/TakaroEmitter.ts:30](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/TakaroEmitter.ts#L30)

## Methods

### emit

▸ **emit**<`E`\>(`event`, `data`): `Promise`<`void`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends keyof `IEventMap` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `E` |
| `data` | `Parameters`<`IEventMap`[`E`]\>[``0``] |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/lib-gameserver/src/TakaroEmitter.ts:40](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/TakaroEmitter.ts#L40)

___

### hasErrorListener

▸ **hasErrorListener**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/lib-gameserver/src/TakaroEmitter.ts:86](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/TakaroEmitter.ts#L86)

___

### off

▸ **off**<`E`\>(`event`, `listener`): [`TakaroEmitter`](takaro_gameserver.TakaroEmitter.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends keyof `IEventMap` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `E` |
| `listener` | `IEventMap`[`E`] |

#### Returns

[`TakaroEmitter`](takaro_gameserver.TakaroEmitter.md)

#### Defined in

[packages/lib-gameserver/src/TakaroEmitter.ts:73](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/TakaroEmitter.ts#L73)

___

### on

▸ **on**<`E`\>(`event`, `listener`): [`TakaroEmitter`](takaro_gameserver.TakaroEmitter.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends keyof `IEventMap` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `E` |
| `listener` | `IEventMap`[`E`] |

#### Returns

[`TakaroEmitter`](takaro_gameserver.TakaroEmitter.md)

#### Defined in

[packages/lib-gameserver/src/TakaroEmitter.ts:68](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/TakaroEmitter.ts#L68)

___

### start

▸ `Abstract` **start**(`config`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Record`<`string`, `unknown`\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/lib-gameserver/src/TakaroEmitter.ts:34](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/TakaroEmitter.ts#L34)

___

### stop

▸ `Abstract` **stop**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/lib-gameserver/src/TakaroEmitter.ts:33](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/TakaroEmitter.ts#L33)
