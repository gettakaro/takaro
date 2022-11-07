---
id: "takaro_gameserver.EventPlayerDisconnected"
title: "Class: EventPlayerDisconnected"
sidebar_label: "@takaro/gameserver.EventPlayerDisconnected"
custom_edit_url: null
---

[@takaro/gameserver](../modules/takaro_gameserver.md).EventPlayerDisconnected

## Hierarchy

- [`BaseEvent`](takaro_gameserver.BaseEvent.md)<[`EventPlayerDisconnected`](takaro_gameserver.EventPlayerDisconnected.md)\>

  ↳ **`EventPlayerDisconnected`**

## Constructors

### constructor

• **new EventPlayerDisconnected**(`data`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Partial`<[`EventPlayerDisconnected`](takaro_gameserver.EventPlayerDisconnected.md)\> |

#### Inherited from

[BaseEvent](takaro_gameserver.BaseEvent.md).[constructor](takaro_gameserver.BaseEvent.md#constructor)

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:30](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L30)

## Properties

### msg

• **msg**: `string`

#### Inherited from

[BaseEvent](takaro_gameserver.BaseEvent.md).[msg](takaro_gameserver.BaseEvent.md#msg)

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:28](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L28)

___

### player

• **player**: [`IGamePlayer`](takaro_gameserver.IGamePlayer.md)

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:50](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L50)

___

### timestamp

• **timestamp**: `string`

#### Inherited from

[BaseEvent](takaro_gameserver.BaseEvent.md).[timestamp](takaro_gameserver.BaseEvent.md#timestamp)

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:22](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L22)

___

### type

• **type**: [`GameEvents`](../enums/takaro_gameserver.GameEvents.md) = `GameEvents.PLAYER_DISCONNECTED`

#### Overrides

[BaseEvent](takaro_gameserver.BaseEvent.md).[type](takaro_gameserver.BaseEvent.md#type)

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:47](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L47)

## Methods

### toJSON

▸ **toJSON**(): `Record`<`string`, `any`\>

#### Returns

`Record`<`string`, `any`\>

#### Inherited from

[BaseEvent](takaro_gameserver.BaseEvent.md).[toJSON](takaro_gameserver.BaseEvent.md#tojson)

#### Defined in

node_modules/@takaro/util/dist/dto/TakaroDTO.d.ts:8

___

### validate

▸ **validate**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Inherited from

[BaseEvent](takaro_gameserver.BaseEvent.md).[validate](takaro_gameserver.BaseEvent.md#validate)

#### Defined in

node_modules/@takaro/util/dist/dto/TakaroDTO.d.ts:7
