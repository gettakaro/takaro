---
id: "takaro_util"
title: "Module: @takaro/util"
sidebar_label: "@takaro/util"
sidebar_position: 0
custom_edit_url: null
---

## Namespaces

- [errors](../namespaces/takaro_util.errors.md)

## Classes

- [TakaroDTO](../classes/takaro_util.TakaroDTO.md)

## Functions

### isTakaroDTO

▸ **isTakaroDTO**<`T`\>(`value`): value is TakaroDTO<T\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `unknown` |

#### Returns

value is TakaroDTO<T\>

#### Defined in

[packages/lib-util/src/dto/TakaroDTO.ts:34](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-util/src/dto/TakaroDTO.ts#L34)

___

### logger

▸ **logger**(`namespace`, `meta?`): `winston.Logger`

#### Parameters

| Name | Type |
| :------ | :------ |
| `namespace` | `string` |
| `meta?` | `JsonObject` |

#### Returns

`winston.Logger`

#### Defined in

[packages/lib-util/src/logger.ts:71](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-util/src/logger.ts#L71)
