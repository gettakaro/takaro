---
id: "takaro_util.errors.TakaroError"
title: "Class: TakaroError"
sidebar_label: "@takaro/util.errors.TakaroError"
custom_edit_url: null
---

[@takaro/util](../modules/takaro_util.md).[errors](../namespaces/takaro_util.errors.md).TakaroError

## Hierarchy

- `Error`

  ↳ **`TakaroError`**

  ↳↳ [`InternalServerError`](takaro_util.errors.InternalServerError.md)

  ↳↳ [`ConfigError`](takaro_util.errors.ConfigError.md)

  ↳↳ [`NotImplementedError`](takaro_util.errors.NotImplementedError.md)

  ↳↳ [`ValidationError`](takaro_util.errors.ValidationError.md)

  ↳↳ [`GameServerError`](takaro_util.errors.GameServerError.md)

  ↳↳ [`WsTimeOutError`](takaro_util.errors.WsTimeOutError.md)

  ↳↳ [`BadRequestError`](takaro_util.errors.BadRequestError.md)

  ↳↳ [`UnauthorizedError`](takaro_util.errors.UnauthorizedError.md)

  ↳↳ [`ForbiddenError`](takaro_util.errors.ForbiddenError.md)

  ↳↳ [`NotFoundError`](takaro_util.errors.NotFoundError.md)

  ↳↳ [`ConflictError`](takaro_util.errors.ConflictError.md)

## Constructors

### constructor

• **new TakaroError**(`message`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |

#### Overrides

Error.constructor

#### Defined in

[packages/lib-util/src/errors.ts:6](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-util/src/errors.ts#L6)

## Properties

### http

• **http**: `number`

#### Defined in

[packages/lib-util/src/errors.ts:5](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-util/src/errors.ts#L5)

___

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1041

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1040

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1042

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

#### Type declaration

▸ (`err`, `stackTraces`): `any`

Optional override for formatting stack traces

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

Error.prepareStackTrace

#### Defined in

node_modules/@types/node/ts4.8/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

#### Defined in

node_modules/@types/node/ts4.8/globals.d.ts:13

## Methods

### captureStackTrace

▸ `Static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

Error.captureStackTrace

#### Defined in

node_modules/@types/node/ts4.8/globals.d.ts:4
