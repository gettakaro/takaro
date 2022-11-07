---
id: "takaro_apiclient.AxiosError"
title: "Interface: AxiosError<T, D>"
sidebar_label: "@takaro/apiclient.AxiosError"
custom_edit_url: null
---

[@takaro/apiclient](../modules/takaro_apiclient.md).AxiosError

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |
| `D` | `any` |

## Hierarchy

- `Error`

  ↳ **`AxiosError`**

## Properties

### code

• `Optional` **code**: `string`

#### Defined in

node_modules/axios/index.d.ts:141

___

### config

• **config**: `AxiosRequestConfig`<`D`\>

#### Defined in

node_modules/axios/index.d.ts:140

___

### isAxiosError

• **isAxiosError**: `boolean`

#### Defined in

node_modules/axios/index.d.ts:144

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

### request

• `Optional` **request**: `any`

#### Defined in

node_modules/axios/index.d.ts:142

___

### response

• `Optional` **response**: [`AxiosResponse`](takaro_apiclient.AxiosResponse.md)<`T`, `D`\>

#### Defined in

node_modules/axios/index.d.ts:143

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1042

___

### toJSON

• **toJSON**: () => `object`

#### Type declaration

▸ (): `object`

##### Returns

`object`

#### Defined in

node_modules/axios/index.d.ts:145
