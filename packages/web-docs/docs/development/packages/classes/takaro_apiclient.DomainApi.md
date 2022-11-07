---
id: "takaro_apiclient.DomainApi"
title: "Class: DomainApi"
sidebar_label: "@takaro/apiclient.DomainApi"
custom_edit_url: null
---

[@takaro/apiclient](../modules/takaro_apiclient.md).DomainApi

DomainApi - object-oriented interface

**`Export`**

## Hierarchy

- `BaseAPI`

  ↳ **`DomainApi`**

## Constructors

### constructor

• **new DomainApi**(`configuration?`, `basePath?`, `axios?`)

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

### domainControllerCreate

▸ **domainControllerCreate**(`body?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`DomainCreateOutputDTOAPI`](../interfaces/takaro_apiclient.DomainCreateOutputDTOAPI.md), `any`\>\>

**`Summary`**

Create

**`Throws`**

**`Memberof`**

DomainApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `body?` | `any` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`DomainCreateOutputDTOAPI`](../interfaces/takaro_apiclient.DomainCreateOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:4726](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L4726)

___

### domainControllerGetOne

▸ **domainControllerGetOne**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`DomainOutputDTOAPI`](../interfaces/takaro_apiclient.DomainOutputDTOAPI.md), `any`\>\>

**`Summary`**

Get one

**`Throws`**

**`Memberof`**

DomainApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`DomainOutputDTOAPI`](../interfaces/takaro_apiclient.DomainOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:4740](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L4740)

___

### domainControllerRemove

▸ **domainControllerRemove**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

**`Summary`**

Remove

**`Throws`**

**`Memberof`**

DomainApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:4754](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L4754)

___

### domainControllerSearch

▸ **domainControllerSearch**(`domainSearchInputDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`DomainOutputArrayDTOAPI`](../interfaces/takaro_apiclient.DomainOutputArrayDTOAPI.md), `any`\>\>

**`Summary`**

Search

**`Throws`**

**`Memberof`**

DomainApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `domainSearchInputDTO?` | [`DomainSearchInputDTO`](../interfaces/takaro_apiclient.DomainSearchInputDTO.md) | DomainSearchInputDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`DomainOutputArrayDTOAPI`](../interfaces/takaro_apiclient.DomainOutputArrayDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:4768](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L4768)

___

### domainControllerUpdate

▸ **domainControllerUpdate**(`id`, `domainUpdateInputDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`DomainOutputDTOAPI`](../interfaces/takaro_apiclient.DomainOutputDTOAPI.md), `any`\>\>

**`Summary`**

Update

**`Throws`**

**`Memberof`**

DomainApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `domainUpdateInputDTO?` | [`DomainUpdateInputDTO`](../interfaces/takaro_apiclient.DomainUpdateInputDTO.md) | DomainUpdateInputDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`DomainOutputDTOAPI`](../interfaces/takaro_apiclient.DomainOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:4786](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L4786)
