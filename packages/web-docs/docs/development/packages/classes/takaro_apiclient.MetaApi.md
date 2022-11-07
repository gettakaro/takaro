---
id: "takaro_apiclient.MetaApi"
title: "Class: MetaApi"
sidebar_label: "@takaro/apiclient.MetaApi"
custom_edit_url: null
---

[@takaro/apiclient](../modules/takaro_apiclient.md).MetaApi

MetaApi - object-oriented interface

**`Export`**

## Hierarchy

- `BaseAPI`

  ↳ **`MetaApi`**

## Constructors

### constructor

• **new MetaApi**(`configuration?`, `basePath?`, `axios?`)

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

### metaGetHealth

▸ **metaGetHealth**(`options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`HealthOutputDTO`](../interfaces/takaro_apiclient.HealthOutputDTO.md), `any`\>\>

**`Summary`**

Get health

**`Throws`**

**`Memberof`**

MetaApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`HealthOutputDTO`](../interfaces/takaro_apiclient.HealthOutputDTO.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:7047](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L7047)

___

### metaGetOpenApi

▸ **metaGetOpenApi**(`options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<`void`, `any`\>\>

**`Summary`**

Get open api

**`Throws`**

**`Memberof`**

MetaApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<`void`, `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:7060](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L7060)

___

### metaGetOpenApiHtml

▸ **metaGetOpenApiHtml**(`options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<`void`, `any`\>\>

**`Summary`**

Get open api html

**`Throws`**

**`Memberof`**

MetaApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<`void`, `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:7073](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L7073)
