---
id: "takaro_apiclient.UserApi"
title: "Class: UserApi"
sidebar_label: "@takaro/apiclient.UserApi"
custom_edit_url: null
---

[@takaro/apiclient](../modules/takaro_apiclient.md).UserApi

UserApi - object-oriented interface

**`Export`**

## Hierarchy

- `BaseAPI`

  ↳ **`UserApi`**

## Constructors

### constructor

• **new UserApi**(`configuration?`, `basePath?`, `axios?`)

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

### userControllerAssignRole

▸ **userControllerAssignRole**(`id`, `roleId`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

**`Summary`**

Assign role

**`Throws`**

**`Memberof`**

UserApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `roleId` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:9854](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L9854)

___

### userControllerCreate

▸ **userControllerCreate**(`userCreateInputDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`UserOutputDTOAPI`](../interfaces/takaro_apiclient.UserOutputDTOAPI.md), `any`\>\>

**`Summary`**

Create

**`Throws`**

**`Memberof`**

UserApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `userCreateInputDTO?` | [`UserCreateInputDTO`](../interfaces/takaro_apiclient.UserCreateInputDTO.md) | UserCreateInputDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`UserOutputDTOAPI`](../interfaces/takaro_apiclient.UserOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:9872](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L9872)

___

### userControllerGetOne

▸ **userControllerGetOne**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`UserOutputDTOAPI`](../interfaces/takaro_apiclient.UserOutputDTOAPI.md), `any`\>\>

**`Summary`**

Get one

**`Throws`**

**`Memberof`**

UserApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`UserOutputDTOAPI`](../interfaces/takaro_apiclient.UserOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:9889](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L9889)

___

### userControllerLogin

▸ **userControllerLogin**(`loginDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`LoginOutputDTOAPI`](../interfaces/takaro_apiclient.LoginOutputDTOAPI.md), `any`\>\>

**`Summary`**

Login

**`Throws`**

**`Memberof`**

UserApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `loginDTO?` | [`LoginDTO`](../interfaces/takaro_apiclient.LoginDTO.md) | LoginDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`LoginOutputDTOAPI`](../interfaces/takaro_apiclient.LoginOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:9903](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L9903)

___

### userControllerLogout

▸ **userControllerLogout**(`options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

**`Summary`**

Logout

**`Throws`**

**`Memberof`**

UserApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:9919](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L9919)

___

### userControllerMe

▸ **userControllerMe**(`options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`UserOutputDTOAPI`](../interfaces/takaro_apiclient.UserOutputDTOAPI.md), `any`\>\>

**`Summary`**

Me

**`Throws`**

**`Memberof`**

UserApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`UserOutputDTOAPI`](../interfaces/takaro_apiclient.UserOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:9932](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L9932)

___

### userControllerRemove

▸ **userControllerRemove**(`id`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

**`Summary`**

Remove

**`Throws`**

**`Memberof`**

UserApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:9946](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L9946)

___

### userControllerRemoveRole

▸ **userControllerRemoveRole**(`id`, `roleId`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

**`Summary`**

Remove role

**`Throws`**

**`Memberof`**

UserApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `roleId` | `string` |  |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`APIOutput`](../interfaces/takaro_apiclient.APIOutput.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:9961](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L9961)

___

### userControllerSearch

▸ **userControllerSearch**(`userSearchInputDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`UserOutputArrayDTOAPI`](../interfaces/takaro_apiclient.UserOutputArrayDTOAPI.md), `any`\>\>

**`Summary`**

Search

**`Throws`**

**`Memberof`**

UserApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `userSearchInputDTO?` | [`UserSearchInputDTO`](../interfaces/takaro_apiclient.UserSearchInputDTO.md) | UserSearchInputDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`UserOutputArrayDTOAPI`](../interfaces/takaro_apiclient.UserOutputArrayDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:9979](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L9979)

___

### userControllerUpdate

▸ **userControllerUpdate**(`id`, `userUpdateDTO?`, `options?`): `Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`UserOutputDTOAPI`](../interfaces/takaro_apiclient.UserOutputDTOAPI.md), `any`\>\>

**`Summary`**

Update

**`Throws`**

**`Memberof`**

UserApi

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` |  |
| `userUpdateDTO?` | [`UserUpdateDTO`](../interfaces/takaro_apiclient.UserUpdateDTO.md) | UserUpdateDTO |
| `options?` | `AxiosRequestConfig`<`any`\> | Override http request option. |

#### Returns

`Promise`<[`AxiosResponse`](../interfaces/takaro_apiclient.AxiosResponse.md)<[`UserOutputDTOAPI`](../interfaces/takaro_apiclient.UserOutputDTOAPI.md), `any`\>\>

#### Defined in

[packages/lib-apiclient/src/generated/api.ts:9997](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/generated/api.ts#L9997)
