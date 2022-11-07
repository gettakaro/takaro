---
id: "takaro_gameserver.TestReachabilityOutput"
title: "Class: TestReachabilityOutput"
sidebar_label: "@takaro/gameserver.TestReachabilityOutput"
custom_edit_url: null
---

[@takaro/gameserver](../modules/takaro_gameserver.md).TestReachabilityOutput

## Hierarchy

- `TakaroDTO`<[`TestReachabilityOutput`](takaro_gameserver.TestReachabilityOutput.md)\>

  ↳ **`TestReachabilityOutput`**

## Constructors

### constructor

• **new TestReachabilityOutput**(`data?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data?` | `Partial`<[`TestReachabilityOutput`](takaro_gameserver.TestReachabilityOutput.md)\> |

#### Inherited from

TakaroDTO<TestReachabilityOutput\>.constructor

#### Defined in

node_modules/@takaro/util/dist/dto/TakaroDTO.d.ts:6

## Properties

### connectable

• **connectable**: `boolean`

#### Defined in

[packages/lib-gameserver/src/interfaces/GameServer.ts:8](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GameServer.ts#L8)

___

### reason

• `Optional` **reason**: `string`

#### Defined in

[packages/lib-gameserver/src/interfaces/GameServer.ts:12](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GameServer.ts#L12)

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
