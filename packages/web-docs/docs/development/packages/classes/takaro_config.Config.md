---
id: "takaro_config.Config"
title: "Class: Config<T>"
sidebar_label: "@takaro/config.Config"
custom_edit_url: null
---

[@takaro/config](../modules/takaro_config.md).Config

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`IBaseConfig`](../interfaces/takaro_config.IBaseConfig.md) |

## Constructors

### constructor

• **new Config**<`T`\>(`valuesArray?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`IBaseConfig`](../interfaces/takaro_config.IBaseConfig.md) |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `valuesArray` | `Schema`<`Partial`<`T`\>\>[] | `[]` |

#### Defined in

[packages/lib-config/src/main.ts:30](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-config/src/main.ts#L30)

## Properties

### \_config

• **\_config**: `Config`<`T`\>

#### Defined in

[packages/lib-config/src/main.ts:28](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-config/src/main.ts#L28)

## Methods

### get

▸ **get**<`K`\>(`arg`): `K` extends `undefined` \| ``null`` ? `T` : `K` extends `Path`<`T`\> ? `PathValue`<`T`, `K`\> : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `K` |

#### Returns

`K` extends `undefined` \| ``null`` ? `T` : `K` extends `Path`<`T`\> ? `PathValue`<`T`, `K`\> : `never`

#### Defined in

[packages/lib-config/src/main.ts:39](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-config/src/main.ts#L39)

___

### load

▸ **load**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Partial`<`T`\> |

#### Returns

`void`

#### Defined in

[packages/lib-config/src/main.ts:49](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-config/src/main.ts#L49)

___

### validate

▸ **validate**(): `void`

#### Returns

`void`

#### Defined in

[packages/lib-config/src/main.ts:53](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-config/src/main.ts#L53)
