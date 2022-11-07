---
id: "takaro_util.errors.ValidationError"
title: "Class: ValidationError"
sidebar_label: "@takaro/util.errors.ValidationError"
custom_edit_url: null
---

[@takaro/util](../modules/takaro_util.md).[errors](../namespaces/takaro_util.errors.md).ValidationError

## Hierarchy

- [`TakaroError`](takaro_util.errors.TakaroError.md)

  ↳ **`ValidationError`**

## Constructors

### constructor

• **new ValidationError**(`message`, `details?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `details?` | `ValidationError`[] \| `default`[] |

#### Overrides

[TakaroError](takaro_util.errors.TakaroError.md).[constructor](takaro_util.errors.TakaroError.md#constructor)

#### Defined in

[packages/lib-util/src/errors.ts:35](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-util/src/errors.ts#L35)

## Properties

### details

• `Optional` **details**: `ValidationError`[] \| `default`[]

#### Defined in

[packages/lib-util/src/errors.ts:37](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-util/src/errors.ts#L37)

___

### http

• **http**: `number`

#### Inherited from

[TakaroError](takaro_util.errors.TakaroError.md).[http](takaro_util.errors.TakaroError.md#http)

#### Defined in

[packages/lib-util/src/errors.ts:5](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-util/src/errors.ts#L5)

___

### message

• **message**: `string`

#### Inherited from

[TakaroError](takaro_util.errors.TakaroError.md).[message](takaro_util.errors.TakaroError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1041

___

### name

• **name**: `string`

#### Inherited from

[TakaroError](takaro_util.errors.TakaroError.md).[name](takaro_util.errors.TakaroError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1040

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[TakaroError](takaro_util.errors.TakaroError.md).[stack](takaro_util.errors.TakaroError.md#stack)

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

[TakaroError](takaro_util.errors.TakaroError.md).[prepareStackTrace](takaro_util.errors.TakaroError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/ts4.8/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[TakaroError](takaro_util.errors.TakaroError.md).[stackTraceLimit](takaro_util.errors.TakaroError.md#stacktracelimit)

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

[TakaroError](takaro_util.errors.TakaroError.md).[captureStackTrace](takaro_util.errors.TakaroError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/ts4.8/globals.d.ts:4
