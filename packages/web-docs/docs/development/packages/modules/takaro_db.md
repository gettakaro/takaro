---
id: "takaro_db"
title: "Module: @takaro/db"
sidebar_label: "@takaro/db"
sidebar_position: 0
custom_edit_url: null
---

## Classes

- [ITakaroQuery](../classes/takaro_db.ITakaroQuery.md)
- [QueryBuilder](../classes/takaro_db.QueryBuilder.md)
- [TakaroModel](../classes/takaro_db.TakaroModel.md)

## Interfaces

- [IDbConfig](../interfaces/takaro_db.IDbConfig.md)

## Variables

### configSchema

• `Const` **configSchema**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `baseDomainSchema` | { `default`: `string` = 'domain\_'; `doc`: `string` = 'String used as base for creating name of domain-scoped schemas'; `env`: `string` = 'POSTGRES\_BASE\_DOMAIN\_SCHEMA'; `format`: `StringConstructor` = String } |
| `baseDomainSchema.default` | `string` |
| `baseDomainSchema.doc` | `string` |
| `baseDomainSchema.env` | `string` |
| `baseDomainSchema.format` | `StringConstructor` |
| `encryptionKey` | { `default`: ``null`` = null; `doc`: `string` = 'Encryption key used for encrypting sensitive data'; `env`: `string` = 'POSTGRES\_ENCRYPTION\_KEY'; `format`: `StringConstructor` = String } |
| `encryptionKey.default` | ``null`` |
| `encryptionKey.doc` | `string` |
| `encryptionKey.env` | `string` |
| `encryptionKey.format` | `StringConstructor` |
| `postgres` | { `database`: { `default`: `string` = 'postgres'; `doc`: `string` = 'The Postgres database to use'; `env`: `string` = 'POSTGRES\_DB'; `format`: `StringConstructor` = String } ; `host`: { `default`: `string` = 'localhost'; `doc`: `string` = 'The Postgres host to connect to'; `env`: `string` = 'POSTGRES\_HOST'; `format`: `StringConstructor` = String } ; `password`: { `default`: `string` = 'postgres'; `doc`: `string` = 'The Postgres password to use'; `env`: `string` = 'POSTGRES\_PASSWORD'; `format`: `StringConstructor` = String } ; `port`: { `default`: `number` = 5432; `doc`: `string` = 'The Postgres port to connect to'; `env`: `string` = 'POSTGRES\_PORT'; `format`: `NumberConstructor` = Number } ; `user`: { `default`: `string` = 'postgres'; `doc`: `string` = 'The Postgres user to connect as'; `env`: `string` = 'POSTGRES\_USER'; `format`: `StringConstructor` = String }  } |
| `postgres.database` | { `default`: `string` = 'postgres'; `doc`: `string` = 'The Postgres database to use'; `env`: `string` = 'POSTGRES\_DB'; `format`: `StringConstructor` = String } |
| `postgres.database.default` | `string` |
| `postgres.database.doc` | `string` |
| `postgres.database.env` | `string` |
| `postgres.database.format` | `StringConstructor` |
| `postgres.host` | { `default`: `string` = 'localhost'; `doc`: `string` = 'The Postgres host to connect to'; `env`: `string` = 'POSTGRES\_HOST'; `format`: `StringConstructor` = String } |
| `postgres.host.default` | `string` |
| `postgres.host.doc` | `string` |
| `postgres.host.env` | `string` |
| `postgres.host.format` | `StringConstructor` |
| `postgres.password` | { `default`: `string` = 'postgres'; `doc`: `string` = 'The Postgres password to use'; `env`: `string` = 'POSTGRES\_PASSWORD'; `format`: `StringConstructor` = String } |
| `postgres.password.default` | `string` |
| `postgres.password.doc` | `string` |
| `postgres.password.env` | `string` |
| `postgres.password.format` | `StringConstructor` |
| `postgres.port` | { `default`: `number` = 5432; `doc`: `string` = 'The Postgres port to connect to'; `env`: `string` = 'POSTGRES\_PORT'; `format`: `NumberConstructor` = Number } |
| `postgres.port.default` | `number` |
| `postgres.port.doc` | `string` |
| `postgres.port.env` | `string` |
| `postgres.port.format` | `NumberConstructor` |
| `postgres.user` | { `default`: `string` = 'postgres'; `doc`: `string` = 'The Postgres user to connect as'; `env`: `string` = 'POSTGRES\_USER'; `format`: `StringConstructor` = String } |
| `postgres.user.default` | `string` |
| `postgres.user.doc` | `string` |
| `postgres.user.env` | `string` |
| `postgres.user.format` | `StringConstructor` |
| `systemSchema` | { `default`: `string` = 'takaro'; `doc`: `string` = 'The Postgres schema to use for system-related actions (like domain management)'; `env`: `string` = 'POSTGRES\_SYSTEM\_SCHEMA'; `format`: `StringConstructor` = String } |
| `systemSchema.default` | `string` |
| `systemSchema.doc` | `string` |
| `systemSchema.env` | `string` |
| `systemSchema.format` | `StringConstructor` |

#### Defined in

[packages/lib-db/src/config.ts:16](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/config.ts#L16)

## Functions

### NOT\_DOMAIN\_SCOPED\_getKnex

▸ **NOT_DOMAIN_SCOPED_getKnex**(`alternateSearchPath?`): `Promise`<`IKnex`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `alternateSearchPath?` | `string` |

#### Returns

`Promise`<`IKnex`\>

#### Defined in

[packages/lib-db/src/knex.ts:29](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/knex.ts#L29)

___

### compareHashed

▸ **compareHashed**(`value`, `hash`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |
| `hash` | `string` |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[packages/lib-db/src/encryption.ts:31](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/encryption.ts#L31)

___

### decrypt

▸ **decrypt**(`value`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/lib-db/src/encryption.ts:13](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/encryption.ts#L13)

___

### disconnectKnex

▸ **disconnectKnex**(`domainId`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `domainId` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/lib-db/src/knex.ts:72](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/knex.ts#L72)

___

### encrypt

▸ **encrypt**(`value`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/lib-db/src/encryption.ts:4](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/encryption.ts#L4)

___

### getDomainSchemaName

▸ **getDomainSchemaName**(`domainId`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `domainId` | `string` |

#### Returns

`string`

#### Defined in

[packages/lib-db/src/knex.ts:22](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/knex.ts#L22)

___

### getKnex

▸ **getKnex**(`domainId`): `Promise`<`IKnex`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `domainId` | `string` |

#### Returns

`Promise`<`IKnex`\>

#### Defined in

[packages/lib-db/src/knex.ts:55](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/knex.ts#L55)

___

### hash

▸ **hash**(`value`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/lib-db/src/encryption.ts:22](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/encryption.ts#L22)

___

### migrateDomain

▸ **migrateDomain**(`domainId`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `domainId` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/lib-db/src/migrations/index.ts:55](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/migrations/index.ts#L55)

___

### migrateSystem

▸ **migrateSystem**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/lib-db/src/migrations/index.ts:47](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/migrations/index.ts#L47)
