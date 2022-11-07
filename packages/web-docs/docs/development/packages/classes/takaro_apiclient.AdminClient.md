---
id: "takaro_apiclient.AdminClient"
title: "Class: AdminClient"
sidebar_label: "@takaro/apiclient.AdminClient"
custom_edit_url: null
---

[@takaro/apiclient](../modules/takaro_apiclient.md).AdminClient

## Hierarchy

- `BaseApiClient`

  ↳ **`AdminClient`**

## Constructors

### constructor

• **new AdminClient**(`config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `IApiClientConfig` |

#### Overrides

BaseApiClient.constructor

#### Defined in

[packages/lib-apiclient/src/lib/adminClient.ts:5](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/adminClient.ts#L5)

## Properties

### axios

• `Protected` **axios**: `AxiosInstance`

#### Inherited from

BaseApiClient.axios

#### Defined in

[packages/lib-apiclient/src/lib/baseClient.ts:26](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/baseClient.ts#L26)

___

### config

• `Protected` `Readonly` **config**: `IApiClientConfig`

#### Inherited from

BaseApiClient.config

#### Defined in

[packages/lib-apiclient/src/lib/baseClient.ts:34](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/baseClient.ts#L34)

___

### log

• `Protected` **log**: `Logger`

#### Inherited from

BaseApiClient.log

#### Defined in

[packages/lib-apiclient/src/lib/baseClient.ts:27](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/baseClient.ts#L27)

## Accessors

### domain

• `get` **domain**(): [`DomainApi`](takaro_apiclient.DomainApi.md)

#### Returns

[`DomainApi`](takaro_apiclient.DomainApi.md)

#### Defined in

[packages/lib-apiclient/src/lib/adminClient.ts:9](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/adminClient.ts#L9)

___

### meta

• `get` **meta**(): [`MetaApi`](takaro_apiclient.MetaApi.md)

#### Returns

[`MetaApi`](takaro_apiclient.MetaApi.md)

#### Inherited from

BaseApiClient.meta

#### Defined in

[packages/lib-apiclient/src/lib/baseClient.ts:143](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/baseClient.ts#L143)

## Methods

### isJsonMime

▸ **isJsonMime**(`mime`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `mime` | `string` |

#### Returns

`boolean`

#### Inherited from

BaseApiClient.isJsonMime

#### Defined in

[packages/lib-apiclient/src/lib/baseClient.ts:50](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/baseClient.ts#L50)

___

### waitUntilHealthy

▸ **waitUntilHealthy**(`timeout?`): `Promise`<`void`\>

Wait until the API reports that it is healthy

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `timeout` | `number` | `600000` | in milliseconds |

#### Returns

`Promise`<`void`\>

#### Inherited from

BaseApiClient.waitUntilHealthy

#### Defined in

[packages/lib-apiclient/src/lib/baseClient.ts:123](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/baseClient.ts#L123)
