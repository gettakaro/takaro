---
id: "takaro_gameserver.EventChatMessage"
title: "Class: EventChatMessage"
sidebar_label: "@takaro/gameserver.EventChatMessage"
custom_edit_url: null
---

[@takaro/gameserver](../modules/takaro_gameserver.md).EventChatMessage

## Hierarchy

- [`BaseEvent`](takaro_gameserver.BaseEvent.md)<[`EventChatMessage`](takaro_gameserver.EventChatMessage.md)\>

  ↳ **`EventChatMessage`**

## Constructors

### constructor

• **new EventChatMessage**(`data`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Partial`<[`EventChatMessage`](takaro_gameserver.EventChatMessage.md)\> |

#### Inherited from

[BaseEvent](takaro_gameserver.BaseEvent.md).[constructor](takaro_gameserver.BaseEvent.md#constructor)

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:30](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L30)

## Properties

### msg

• **msg**: `string`

#### Overrides

[BaseEvent](takaro_gameserver.BaseEvent.md).[msg](takaro_gameserver.BaseEvent.md#msg)

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:59](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L59)

___

### player

• `Optional` **player**: [`IGamePlayer`](takaro_gameserver.IGamePlayer.md)

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:57](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L57)

___

### timestamp

• **timestamp**: `string`

#### Inherited from

[BaseEvent](takaro_gameserver.BaseEvent.md).[timestamp](takaro_gameserver.BaseEvent.md#timestamp)

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:22](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L22)

___

### type

• **type**: [`GameEvents`](../enums/takaro_gameserver.GameEvents.md) = `GameEvents.CHAT_MESSAGE`

#### Overrides

[BaseEvent](takaro_gameserver.BaseEvent.md).[type](takaro_gameserver.BaseEvent.md#type)

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:54](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L54)

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
