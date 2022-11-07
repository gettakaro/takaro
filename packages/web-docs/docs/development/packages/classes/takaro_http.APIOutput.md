---
id: "takaro_http.APIOutput"
title: "Class: APIOutput<T>"
sidebar_label: "@takaro/http.APIOutput"
custom_edit_url: null
---

[@takaro/http](../modules/takaro_http.md).APIOutput

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- `TakaroDTO`<[`APIOutput`](takaro_http.APIOutput.md)<`T`\>\>

  ↳ **`APIOutput`**

## Constructors

### constructor

• **new APIOutput**<`T`\>(`data?`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data?` | `Partial`<[`APIOutput`](takaro_http.APIOutput.md)<`T`\>\> |

#### Inherited from

TakaroDTO<APIOutput<T\>\>.constructor

#### Defined in

node_modules/@takaro/util/dist/dto/TakaroDTO.d.ts:6

## Properties

### data

• **data**: `T`

#### Defined in

[packages/lib-http/src/util/apiResponse.ts:63](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/util/apiResponse.ts#L63)

___

### metadata

• **metadata**: `MetadataOutput`

#### Defined in

[packages/lib-http/src/util/apiResponse.ts:61](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/util/apiResponse.ts#L61)

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
