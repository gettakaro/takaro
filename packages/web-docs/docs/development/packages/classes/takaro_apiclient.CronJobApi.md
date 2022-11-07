---
id: "takaro_apiclient.CronJobApi"
title: "Class: CronJobApi"
sidebar_label: "@takaro/apiclient.CronJobApi"
custom_edit_url: null
---

[@takaro/apiclient](../modules/takaro_apiclient.md).CronJobApi

CronJobApi - object-oriented interface

**`Export`**

## Hierarchy

- `BaseAPI`

  ↳ **`CronJobApi`**

## Constructors

### constructor

• **new CronJobApi**(`configuration?`, `basePath?`, `axios?`)

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

### cronJobControllerCreate

▸ **cronJobControllerCreate**(`cronJobCreateDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`CronJobOutputDTOAPI`](../interfaces/takaro_apiclient.CronJobOutputDTOAPI.md), `any`\>\>

**`Summary`**

Create

**`Throws`**

**`Memberof`**

CronJobApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cronJobCreateDTO?` | [`CronJobCreateDTO`](../interfaces/takaro_apiclient.CronJobCreateDTO.md) | CronJobCreateDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`CronJobOutputDTOAPI`](../interfaces/takaro_apiclient.CronJobOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:4134](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L4134)

___

### cronJobControllerGetOne

▸ **cronJobControllerGetOne**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`CronJobOutputDTOAPI`](../interfaces/takaro_apiclient.CronJobOutputDTOAPI.md), `any`\>\>

**`Summary`**

Get one

**`Throws`**

**`Memberof`**

CronJobApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`CronJobOutputDTOAPI`](../interfaces/takaro_apiclient.CronJobOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:4151](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L4151)

___

### cronJobControllerRemove

▸ **cronJobControllerRemove**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

**`Summary`**

Remove

**`Throws`**

**`Memberof`**

CronJobApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:4165](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L4165)

___

### cronJobControllerSearch

▸ **cronJobControllerSearch**(`cronJobSearchInputDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`CronJobOutputArrayDTOAPI`](../interfaces/takaro_apiclient.CronJobOutputArrayDTOAPI.md), `any`\>\>

**`Summary`**

Search

**`Throws`**

**`Memberof`**

CronJobApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cronJobSearchInputDTO?` | [`CronJobSearchInputDTO`](../interfaces/takaro_apiclient.CronJobSearchInputDTO.md) | CronJobSearchInputDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`CronJobOutputArrayDTOAPI`](../interfaces/takaro_apiclient.CronJobOutputArrayDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:4179](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L4179)

___

### cronJobControllerUpdate

▸ **cronJobControllerUpdate**(`id`, `cronJobUpdateDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`CronJobOutputDTOAPI`](../interfaces/takaro_apiclient.CronJobOutputDTOAPI.md), `any`\>\>

**`Summary`**

Update

**`Throws`**

**`Memberof`**

CronJobApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `cronJobUpdateDTO?` | [`CronJobUpdateDTO`](../interfaces/takaro_apiclient.CronJobUpdateDTO.md) | CronJobUpdateDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`CronJobOutputDTOAPI`](../interfaces/takaro_apiclient.CronJobOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:4197](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L4197)
