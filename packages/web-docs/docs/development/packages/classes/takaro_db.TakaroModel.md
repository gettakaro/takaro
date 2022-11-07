---
id: "takaro_db.TakaroModel"
title: "Class: TakaroModel"
sidebar_label: "@takaro/db.TakaroModel"
custom_edit_url: null
---

[@takaro/db](../modules/takaro_db.md).TakaroModel

## Hierarchy

- `Model`

  ↳ **`TakaroModel`**

## Constructors

### constructor

• **new TakaroModel**()

#### Inherited from

Model.constructor

## Properties

### $modelClass

• **$modelClass**: `ModelClass`<[`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Inherited from

Model.$modelClass

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1533

___

### QueryBuilderType

• **QueryBuilderType**: `QueryBuilder`<[`TakaroModel`](takaro_db.TakaroModel.md), [`TakaroModel`](takaro_db.TakaroModel.md)[]\>

#### Inherited from

Model.QueryBuilderType

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1603

___

### createdAt

• **createdAt**: `string`

#### Defined in

[packages/lib-db/src/TakaroModel.ts:5](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/TakaroModel.ts#L5)

___

### id

• **id**: `string`

#### Defined in

[packages/lib-db/src/TakaroModel.ts:4](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/TakaroModel.ts#L4)

___

### updatedAt

• **updatedAt**: `string`

#### Defined in

[packages/lib-db/src/TakaroModel.ts:6](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/TakaroModel.ts#L6)

___

### BelongsToOneRelation

▪ `Static` **BelongsToOneRelation**: `RelationType`

#### Inherited from

Model.BelongsToOneRelation

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1447

___

### HasManyRelation

▪ `Static` **HasManyRelation**: `RelationType`

#### Inherited from

Model.HasManyRelation

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1449

___

### HasOneRelation

▪ `Static` **HasOneRelation**: `RelationType`

#### Inherited from

Model.HasOneRelation

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1448

___

### HasOneThroughRelation

▪ `Static` **HasOneThroughRelation**: `RelationType`

#### Inherited from

Model.HasOneThroughRelation

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1451

___

### ManyToManyRelation

▪ `Static` **ManyToManyRelation**: `RelationType`

#### Inherited from

Model.ManyToManyRelation

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1450

___

### QueryBuilder

▪ `Static` **QueryBuilder**: typeof `QueryBuilder`

#### Inherited from

Model.QueryBuilder

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1423

___

### columnNameMappers

▪ `Static` **columnNameMappers**: `ColumnNameMappers`

#### Inherited from

Model.columnNameMappers

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1441

___

### dbRefProp

▪ `Static` **dbRefProp**: `string`

#### Inherited from

Model.dbRefProp

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1434

___

### defaultGraphOptions

▪ `Static` `Optional` **defaultGraphOptions**: `GraphOptions`

#### Inherited from

Model.defaultGraphOptions

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1453

___

### fn

▪ `Static` **fn**: `FunctionFunction`

#### Inherited from

Model.fn

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1445

___

### jsonAttributes

▪ `Static` **jsonAttributes**: `string`[]

#### Inherited from

Model.jsonAttributes

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1430

___

### jsonSchema

▪ `Static` **jsonSchema**: `JSONSchema`

#### Inherited from

Model.jsonSchema

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1427

___

### modelPaths

▪ `Static` **modelPaths**: `string`[]

#### Inherited from

Model.modelPaths

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1429

___

### modifiers

▪ `Static` **modifiers**: `Modifiers`<`AnyQueryBuilder`\>

#### Inherited from

Model.modifiers

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1440

___

### pickJsonSchemaProperties

▪ `Static` **pickJsonSchemaProperties**: `boolean`

#### Inherited from

Model.pickJsonSchemaProperties

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1436

___

### propRefRegex

▪ `Static` **propRefRegex**: `RegExp`

#### Inherited from

Model.propRefRegex

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1435

___

### raw

▪ `Static` **raw**: `RawFunction`

#### Inherited from

Model.raw

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1443

___

### ref

▪ `Static` **ref**: `ReferenceFunction`

#### Inherited from

Model.ref

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1444

___

### relatedFindQueryMutates

▪ `Static` **relatedFindQueryMutates**: `boolean`

#### Inherited from

Model.relatedFindQueryMutates

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1437

___

### relatedInsertQueryMutates

▪ `Static` **relatedInsertQueryMutates**: `boolean`

#### Inherited from

Model.relatedInsertQueryMutates

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1438

___

### relationMappings

▪ `Static` **relationMappings**: `RelationMappings` \| `RelationMappingsThunk`

#### Inherited from

Model.relationMappings

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1428

___

### tableName

▪ `Static` **tableName**: `string`

#### Inherited from

Model.tableName

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1425

___

### uidProp

▪ `Static` **uidProp**: `string`

#### Inherited from

Model.uidProp

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1432

___

### uidRefProp

▪ `Static` **uidRefProp**: `string`

#### Inherited from

Model.uidRefProp

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1433

___

### useLimitInFirst

▪ `Static` **useLimitInFirst**: `boolean`

#### Inherited from

Model.useLimitInFirst

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1439

___

### virtualAttributes

▪ `Static` **virtualAttributes**: `string`[]

#### Inherited from

Model.virtualAttributes

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1431

## Accessors

### idColumn

• `Static` `get` **idColumn**(): `string`

#### Returns

`string`

#### Overrides

Model.idColumn

#### Defined in

[packages/lib-db/src/TakaroModel.ts:8](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/TakaroModel.ts#L8)

## Methods

### $afterDelete

▸ **$afterDelete**(`queryContext`): `void` \| `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `queryContext` | `QueryContext` |

#### Returns

`void` \| `Promise`<`any`\>

#### Inherited from

Model.$afterDelete

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1572

___

### $afterFind

▸ **$afterFind**(`queryContext`): `void` \| `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `queryContext` | `QueryContext` |

#### Returns

`void` \| `Promise`<`any`\>

#### Inherited from

Model.$afterFind

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1570

___

### $afterGet

▸ **$afterGet**(`queryContext`): `void` \| `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `queryContext` | `QueryContext` |

#### Returns

`void` \| `Promise`<`any`\>

#### Inherited from

Model.$afterGet

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1569

___

### $afterInsert

▸ **$afterInsert**(`queryContext`): `void` \| `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `queryContext` | `QueryContext` |

#### Returns

`void` \| `Promise`<`any`\>

#### Inherited from

Model.$afterInsert

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1566

___

### $afterUpdate

▸ **$afterUpdate**(`opt`, `queryContext`): `void` \| `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opt` | `ModelOptions` |
| `queryContext` | `QueryContext` |

#### Returns

`void` \| `Promise`<`any`\>

#### Inherited from

Model.$afterUpdate

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1567

___

### $afterValidate

▸ **$afterValidate**(`json`, `opt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | `Pojo` |
| `opt` | `ModelOptions` |

#### Returns

`void`

#### Inherited from

Model.$afterValidate

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1563

___

### $appendRelated

▸ **$appendRelated**<`RM`\>(`relation`, `related`): [`TakaroModel`](takaro_db.TakaroModel.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RM` | extends `Model`<`RM`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `relation` | `String` \| `Relation` |
| `related` | `undefined` \| ``null`` \| `RM` \| `RM`[] |

#### Returns

[`TakaroModel`](takaro_db.TakaroModel.md)

#### Inherited from

Model.$appendRelated

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1586

___

### $beforeDelete

▸ **$beforeDelete**(`queryContext`): `void` \| `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `queryContext` | `QueryContext` |

#### Returns

`void` \| `Promise`<`any`\>

#### Inherited from

Model.$beforeDelete

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1571

___

### $beforeInsert

▸ **$beforeInsert**(): `void`

#### Returns

`void`

#### Overrides

Model.$beforeInsert

#### Defined in

[packages/lib-db/src/TakaroModel.ts:12](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/TakaroModel.ts#L12)

___

### $beforeUpdate

▸ **$beforeUpdate**(): `void`

#### Returns

`void`

#### Overrides

Model.$beforeUpdate

#### Defined in

[packages/lib-db/src/TakaroModel.ts:16](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/TakaroModel.ts#L16)

___

### $beforeValidate

▸ **$beforeValidate**(`jsonSchema`, `json`, `opt`): `JSONSchema`

#### Parameters

| Name | Type |
| :------ | :------ |
| `jsonSchema` | `JSONSchema` |
| `json` | `Pojo` |
| `opt` | `ModelOptions` |

#### Returns

`JSONSchema`

#### Inherited from

Model.$beforeValidate

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1561

___

### $clone

▸ **$clone**(`opt?`): [`TakaroModel`](takaro_db.TakaroModel.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opt?` | `CloneOptions` |

#### Returns

[`TakaroModel`](takaro_db.TakaroModel.md)

#### Inherited from

Model.$clone

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1594

___

### $fetchGraph

▸ **$fetchGraph**(`expression`, `options?`): `QueryBuilder`<[`TakaroModel`](takaro_db.TakaroModel.md), [`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `expression` | `RelationExpression`<`M`\> |
| `options?` | `FetchGraphOptions` |

#### Returns

`QueryBuilder`<[`TakaroModel`](takaro_db.TakaroModel.md), [`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Inherited from

Model.$fetchGraph

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1550

___

### $formatDatabaseJson

▸ **$formatDatabaseJson**(`json`): `Pojo`

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | `Pojo` |

#### Returns

`Pojo`

#### Inherited from

Model.$formatDatabaseJson

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1555

___

### $formatJson

▸ **$formatJson**(`json`): `Pojo`

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | `Pojo` |

#### Returns

`Pojo`

#### Inherited from

Model.$formatJson

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1558

___

### $id

▸ **$id**(`id`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `any` |

#### Returns

`void`

#### Inherited from

Model.$id

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1547

▸ **$id**(): `any`

#### Returns

`any`

#### Inherited from

Model.$id

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1548

___

### $knex

▸ **$knex**(): `Knex`<`any`, `any`[]\>

#### Returns

`Knex`<`any`, `any`[]\>

#### Inherited from

Model.$knex

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1600

___

### $omit

▸ **$omit**(`keys`): [`TakaroModel`](takaro_db.TakaroModel.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `keys` | `string` \| `string`[] \| { `[key: string]`: `boolean`;  } |

#### Returns

[`TakaroModel`](takaro_db.TakaroModel.md)

#### Inherited from

Model.$omit

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1592

___

### $parseDatabaseJson

▸ **$parseDatabaseJson**(`json`): `Pojo`

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | `Pojo` |

#### Returns

`Pojo`

#### Inherited from

Model.$parseDatabaseJson

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1556

___

### $parseJson

▸ **$parseJson**(`json`, `opt?`): `Pojo`

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | `Pojo` |
| `opt?` | `ModelOptions` |

#### Returns

`Pojo`

#### Inherited from

Model.$parseJson

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1559

___

### $pick

▸ **$pick**(`keys`): [`TakaroModel`](takaro_db.TakaroModel.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `keys` | `string` \| `string`[] \| { `[key: string]`: `boolean`;  } |

#### Returns

[`TakaroModel`](takaro_db.TakaroModel.md)

#### Inherited from

Model.$pick

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1593

___

### $query

▸ **$query**(`trxOrKnex?`): `QueryBuilder`<[`TakaroModel`](takaro_db.TakaroModel.md), [`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `trxOrKnex?` | `TransactionOrKnex` |

#### Returns

`QueryBuilder`<[`TakaroModel`](takaro_db.TakaroModel.md), [`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Inherited from

Model.$query

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1545

___

### $relatedQuery

▸ **$relatedQuery**<`K`\>(`relationName`, `trxOrKnex?`): `RelatedQueryBuilder`<[`TakaroModel`](takaro_db.TakaroModel.md)[`K`]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`TakaroModel`](takaro_db.TakaroModel.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `relationName` | `K` |
| `trxOrKnex?` | `TransactionOrKnex` |

#### Returns

`RelatedQueryBuilder`<[`TakaroModel`](takaro_db.TakaroModel.md)[`K`]\>

#### Inherited from

Model.$relatedQuery

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1535

▸ **$relatedQuery**<`RM`\>(`relationName`, `trxOrKnex?`): `QueryBuilderType`<`RM`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RM` | extends `Model`<`RM`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `relationName` | `string` |
| `trxOrKnex?` | `TransactionOrKnex` |

#### Returns

`QueryBuilderType`<`RM`\>

#### Inherited from

Model.$relatedQuery

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1540

___

### $set

▸ **$set**(`obj`): [`TakaroModel`](takaro_db.TakaroModel.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `Pojo` |

#### Returns

[`TakaroModel`](takaro_db.TakaroModel.md)

#### Inherited from

Model.$set

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1591

___

### $setDatabaseJson

▸ **$setDatabaseJson**(`json`): [`TakaroModel`](takaro_db.TakaroModel.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | `object` |

#### Returns

[`TakaroModel`](takaro_db.TakaroModel.md)

#### Inherited from

Model.$setDatabaseJson

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1579

___

### $setJson

▸ **$setJson**(`json`, `opt?`): [`TakaroModel`](takaro_db.TakaroModel.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | `object` |
| `opt?` | `ModelOptions` |

#### Returns

[`TakaroModel`](takaro_db.TakaroModel.md)

#### Inherited from

Model.$setJson

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1578

___

### $setRelated

▸ **$setRelated**<`RM`\>(`relation`, `related`): [`TakaroModel`](takaro_db.TakaroModel.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RM` | extends `Model`<`RM`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `relation` | `String` \| `Relation` |
| `related` | `undefined` \| ``null`` \| `RM` \| `RM`[] |

#### Returns

[`TakaroModel`](takaro_db.TakaroModel.md)

#### Inherited from

Model.$setRelated

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1581

___

### $toDatabaseJson

▸ **$toDatabaseJson**(): `Pojo`

#### Returns

`Pojo`

#### Inherited from

Model.$toDatabaseJson

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1574

___

### $toJson

▸ **$toJson**(`opt?`): `ModelObject`<[`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opt?` | `ToJsonOptions` |

#### Returns

`ModelObject`<[`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Inherited from

Model.$toJson

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1575

___

### $transaction

▸ **$transaction**(): `Knex`<`any`, `any`[]\>

#### Returns

`Knex`<`any`, `any`[]\>

#### Inherited from

Model.$transaction

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1601

___

### $traverse

▸ **$traverse**(`filterConstructor`, `traverser`): [`TakaroModel`](takaro_db.TakaroModel.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `filterConstructor` | typeof `Model` |
| `traverser` | `TraverserFunction` |

#### Returns

[`TakaroModel`](takaro_db.TakaroModel.md)

#### Inherited from

Model.$traverse

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1595

▸ **$traverse**(`traverser`): [`TakaroModel`](takaro_db.TakaroModel.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `traverser` | `TraverserFunction` |

#### Returns

[`TakaroModel`](takaro_db.TakaroModel.md)

#### Inherited from

Model.$traverse

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1596

___

### $traverseAsync

▸ **$traverseAsync**(`filterConstructor`, `traverser`): `Promise`<[`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filterConstructor` | typeof `Model` |
| `traverser` | `TraverserFunction` |

#### Returns

`Promise`<[`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Inherited from

Model.$traverseAsync

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1597

▸ **$traverseAsync**(`traverser`): `Promise`<[`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `traverser` | `TraverserFunction` |

#### Returns

`Promise`<[`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Inherited from

Model.$traverseAsync

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1598

___

### $validate

▸ **$validate**(`json?`, `opt?`): `Pojo`

#### Parameters

| Name | Type |
| :------ | :------ |
| `json?` | `Pojo` |
| `opt?` | `ModelOptions` |

#### Returns

`Pojo`

#### Inherited from

Model.$validate

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1562

___

### toJSON

▸ **toJSON**(`opt?`): `ModelObject`<[`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opt?` | `ToJsonOptions` |

#### Returns

`ModelObject`<[`TakaroModel`](takaro_db.TakaroModel.md)\>

#### Inherited from

Model.toJSON

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1576

___

### afterDelete

▸ `Static` **afterDelete**(`args`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `StaticHookArguments`<`any`, `any`\> |

#### Returns

`any`

#### Inherited from

Model.afterDelete

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1531

___

### afterFind

▸ `Static` **afterFind**(`args`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `StaticHookArguments`<`any`, `any`\> |

#### Returns

`any`

#### Inherited from

Model.afterFind

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1525

___

### afterInsert

▸ `Static` **afterInsert**(`args`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `StaticHookArguments`<`any`, `any`\> |

#### Returns

`any`

#### Inherited from

Model.afterInsert

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1527

___

### afterUpdate

▸ `Static` **afterUpdate**(`args`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `StaticHookArguments`<`any`, `any`\> |

#### Returns

`any`

#### Inherited from

Model.afterUpdate

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1529

___

### beforeDelete

▸ `Static` **beforeDelete**(`args`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `StaticHookArguments`<`any`, `any`\> |

#### Returns

`any`

#### Inherited from

Model.beforeDelete

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1530

___

### beforeFind

▸ `Static` **beforeFind**(`args`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `StaticHookArguments`<`any`, `any`\> |

#### Returns

`any`

#### Inherited from

Model.beforeFind

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1524

___

### beforeInsert

▸ `Static` **beforeInsert**(`args`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `StaticHookArguments`<`any`, `any`\> |

#### Returns

`any`

#### Inherited from

Model.beforeInsert

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1526

___

### beforeUpdate

▸ `Static` **beforeUpdate**(`args`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `StaticHookArguments`<`any`, `any`\> |

#### Returns

`any`

#### Inherited from

Model.beforeUpdate

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1528

___

### bindKnex

▸ `Static` **bindKnex**<`M`\>(`this`, `trxOrKnex`): `M`

#### Type parameters

| Name |
| :------ |
| `M` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `M` |
| `trxOrKnex` | `TransactionOrKnex` |

#### Returns

`M`

#### Inherited from

Model.bindKnex

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1491

___

### bindTransaction

▸ `Static` **bindTransaction**<`M`\>(`this`, `trxOrKnex`): `M`

#### Type parameters

| Name |
| :------ |
| `M` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `M` |
| `trxOrKnex` | `TransactionOrKnex` |

#### Returns

`M`

#### Inherited from

Model.bindTransaction

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1492

___

### createNotFoundError

▸ `Static` **createNotFoundError**(`queryContext`, `args`): `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `queryContext` | `QueryContext` |
| `args` | `CreateNotFoundErrorArgs` |

#### Returns

`Error`

#### Inherited from

Model.createNotFoundError

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1476

___

### createValidationError

▸ `Static` **createValidationError**(`args`): `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `CreateValidationErrorArgs` |

#### Returns

`Error`

#### Inherited from

Model.createValidationError

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1475

___

### createValidator

▸ `Static` **createValidator**(): `Validator`

#### Returns

`Validator`

#### Inherited from

Model.createValidator

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1474

___

### fetchGraph

▸ `Static` **fetchGraph**<`M`\>(`this`, `modelOrObject`, `expression`, `options?`): `SingleQueryBuilder`<`QueryBuilderType`<`M`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Model`<`M`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `Constructor`<`M`\> |
| `modelOrObject` | `PartialModelObject`<`M`\> |
| `expression` | `RelationExpression`<`M`\> |
| `options?` | `FetchGraphOptions` |

#### Returns

`SingleQueryBuilder`<`QueryBuilderType`<`M`\>\>

#### Inherited from

Model.fetchGraph

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1494

▸ `Static` **fetchGraph**<`M`\>(`this`, `modelOrObject`, `expression`, `options?`): `QueryBuilderType`<`M`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Model`<`M`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `Constructor`<`M`\> |
| `modelOrObject` | `PartialModelObject`<`M`\>[] |
| `expression` | `RelationExpression`<`M`\> |
| `options?` | `FetchGraphOptions` |

#### Returns

`QueryBuilderType`<`M`\>

#### Inherited from

Model.fetchGraph

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1501

___

### fetchTableMetadata

▸ `Static` **fetchTableMetadata**(`opt?`): `Promise`<`TableMetadata`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opt?` | `FetchTableMetadataOptions` |

#### Returns

`Promise`<`TableMetadata`\>

#### Inherited from

Model.fetchTableMetadata

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1479

___

### fromDatabaseJson

▸ `Static` **fromDatabaseJson**<`M`\>(`this`, `json`): `M`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Model`<`M`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `Constructor`<`M`\> |
| `json` | `object` |

#### Returns

`M`

#### Inherited from

Model.fromDatabaseJson

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1472

___

### fromJson

▸ `Static` **fromJson**<`M`\>(`this`, `json`, `opt?`): `M`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Model`<`M`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `Constructor`<`M`\> |
| `json` | `object` |
| `opt?` | `ModelOptions` |

#### Returns

`M`

#### Inherited from

Model.fromJson

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1471

___

### getRelation

▸ `Static` **getRelation**(`name`): `Relation`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

`Relation`

#### Inherited from

Model.getRelation

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1509

___

### getRelations

▸ `Static` **getRelations**(): `Relations`

#### Returns

`Relations`

#### Inherited from

Model.getRelations

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1508

___

### knex

▸ `Static` **knex**(`knex?`): `Knex`<`any`, `any`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `knex?` | `Knex`<`any`, `any`[]\> |

#### Returns

`Knex`<`any`, `any`[]\>

#### Inherited from

Model.knex

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1481

___

### knexQuery

▸ `Static` **knexQuery**(): `QueryBuilder`<`any`, `any`\>

#### Returns

`QueryBuilder`<`any`, `any`\>

#### Inherited from

Model.knexQuery

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1482

___

### query

▸ `Static` **query**<`M`\>(`this`, `trxOrKnex?`): `QueryBuilderType`<`M`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Model`<`M`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `Constructor`<`M`\> |
| `trxOrKnex?` | `TransactionOrKnex` |

#### Returns

`QueryBuilderType`<`M`\>

#### Inherited from

Model.query

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1455

___

### relatedQuery

▸ `Static` **relatedQuery**<`M`, `K`\>(`this`, `relationName`, `trxOrKnex?`): `ArrayRelatedQueryBuilder`<`M`[`K`]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Model`<`M`\> |
| `K` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `Constructor`<`M`\> |
| `relationName` | `K` |
| `trxOrKnex?` | `TransactionOrKnex` |

#### Returns

`ArrayRelatedQueryBuilder`<`M`[`K`]\>

#### Inherited from

Model.relatedQuery

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1460

▸ `Static` **relatedQuery**<`RM`\>(`relationName`, `trxOrKnex?`): `QueryBuilderType`<`RM`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RM` | extends `Model`<`RM`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `relationName` | `string` |
| `trxOrKnex?` | `TransactionOrKnex` |

#### Returns

`QueryBuilderType`<`RM`\>

#### Inherited from

Model.relatedQuery

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1466

___

### startTransaction

▸ `Static` **startTransaction**(`knexOrTransaction?`): `Promise`<`Transaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `knexOrTransaction?` | `TransactionOrKnex` |

#### Returns

`Promise`<`Transaction`\>

#### Inherited from

Model.startTransaction

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1483

___

### tableMetadata

▸ `Static` **tableMetadata**(`opt?`): `TableMetadata`

#### Parameters

| Name | Type |
| :------ | :------ |
| `opt?` | `TableMetadataOptions` |

#### Returns

`TableMetadata`

#### Inherited from

Model.tableMetadata

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1478

___

### transaction

▸ `Static` **transaction**<`T`\>(`callback`): `Promise`<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | (`trx`: `Transaction`) => `Promise`<`T`\> |

#### Returns

`Promise`<`T`\>

#### Inherited from

Model.transaction

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1485

▸ `Static` **transaction**<`T`\>(`trxOrKnex`, `callback`): `Promise`<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `trxOrKnex` | `TransactionOrKnex` |
| `callback` | (`trx`: `Transaction`) => `Promise`<`T`\> |

#### Returns

`Promise`<`T`\>

#### Inherited from

Model.transaction

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1486

___

### traverse

▸ `Static` **traverse**(`models`, `traverser`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `models` | `Model` \| `Model`[] |
| `traverser` | `TraverserFunction` |

#### Returns

`void`

#### Inherited from

Model.traverse

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1511

▸ `Static` **traverse**(`filterConstructor`, `models`, `traverser`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `filterConstructor` | typeof `Model` |
| `models` | `Model` \| `Model`[] |
| `traverser` | `TraverserFunction` |

#### Returns

`void`

#### Inherited from

Model.traverse

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1512

___

### traverseAsync

▸ `Static` **traverseAsync**(`models`, `traverser`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `models` | `Model` \| `Model`[] |
| `traverser` | `TraverserFunction` |

#### Returns

`Promise`<`void`\>

#### Inherited from

Model.traverseAsync

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1517

▸ `Static` **traverseAsync**(`filterConstructor`, `models`, `traverser`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filterConstructor` | typeof `Model` |
| `models` | `Model` \| `Model`[] |
| `traverser` | `TraverserFunction` |

#### Returns

`Promise`<`void`\>

#### Inherited from

Model.traverseAsync

#### Defined in

node_modules/objection/typings/objection/index.d.ts:1518
