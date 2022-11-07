---
id: "takaro_db.QueryBuilder"
title: "Class: QueryBuilder<Model, OutputDTO>"
sidebar_label: "@takaro/db.QueryBuilder"
custom_edit_url: null
---

[@takaro/db](../modules/takaro_db.md).QueryBuilder

## Type parameters

| Name | Type |
| :------ | :------ |
| `Model` | extends `ObjectionModel` |
| `OutputDTO` | `OutputDTO` |

## Constructors

### constructor

• **new QueryBuilder**<`Model`, `OutputDTO`\>(`query?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Model` | extends `Model`<`Model`\> |
| `OutputDTO` | `OutputDTO` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`ITakaroQuery`](takaro_db.ITakaroQuery.md)<`OutputDTO`\> |

#### Defined in

[packages/lib-db/src/queryBuilder.ts:42](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/queryBuilder.ts#L42)

## Properties

### query

• `Private` `Readonly` **query**: [`ITakaroQuery`](takaro_db.ITakaroQuery.md)<`OutputDTO`\>

#### Defined in

[packages/lib-db/src/queryBuilder.ts:43](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/queryBuilder.ts#L43)

## Methods

### build

▸ **build**(`query`): `QueryBuilder`<`Model`, `Page`<`Model`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `QueryBuilder`<`Model`, `Model`[]\> |

#### Returns

`QueryBuilder`<`Model`, `Page`<`Model`\>\>

#### Defined in

[packages/lib-db/src/queryBuilder.ts:46](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/queryBuilder.ts#L46)

___

### filters

▸ `Private` **filters**(`tableName`): `Record`<`string`, `unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableName` | `string` |

#### Returns

`Record`<`string`, `unknown`\>

#### Defined in

[packages/lib-db/src/queryBuilder.ts:67](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/queryBuilder.ts#L67)

___

### pagination

▸ `Private` **pagination**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `limit` | `number` |
| `page` | `number` |

#### Defined in

[packages/lib-db/src/queryBuilder.ts:95](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/queryBuilder.ts#L95)

___

### sorting

▸ `Private` **sorting**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `sortBy` | `string` |
| `sortDirection` | `SortDirection` |

#### Defined in

[packages/lib-db/src/queryBuilder.ts:82](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/queryBuilder.ts#L82)
