---
id: "takaro_apiclient.SettingsApi"
title: "Class: SettingsApi"
sidebar_label: "@takaro/apiclient.SettingsApi"
custom_edit_url: null
---

[@takaro/apiclient](../modules/takaro_apiclient.md).SettingsApi

SettingsApi - object-oriented interface

**`Export`**

## Hierarchy

- `BaseAPI`

  ↳ **`SettingsApi`**

## Constructors

### constructor

• **new SettingsApi**(`configuration?`, `basePath?`, `axios?`)

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

### settingsControllerGet

▸ **settingsControllerGet**(`keys?`, `gameServerId?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`SettingsOutputObjectDTOAPI`](../interfaces/takaro_apiclient.SettingsOutputObjectDTOAPI.md), `any`\>\>

**`Summary`**

Get

**`Throws`**

**`Memberof`**

SettingsApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `keys?` | (``"commandPrefix"`` \| ``"serverChatName"``)[] |  |
| `gameServerId?` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`SettingsOutputObjectDTOAPI`](../interfaces/takaro_apiclient.SettingsOutputObjectDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:8864](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L8864)

___

### settingsControllerGetOne

▸ **settingsControllerGetOne**(`key`, `gameServerId?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`SettingsOutputDTOAPI`](../interfaces/takaro_apiclient.SettingsOutputDTOAPI.md), `any`\>\>

**`Summary`**

Get one

**`Throws`**

**`Memberof`**

SettingsApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` |  |
| `gameServerId?` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`SettingsOutputDTOAPI`](../interfaces/takaro_apiclient.SettingsOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:8883](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L8883)

___

### settingsControllerSet

▸ **settingsControllerSet**(`key`, `settingsSetDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`SettingsOutputDTOAPI`](../interfaces/takaro_apiclient.SettingsOutputDTOAPI.md), `any`\>\>

**`Summary`**

Set

**`Throws`**

**`Memberof`**

SettingsApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` |  |
| `settingsSetDTO?` | [`SettingsSetDTO`](../interfaces/takaro_apiclient.SettingsSetDTO.md) | SettingsSetDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`SettingsOutputDTOAPI`](../interfaces/takaro_apiclient.SettingsOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:8902](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L8902)
