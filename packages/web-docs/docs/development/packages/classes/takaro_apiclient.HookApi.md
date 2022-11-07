---
id: "takaro_apiclient.HookApi"
title: "Class: HookApi"
sidebar_label: "@takaro/apiclient.HookApi"
custom_edit_url: null
---

[@takaro/apiclient](../modules/takaro_apiclient.md).HookApi

HookApi - object-oriented interface

**`Export`**

## Hierarchy

- `BaseAPI`

  ↳ **`HookApi`**

## Constructors

### constructor

• **new HookApi**(`configuration?`, `basePath?`, `axios?`)

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

### hookControllerCreate

▸ **hookControllerCreate**(`hookCreateDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`HookOutputDTOAPI`](../interfaces/takaro_apiclient.HookOutputDTOAPI.md), `any`\>\>

**`Summary`**

Create

**`Throws`**

**`Memberof`**

HookApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hookCreateDTO?` | [`HookCreateDTO`](../interfaces/takaro_apiclient.HookCreateDTO.md) | HookCreateDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`HookOutputDTOAPI`](../interfaces/takaro_apiclient.HookOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:6709](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L6709)

___

### hookControllerGetOne

▸ **hookControllerGetOne**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`HookOutputDTOAPI`](../interfaces/takaro_apiclient.HookOutputDTOAPI.md), `any`\>\>

**`Summary`**

Get one

**`Throws`**

**`Memberof`**

HookApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`HookOutputDTOAPI`](../interfaces/takaro_apiclient.HookOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:6726](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L6726)

___

### hookControllerRemove

▸ **hookControllerRemove**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

**`Summary`**

Remove

**`Throws`**

**`Memberof`**

HookApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:6740](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L6740)

___

### hookControllerSearch

▸ **hookControllerSearch**(`hookSearchInputDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`HookOutputArrayDTOAPI`](../interfaces/takaro_apiclient.HookOutputArrayDTOAPI.md), `any`\>\>

**`Summary`**

Search

**`Throws`**

**`Memberof`**

HookApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hookSearchInputDTO?` | [`HookSearchInputDTO`](../interfaces/takaro_apiclient.HookSearchInputDTO.md) | HookSearchInputDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`HookOutputArrayDTOAPI`](../interfaces/takaro_apiclient.HookOutputArrayDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:6754](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L6754)

___

### hookControllerUpdate

▸ **hookControllerUpdate**(`id`, `hookUpdateDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`HookOutputDTOAPI`](../interfaces/takaro_apiclient.HookOutputDTOAPI.md), `any`\>\>

**`Summary`**

Update

**`Throws`**

**`Memberof`**

HookApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `hookUpdateDTO?` | [`HookUpdateDTO`](../interfaces/takaro_apiclient.HookUpdateDTO.md) | HookUpdateDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`HookOutputDTOAPI`](../interfaces/takaro_apiclient.HookOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:6772](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L6772)
