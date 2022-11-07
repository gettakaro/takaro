---
id: "takaro_db.ITakaroQuery"
title: "Class: ITakaroQuery<T>"
sidebar_label: "@takaro/db.ITakaroQuery"
custom_edit_url: null
---

[@takaro/db](../modules/takaro_db.md).ITakaroQuery

## Type parameters

| Name |
| :------ |
| `T` |

## Constructors

### constructor

• **new ITakaroQuery**<`T`\>()

#### Type parameters

| Name |
| :------ |
| `T` |

## Properties

### extend

• `Optional` **extend**: `string`[]

#### Defined in

[packages/lib-db/src/queryBuilder.ts:33](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/queryBuilder.ts#L33)

___

### filters

• `Optional` **filters**: { [key in string \| number \| symbol]?: unknown }

#### Defined in

[packages/lib-db/src/queryBuilder.ts:10](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/queryBuilder.ts#L10)

___

### limit

• `Optional` **limit**: `number`

#### Defined in

[packages/lib-db/src/queryBuilder.ts:20](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/queryBuilder.ts#L20)

___

### page

• `Optional` **page**: `number`

#### Defined in

[packages/lib-db/src/queryBuilder.ts:16](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/queryBuilder.ts#L16)

___

### sortBy

• `Optional` **sortBy**: `Extract`<keyof `T`, `string`\>

#### Defined in

[packages/lib-db/src/queryBuilder.ts:24](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/queryBuilder.ts#L24)

___

### sortDirection

• `Optional` **sortDirection**: `SortDirection`

#### Defined in

[packages/lib-db/src/queryBuilder.ts:29](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/queryBuilder.ts#L29)
