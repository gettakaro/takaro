# DiscordApi

All URIs are relative to _http://localhost_

| Method                                                            | HTTP request                            | Description  |
| ----------------------------------------------------------------- | --------------------------------------- | ------------ |
| [**discordControllerGetInvite**](#discordcontrollergetinvite)     | **GET** /discord/invite                 | Get invite   |
| [**discordControllerSearch**](#discordcontrollersearch)           | **POST** /discord/guilds/search         | Search       |
| [**discordControllerSendMessage**](#discordcontrollersendmessage) | **POST** /discord/channels/{id}/message | Send message |
| [**discordControllerUpdateGuild**](#discordcontrollerupdateguild) | **PUT** /discord/guilds/{id}            | Update guild |

# **discordControllerGetInvite**

> DiscordInviteOutputDTO discordControllerGetInvite()

<br> OperationId: `DiscordControllerGetInvite`

### Example

```typescript
import { DiscordApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new DiscordApi(configuration);

const { status, data } = await apiInstance.discordControllerGetInvite();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**DiscordInviteOutputDTO**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **discordControllerSearch**

> GuildOutputArrayDTOAPI discordControllerSearch()

<br> OperationId: `DiscordControllerSearch`

### Example

```typescript
import { DiscordApi, Configuration, GuildSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new DiscordApi(configuration);

let guildSearchInputDTO: GuildSearchInputDTO; //GuildSearchInputDTO (optional)

const { status, data } = await apiInstance.discordControllerSearch(guildSearchInputDTO);
```

### Parameters

| Name                    | Type                    | Description         | Notes |
| ----------------------- | ----------------------- | ------------------- | ----- |
| **guildSearchInputDTO** | **GuildSearchInputDTO** | GuildSearchInputDTO |       |

### Return type

**GuildOutputArrayDTOAPI**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **discordControllerSendMessage**

> APIOutput discordControllerSendMessage()

<br> OperationId: `DiscordControllerSendMessage`

### Example

```typescript
import { DiscordApi, Configuration, SendMessageInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new DiscordApi(configuration);

let id: string; // (default to undefined)
let sendMessageInputDTO: SendMessageInputDTO; //SendMessageInputDTO (optional)

const { status, data } = await apiInstance.discordControllerSendMessage(id, sendMessageInputDTO);
```

### Parameters

| Name                    | Type                    | Description         | Notes                 |
| ----------------------- | ----------------------- | ------------------- | --------------------- |
| **sendMessageInputDTO** | **SendMessageInputDTO** | SendMessageInputDTO |                       |
| **id**                  | [**string**]            |                     | defaults to undefined |

### Return type

**APIOutput**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **discordControllerUpdateGuild**

> GuildOutputDTOAPI discordControllerUpdateGuild()

<br> OperationId: `DiscordControllerUpdateGuild`

### Example

```typescript
import { DiscordApi, Configuration, GuildApiUpdateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new DiscordApi(configuration);

let id: string; // (default to undefined)
let guildApiUpdateDTO: GuildApiUpdateDTO; //GuildApiUpdateDTO (optional)

const { status, data } = await apiInstance.discordControllerUpdateGuild(id, guildApiUpdateDTO);
```

### Parameters

| Name                  | Type                  | Description       | Notes                 |
| --------------------- | --------------------- | ----------------- | --------------------- |
| **guildApiUpdateDTO** | **GuildApiUpdateDTO** | GuildApiUpdateDTO |                       |
| **id**                | [**string**]          |                   | defaults to undefined |

### Return type

**GuildOutputDTOAPI**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
