---
id: "takaro_apiclient.FunctionApi"
title: "Class: FunctionApi"
sidebar_label: "@takaro/apiclient.FunctionApi"
custom_edit_url: null
---

[@takaro/apiclient](../modules/takaro_apiclient.md).FunctionApi

FunctionApi - object-oriented interface

**`Export`**

## Hierarchy

- `BaseAPI`

  ↳ **`FunctionApi`**

## Constructors

### constructor

• **new FunctionApi**(`configuration?`, `basePath?`, `axios?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `configuration?` | `Configuration` | `undefined` |
| `basePath` | `string` | `BASE_PATH` |
| `axios` | `AxiosInstance` | `globalAxios` |

#### Inherited from

BaseAPI.constructor

#### Defined in

[packages/lib-apiclient/src/generated/base.ts:55](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/base.ts#L55)

## Properties

### axios

• `Protected` **axios**: `AxiosInstance` = `globalAxios`

#### Inherited from

BaseAPI.axios

#### Defined in

[packages/lib-apiclient/src/generated/base.ts:58](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/base.ts#L58)

___

### basePath

• `Protected` **basePath**: `string` = `BASE_PATH`

#### Inherited from

BaseAPI.basePath

#### Defined in

[packages/lib-apiclient/src/generated/base.ts:57](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/base.ts#L57)

___

### configuration

• `Protected` **configuration**: `undefined` \| `Configuration`

#### Inherited from

BaseAPI.configuration

#### Defined in

[packages/lib-apiclient/src/generated/base.ts:53](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/base.ts#L53)

## Methods

### functionControllerCreate

▸ **functionControllerCreate**(`functionCreateDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`FunctionOutputDTOAPI`](../interfaces/takaro_apiclient.FunctionOutputDTOAPI.md), `any`\>\>

**`Summary`**

Create

**`Throws`**

**`Memberof`**

FunctionApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `functionCreateDTO?` | [`FunctionCreateDTO`](../interfaces/takaro_apiclient.FunctionCreateDTO.md) | FunctionCreateDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`FunctionOutputDTOAPI`](../interfaces/takaro_apiclient.FunctionOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:5311](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L5311)

___

### functionControllerGetOne

▸ **functionControllerGetOne**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`FunctionOutputDTOAPI`](../interfaces/takaro_apiclient.FunctionOutputDTOAPI.md), `any`\>\>

**`Summary`**

Get one

**`Throws`**

**`Memberof`**

FunctionApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`FunctionOutputDTOAPI`](../interfaces/takaro_apiclient.FunctionOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:5328](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L5328)

___

### functionControllerRemove

▸ **functionControllerRemove**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

**`Summary`**

Remove

**`Throws`**

**`Memberof`**

FunctionApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:5342](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L5342)

___

### functionControllerSearch

▸ **functionControllerSearch**(`functionSearchInputDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`FunctionOutputArrayDTOAPI`](../interfaces/takaro_apiclient.FunctionOutputArrayDTOAPI.md), `any`\>\>

**`Summary`**

Search

**`Throws`**

**`Memberof`**

FunctionApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `functionSearchInputDTO?` | [`FunctionSearchInputDTO`](../interfaces/takaro_apiclient.FunctionSearchInputDTO.md) | FunctionSearchInputDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`FunctionOutputArrayDTOAPI`](../interfaces/takaro_apiclient.FunctionOutputArrayDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:5356](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L5356)

___

### functionControllerUpdate

▸ **functionControllerUpdate**(`id`, `functionUpdateDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`FunctionOutputDTOAPI`](../interfaces/takaro_apiclient.FunctionOutputDTOAPI.md), `any`\>\>

**`Summary`**

Update

**`Throws`**

**`Memberof`**

FunctionApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `functionUpdateDTO?` | [`FunctionUpdateDTO`](../interfaces/takaro_apiclient.FunctionUpdateDTO.md) | FunctionUpdateDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`FunctionOutputDTOAPI`](../interfaces/takaro_apiclient.FunctionOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:5374](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L5374)
