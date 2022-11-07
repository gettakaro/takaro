---
id: "takaro_lib_components.errors.ResponseValidationError"
title: "Class: ResponseValidationError"
sidebar_label: "@takaro/lib-components.errors.ResponseValidationError"
custom_edit_url: null
---

[@takaro/lib-components](../modules/takaro_lib_components.md).[errors](../namespaces/takaro_lib_components.errors.md).ResponseValidationError

## Hierarchy

- `DomainError`

  ↳ **`ResponseValidationError`**

## Constructors

### constructor

• **new ResponseValidationError**(`message`, `validationErrors`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `validationErrors` | `default`[] |

#### Overrides

DomainError.constructor

#### Defined in

[packages/lib-components/src/errors/errors.ts:5](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-components/src/errors/errors.ts#L5)

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

DomainError.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:26

___

### message

• **message**: `string`

#### Inherited from

DomainError.message

#### Defined in

[packages/lib-components/src/errors/base.ts:7](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-components/src/errors/base.ts#L7)

___

### name

• **name**: `string`

#### Inherited from

DomainError.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1040

___

### options

• `Protected` `Optional` **options**: `Partial`<`IErrorOptions`\>

#### Inherited from

DomainError.options

#### Defined in

[packages/lib-components/src/errors/base.ts:8](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-components/src/errors/base.ts#L8)

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

DomainError.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1042

___

### validationErrors

• **validationErrors**: `default`[]

#### Defined in

[packages/lib-components/src/errors/errors.ts:5](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-components/src/errors/errors.ts#L5)

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

DomainError.prepareStackTrace

#### Defined in

node_modules/@types/node/ts4.8/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

DomainError.stackTraceLimit

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

DomainError.captureStackTrace

#### Defined in

node_modules/@types/node/ts4.8/globals.d.ts:4
