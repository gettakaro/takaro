---
id: "takaro_gameserver.BaseEvent"
title: "Class: BaseEvent<T>"
sidebar_label: "@takaro/gameserver.BaseEvent"
custom_edit_url: null
---

[@takaro/gameserver](../modules/takaro_gameserver.md).BaseEvent

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- `TakaroDTO`<[`BaseEvent`](takaro_gameserver.BaseEvent.md)<`T`\>\>

  ↳ **`BaseEvent`**

  ↳↳ [`EventLogLine`](takaro_gameserver.EventLogLine.md)

  ↳↳ [`EventPlayerConnected`](takaro_gameserver.EventPlayerConnected.md)

  ↳↳ [`EventPlayerDisconnected`](takaro_gameserver.EventPlayerDisconnected.md)

  ↳↳ [`EventChatMessage`](takaro_gameserver.EventChatMessage.md)

## Constructors

### constructor

• **new BaseEvent**<`T`\>(`data`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Partial`<`T`\> |

#### Overrides

TakaroDTO&lt;BaseEvent&lt;T\&gt;\&gt;.constructor

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:30](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L30)

## Properties

### msg

• **msg**: `string`

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:28](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L28)

___

### timestamp

• **timestamp**: `string`

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:22](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L22)

___

### type

• **type**: `string`

#### Defined in

[packages/lib-gameserver/src/interfaces/events.ts:25](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/events.ts#L25)

## Methods

### toJSON

▸ **toJSON**(): `Record`<`string`, `any`\>

#### Returns

`Record`<`string`, `any`\>

#### Inherited from

TakaroDTO.toJSON

#### Defined in

node_modules/@takaro/util/dist/dto/TakaroDTO.d.ts:8

___

### validate

▸ **validate**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Inherited from

TakaroDTO.validate

#### Defined in

node_modules/@takaro/util/dist/dto/TakaroDTO.d.ts:7
