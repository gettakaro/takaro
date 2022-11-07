---
id: "takaro_db.IDbConfig"
title: "Interface: IDbConfig"
sidebar_label: "@takaro/db.IDbConfig"
custom_edit_url: null
---

[@takaro/db](../modules/takaro_db.md).IDbConfig

## Hierarchy

- `IBaseConfig`

  ↳ **`IDbConfig`**

## Properties

### app

• **app**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Inherited from

IBaseConfig.app

#### Defined in

node_modules/@takaro/config/dist/main.d.ts:3

___

### baseDomainSchema

• **baseDomainSchema**: `string`

#### Defined in

[packages/lib-db/src/config.ts:12](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/config.ts#L12)

___

### encryptionKey

• **encryptionKey**: `string`

#### Defined in

[packages/lib-db/src/config.ts:13](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/config.ts#L13)

___

### mode

• **mode**: ``"development"`` \| ``"production"`` \| ``"test"``

#### Inherited from

IBaseConfig.mode

#### Defined in

node_modules/@takaro/config/dist/main.d.ts:6

___

### postgres

• **postgres**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `database` | `string` |
| `host` | `string` |
| `password` | `string` |
| `port` | `number` |
| `user` | `string` |

#### Defined in

[packages/lib-db/src/config.ts:4](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/config.ts#L4)

___

### systemSchema

• **systemSchema**: `string`

#### Defined in

[packages/lib-db/src/config.ts:11](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-db/src/config.ts#L11)
