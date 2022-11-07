---
id: "takaro_util.TakaroDTO"
title: "Class: TakaroDTO<T>"
sidebar_label: "@takaro/util.TakaroDTO"
custom_edit_url: null
---

[@takaro/util](../modules/takaro_util.md).TakaroDTO

Generic Data Transfer Object, used widely in Takaro to pass data back and forth between components
Allows validation of properties when instantiated and JSON (de)serialization

## Type parameters

| Name |
| :------ |
| `T` |

## Constructors

### constructor

• **new TakaroDTO**<`T`\>(`data?`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Partial`<`T`\> |

#### Defined in

[packages/lib-util/src/dto/TakaroDTO.ts:11](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-util/src/dto/TakaroDTO.ts#L11)

## Methods

### toJSON

▸ **toJSON**(): `Record`<`string`, `any`\>

#### Returns

`Record`<`string`, `any`\>

#### Defined in

[packages/lib-util/src/dto/TakaroDTO.ts:29](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-util/src/dto/TakaroDTO.ts#L29)

___

### validate

▸ **validate**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/lib-util/src/dto/TakaroDTO.ts:15](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-util/src/dto/TakaroDTO.ts#L15)
