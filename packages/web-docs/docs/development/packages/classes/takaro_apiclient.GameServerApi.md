---
id: "takaro_apiclient.GameServerApi"
title: "Class: GameServerApi"
sidebar_label: "@takaro/apiclient.GameServerApi"
custom_edit_url: null
---

[@takaro/apiclient](../modules/takaro_apiclient.md).GameServerApi

GameServerApi - object-oriented interface

**`Export`**

## Hierarchy

- `BaseAPI`

  ↳ **`GameServerApi`**

## Constructors

### constructor

• **new GameServerApi**(`configuration?`, `basePath?`, `axios?`)

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

### gameServerControllerCreate

▸ **gameServerControllerCreate**(`gameServerCreateDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`GameServerOutputDTOAPI`](../interfaces/takaro_apiclient.GameServerOutputDTOAPI.md), `any`\>\>

**`Summary`**

Create

**`Throws`**

**`Memberof`**

GameServerApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `gameServerCreateDTO?` | [`GameServerCreateDTO`](../interfaces/takaro_apiclient.GameServerCreateDTO.md) | GameServerCreateDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`GameServerOutputDTOAPI`](../interfaces/takaro_apiclient.GameServerOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:6087](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L6087)

___

### gameServerControllerGetOne

▸ **gameServerControllerGetOne**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`GameServerOutputDTOAPI`](../interfaces/takaro_apiclient.GameServerOutputDTOAPI.md), `any`\>\>

**`Summary`**

Get one

**`Throws`**

**`Memberof`**

GameServerApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`GameServerOutputDTOAPI`](../interfaces/takaro_apiclient.GameServerOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:6104](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L6104)

___

### gameServerControllerRemove

▸ **gameServerControllerRemove**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

**`Summary`**

Remove

**`Throws`**

**`Memberof`**

GameServerApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:6118](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L6118)

___

### gameServerControllerSearch

▸ **gameServerControllerSearch**(`gameServerSearchInputDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`GameServerOutputArrayDTOAPI`](../interfaces/takaro_apiclient.GameServerOutputArrayDTOAPI.md), `any`\>\>

**`Summary`**

Search

**`Throws`**

**`Memberof`**

GameServerApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `gameServerSearchInputDTO?` | [`GameServerSearchInputDTO`](../interfaces/takaro_apiclient.GameServerSearchInputDTO.md) | GameServerSearchInputDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`GameServerOutputArrayDTOAPI`](../interfaces/takaro_apiclient.GameServerOutputArrayDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:6132](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L6132)

___

### gameServerControllerTestReachability

▸ **gameServerControllerTestReachability**(`gameServerTestReachabilityInputDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`GameServerTestReachabilityDTOAPI`](../interfaces/takaro_apiclient.GameServerTestReachabilityDTOAPI.md), `any`\>\>

**`Summary`**

Test reachability

**`Throws`**

**`Memberof`**

GameServerApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `gameServerTestReachabilityInputDTO?` | [`GameServerTestReachabilityInputDTO`](../interfaces/takaro_apiclient.GameServerTestReachabilityInputDTO.md) | GameServerTestReachabilityInputDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`GameServerTestReachabilityDTOAPI`](../interfaces/takaro_apiclient.GameServerTestReachabilityDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:6149](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L6149)

___

### gameServerControllerTestReachabilityForId

▸ **gameServerControllerTestReachabilityForId**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`GameServerTestReachabilityDTOAPI`](../interfaces/takaro_apiclient.GameServerTestReachabilityDTOAPI.md), `any`\>\>

**`Summary`**

Test reachability for id

**`Throws`**

**`Memberof`**

GameServerApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`GameServerTestReachabilityDTOAPI`](../interfaces/takaro_apiclient.GameServerTestReachabilityDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:6169](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L6169)

___

### gameServerControllerUpdate

▸ **gameServerControllerUpdate**(`id`, `gameServerUpdateDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`GameServerOutputDTOAPI`](../interfaces/takaro_apiclient.GameServerOutputDTOAPI.md), `any`\>\>

**`Summary`**

Update

**`Throws`**

**`Memberof`**

GameServerApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `gameServerUpdateDTO?` | [`GameServerUpdateDTO`](../interfaces/takaro_apiclient.GameServerUpdateDTO.md) | GameServerUpdateDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`GameServerOutputDTOAPI`](../interfaces/takaro_apiclient.GameServerOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:6187](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L6187)
