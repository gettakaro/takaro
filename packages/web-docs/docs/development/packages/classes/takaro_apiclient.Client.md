---
id: "takaro_apiclient.Client"
title: "Class: Client"
sidebar_label: "@takaro/apiclient.Client"
custom_edit_url: null
---

[@takaro/apiclient](../modules/takaro_apiclient.md).Client

## Hierarchy

- `BaseApiClient`

  ↳ **`Client`**

## Constructors

### constructor

• **new Client**(`config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `IApiClientConfig` |

#### Overrides

BaseApiClient.constructor

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:16](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L16)

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

### command

• `get` **command**(): [`CommandApi`](takaro_apiclient.CommandApi.md)

#### Returns

[`CommandApi`](takaro_apiclient.CommandApi.md)

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:121](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L121)

___

### cronjob

• `get` **cronjob**(): [`CronJobApi`](takaro_apiclient.CronJobApi.md)

#### Returns

[`CronJobApi`](takaro_apiclient.CronJobApi.md)

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:81](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L81)

___

### function

• `get` **function**(): [`FunctionApi`](takaro_apiclient.FunctionApi.md)

#### Returns

[`FunctionApi`](takaro_apiclient.FunctionApi.md)

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:91](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L91)

___

### gameserver

• `get` **gameserver**(): [`GameServerApi`](takaro_apiclient.GameServerApi.md)

#### Returns

[`GameServerApi`](takaro_apiclient.GameServerApi.md)

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:71](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L71)

___

### hook

• `get` **hook**(): [`HookApi`](takaro_apiclient.HookApi.md)

#### Returns

[`HookApi`](takaro_apiclient.HookApi.md)

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:111](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L111)

___

### meta

• `get` **meta**(): [`MetaApi`](takaro_apiclient.MetaApi.md)

#### Returns

[`MetaApi`](takaro_apiclient.MetaApi.md)

#### Inherited from

BaseApiClient.meta

#### Defined in

[packages/lib-apiclient/src/lib/baseClient.ts:143](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/baseClient.ts#L143)

___

### module

• `get` **module**(): [`ModuleApi`](takaro_apiclient.ModuleApi.md)

#### Returns

[`ModuleApi`](takaro_apiclient.ModuleApi.md)

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:101](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L101)

___

### password

• `set` **password**(`password`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `password` | `string` |

#### Returns

`void`

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:24](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L24)

___

### player

• `get` **player**(): [`PlayerApi`](takaro_apiclient.PlayerApi.md)

#### Returns

[`PlayerApi`](takaro_apiclient.PlayerApi.md)

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:131](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L131)

___

### role

• `get` **role**(): [`RoleApi`](takaro_apiclient.RoleApi.md)

#### Returns

[`RoleApi`](takaro_apiclient.RoleApi.md)

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:61](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L61)

___

### settings

• `get` **settings**(): [`SettingsApi`](takaro_apiclient.SettingsApi.md)

#### Returns

[`SettingsApi`](takaro_apiclient.SettingsApi.md)

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:141](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L141)

___

### token

• `set` **token**(`token`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | `string` |

#### Returns

`void`

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:28](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L28)

___

### user

• `get` **user**(): [`UserApi`](takaro_apiclient.UserApi.md)

#### Returns

[`UserApi`](takaro_apiclient.UserApi.md)

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:51](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L51)

___

### username

• `set` **username**(`username`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `username` | `string` |

#### Returns

`void`

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:20](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L20)

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

### login

▸ **login**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:32](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L32)

___

### logout

▸ **logout**(): `void`

#### Returns

`void`

#### Defined in

[packages/lib-apiclient/src/lib/client.ts:47](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-apiclient/src/lib/client.ts#L47)

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
