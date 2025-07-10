# GameServerApi

All URIs are relative to _http://localhost_

| Method                                                                                                  | HTTP request                                                   | Description                   |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------- |
| [**gameServerControllerBanPlayer**](#gameservercontrollerbanplayer)                                     | **POST** /gameserver/{gameServerId}/player/{playerId}/ban      | Ban player                    |
| [**gameServerControllerCreate**](#gameservercontrollercreate)                                           | **POST** /gameserver                                           | Create                        |
| [**gameServerControllerExecuteCommand**](#gameservercontrollerexecutecommand)                           | **POST** /gameserver/{id}/command                              | Execute command               |
| [**gameServerControllerGetImport**](#gameservercontrollergetimport)                                     | **GET** /gameserver/import/{id}                                | Get import                    |
| [**gameServerControllerGetJob**](#gameservercontrollergetjob)                                           | **GET** /gameserver/job/{type}/{id}                            | Get job                       |
| [**gameServerControllerGetMapInfo**](#gameservercontrollergetmapinfo)                                   | **GET** /gameserver/{id}/map/info                              | Get map info                  |
| [**gameServerControllerGetMapTile**](#gameservercontrollergetmaptile)                                   | **GET** /gameserver/{id}/map/tile/{x}/{y}/{z}                  | Get map tile                  |
| [**gameServerControllerGetOne**](#gameservercontrollergetone)                                           | **GET** /gameserver/{id}                                       | Get one                       |
| [**gameServerControllerGetPlayers**](#gameservercontrollergetplayers)                                   | **GET** /gameserver/{id}/players                               | Get players                   |
| [**gameServerControllerGetTypes**](#gameservercontrollergettypes)                                       | **GET** /gameserver/types                                      | Get types                     |
| [**gameServerControllerGiveItem**](#gameservercontrollergiveitem)                                       | **POST** /gameserver/{gameServerId}/player/{playerId}/giveItem | Give item                     |
| [**gameServerControllerImportFromCSMM**](#gameservercontrollerimportfromcsmm)                           | **POST** /gameserver/import                                    | Import from csmm              |
| [**gameServerControllerKickPlayer**](#gameservercontrollerkickplayer)                                   | **POST** /gameserver/{gameServerId}/player/{playerId}/kick     | Kick player                   |
| [**gameServerControllerListBans**](#gameservercontrollerlistbans)                                       | **GET** /gameserver/{id}/bans                                  | List bans                     |
| [**gameServerControllerRegenerateRegistrationToken**](#gameservercontrollerregenerateregistrationtoken) | **DELETE** /gameserver/registrationToken                       | Regenerate registration token |
| [**gameServerControllerRemove**](#gameservercontrollerremove)                                           | **DELETE** /gameserver/{id}                                    | Remove                        |
| [**gameServerControllerSearch**](#gameservercontrollersearch)                                           | **POST** /gameserver/search                                    | Search                        |
| [**gameServerControllerSendMessage**](#gameservercontrollersendmessage)                                 | **POST** /gameserver/{id}/message                              | Send message                  |
| [**gameServerControllerShutdown**](#gameservercontrollershutdown)                                       | **POST** /gameserver/{id}/shutdown                             | Shutdown                      |
| [**gameServerControllerTeleportPlayer**](#gameservercontrollerteleportplayer)                           | **POST** /gameserver/{gameServerId}/player/{playerId}/teleport | Teleport player               |
| [**gameServerControllerTestReachability**](#gameservercontrollertestreachability)                       | **POST** /gameserver/reachability                              | Test reachability             |
| [**gameServerControllerTestReachabilityForId**](#gameservercontrollertestreachabilityforid)             | **GET** /gameserver/{id}/reachability                          | Test reachability for id      |
| [**gameServerControllerTriggerJob**](#gameservercontrollertriggerjob)                                   | **POST** /gameserver/job/{type}/{id}                           | Trigger job                   |
| [**gameServerControllerUnbanPlayer**](#gameservercontrollerunbanplayer)                                 | **POST** /gameserver/{gameServerId}/player/{playerId}/unban    | Unban player                  |
| [**gameServerControllerUpdate**](#gameservercontrollerupdate)                                           | **PUT** /gameserver/{id}                                       | Update                        |

# **gameServerControllerBanPlayer**

> APIOutput gameServerControllerBanPlayer()

Ban a player from a gameserver. Requires gameserver to be online and reachable. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerBanPlayer`

### Example

```typescript
import { GameServerApi, Configuration, BanPlayerInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let gameServerId: string; // (default to undefined)
let playerId: string; // (default to undefined)
let banPlayerInputDTO: BanPlayerInputDTO; //BanPlayerInputDTO (optional)

const { status, data } = await apiInstance.gameServerControllerBanPlayer(gameServerId, playerId, banPlayerInputDTO);
```

### Parameters

| Name                  | Type                  | Description       | Notes                 |
| --------------------- | --------------------- | ----------------- | --------------------- |
| **banPlayerInputDTO** | **BanPlayerInputDTO** | BanPlayerInputDTO |                       |
| **gameServerId**      | [**string**]          |                   | defaults to undefined |
| **playerId**          | [**string**]          |                   | defaults to undefined |

### Return type

**APIOutput**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerCreate**

> GameServerOutputDTOAPI gameServerControllerCreate()

Create a gameserver Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerCreate`

### Example

```typescript
import { GameServerApi, Configuration, GameServerCreateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let gameServerCreateDTO: GameServerCreateDTO; //GameServerCreateDTO (optional)

const { status, data } = await apiInstance.gameServerControllerCreate(gameServerCreateDTO);
```

### Parameters

| Name                    | Type                    | Description         | Notes |
| ----------------------- | ----------------------- | ------------------- | ----- |
| **gameServerCreateDTO** | **GameServerCreateDTO** | GameServerCreateDTO |       |

### Return type

**GameServerOutputDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerExecuteCommand**

> CommandExecuteDTOAPI gameServerControllerExecuteCommand()

Execute a raw command on a gameserver. Requires gameserver to be online and reachable. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerExecuteCommand`

### Example

```typescript
import { GameServerApi, Configuration, CommandExecuteInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let id: string; // (default to undefined)
let commandExecuteInputDTO: CommandExecuteInputDTO; //CommandExecuteInputDTO (optional)

const { status, data } = await apiInstance.gameServerControllerExecuteCommand(id, commandExecuteInputDTO);
```

### Parameters

| Name                       | Type                       | Description            | Notes                 |
| -------------------------- | -------------------------- | ---------------------- | --------------------- |
| **commandExecuteInputDTO** | **CommandExecuteInputDTO** | CommandExecuteInputDTO |                       |
| **id**                     | [**string**]               |                        | defaults to undefined |

### Return type

**CommandExecuteDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerGetImport**

> JobStatusOutputDTOAPI gameServerControllerGetImport()

Fetch status of an import from CSMM Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerGetImport`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gameServerControllerGetImport(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**JobStatusOutputDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerGetJob**

> JobStatusOutputDTOAPI gameServerControllerGetJob()

Fetch a job status Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerGetJob`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let type: string; // (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.gameServerControllerGetJob(type, id);
```

### Parameters

| Name     | Type         | Description | Notes                 |
| -------- | ------------ | ----------- | --------------------- |
| **type** | [**string**] |             | defaults to undefined |
| **id**   | [**string**] |             | defaults to undefined |

### Return type

**JobStatusOutputDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerGetMapInfo**

> MapInfoOutputDTOAPI gameServerControllerGetMapInfo()

Get map metadata<br> OperationId: `GameServerControllerGetMapInfo`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gameServerControllerGetMapInfo(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**MapInfoOutputDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerGetMapTile**

> gameServerControllerGetMapTile()

Get a map tile<br> OperationId: `GameServerControllerGetMapTile`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let id: string; // (default to undefined)
let x: string; // (default to undefined)
let y: string; // (default to undefined)
let z: string; // (default to undefined)

const { status, data } = await apiInstance.gameServerControllerGetMapTile(id, x, y, z);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |
| **x**  | [**string**] |             | defaults to undefined |
| **y**  | [**string**] |             | defaults to undefined |
| **z**  | [**string**] |             | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerGetOne**

> GameServerOutputDTOAPI gameServerControllerGetOne()

Fetch a gameserver by id<br> OperationId: `GameServerControllerGetOne`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gameServerControllerGetOne(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**GameServerOutputDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerGetPlayers**

> PlayerOnGameserverOutputDTOAPI gameServerControllerGetPlayers()

Fetch a list of players on a gameserver. Requires gameserver to be online and reachable. Required permissions: `READ_PLAYERS`<br> OperationId: `GameServerControllerGetPlayers`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gameServerControllerGetPlayers(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**PlayerOnGameserverOutputDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerGetTypes**

> GameServerTypesOutputDTOAPI gameServerControllerGetTypes()

Fetch gameserver types (7dtd, Rust, ...)<br> OperationId: `GameServerControllerGetTypes`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

const { status, data } = await apiInstance.gameServerControllerGetTypes();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**GameServerTypesOutputDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerGiveItem**

> gameServerControllerGiveItem()

Give an item to a player. Accepts item UUID (preferred) or item code. Requires gameserver to be online and reachable. Depending on the underlying game implementation, it\'s possible that the item is dropped on the ground instead of placed directly in the player\'s inventory. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerGiveItem`

### Example

```typescript
import { GameServerApi, Configuration, GiveItemInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let gameServerId: string; // (default to undefined)
let playerId: string; // (default to undefined)
let giveItemInputDTO: GiveItemInputDTO; //GiveItemInputDTO (optional)

const { status, data } = await apiInstance.gameServerControllerGiveItem(gameServerId, playerId, giveItemInputDTO);
```

### Parameters

| Name                 | Type                 | Description      | Notes                 |
| -------------------- | -------------------- | ---------------- | --------------------- |
| **giveItemInputDTO** | **GiveItemInputDTO** | GiveItemInputDTO |                       |
| **gameServerId**     | [**string**]         |                  | defaults to undefined |
| **playerId**         | [**string**]         |                  | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerImportFromCSMM**

> ImportOutputDTOAPI gameServerControllerImportFromCSMM()

Import a gameserver from CSMM. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerImportFromCSMM`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

const { status, data } = await apiInstance.gameServerControllerImportFromCSMM();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**ImportOutputDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerKickPlayer**

> APIOutput gameServerControllerKickPlayer()

Kick a player from a gameserver. Requires gameserver to be online and reachable. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerKickPlayer`

### Example

```typescript
import { GameServerApi, Configuration, KickPlayerInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let gameServerId: string; // (default to undefined)
let playerId: string; // (default to undefined)
let kickPlayerInputDTO: KickPlayerInputDTO; //KickPlayerInputDTO (optional)

const { status, data } = await apiInstance.gameServerControllerKickPlayer(gameServerId, playerId, kickPlayerInputDTO);
```

### Parameters

| Name                   | Type                   | Description        | Notes                 |
| ---------------------- | ---------------------- | ------------------ | --------------------- |
| **kickPlayerInputDTO** | **KickPlayerInputDTO** | KickPlayerInputDTO |                       |
| **gameServerId**       | [**string**]           |                    | defaults to undefined |
| **playerId**           | [**string**]           |                    | defaults to undefined |

### Return type

**APIOutput**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerListBans**

> BanPlayerOutputDTO gameServerControllerListBans()

List bans for a gameserver. Requires gameserver to be online and reachable. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerListBans`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gameServerControllerListBans(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**BanPlayerOutputDTO**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerRegenerateRegistrationToken**

> APIOutput gameServerControllerRegenerateRegistrationToken()

Regenerate the registration token for a gameserver. Careful, this will invalidate all existing connections. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerRegenerateRegistrationToken`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

const { status, data } = await apiInstance.gameServerControllerRegenerateRegistrationToken();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**APIOutput**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerRemove**

> APIOutput gameServerControllerRemove()

Delete a gameserver Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerRemove`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gameServerControllerRemove(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**APIOutput**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerSearch**

> GameServerOutputArrayDTOAPI gameServerControllerSearch()

Fetch gameservers<br> OperationId: `GameServerControllerSearch`

### Example

```typescript
import { GameServerApi, Configuration, GameServerSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let gameServerSearchInputDTO: GameServerSearchInputDTO; //GameServerSearchInputDTO (optional)

const { status, data } = await apiInstance.gameServerControllerSearch(gameServerSearchInputDTO);
```

### Parameters

| Name                         | Type                         | Description              | Notes |
| ---------------------------- | ---------------------------- | ------------------------ | ----- |
| **gameServerSearchInputDTO** | **GameServerSearchInputDTO** | GameServerSearchInputDTO |       |

### Return type

**GameServerOutputArrayDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerSendMessage**

> APIOutput gameServerControllerSendMessage()

Send a message in gameserver chat. Requires gameserver to be online and reachable. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerSendMessage`

### Example

```typescript
import { GameServerApi, Configuration, MessageSendInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let id: string; // (default to undefined)
let messageSendInputDTO: MessageSendInputDTO; //MessageSendInputDTO (optional)

const { status, data } = await apiInstance.gameServerControllerSendMessage(id, messageSendInputDTO);
```

### Parameters

| Name                    | Type                    | Description         | Notes                 |
| ----------------------- | ----------------------- | ------------------- | --------------------- |
| **messageSendInputDTO** | **MessageSendInputDTO** | MessageSendInputDTO |                       |
| **id**                  | [**string**]            |                     | defaults to undefined |

### Return type

**APIOutput**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerShutdown**

> gameServerControllerShutdown()

Shuts down the gameserver. This is a \'soft\' shutdown, meaning the gameserver will be stopped gracefully. If the gameserver is not reachable, this will have no effect. Note that most hosting providers will automatically restart the gameserver after a shutdown, which makes this operation act as a \'restart\' instead. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerShutdown`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gameServerControllerShutdown(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerTeleportPlayer**

> APIOutput gameServerControllerTeleportPlayer()

Teleport a player to a location. Requires gameserver to be online and reachable. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerTeleportPlayer`

### Example

```typescript
import { GameServerApi, Configuration, TeleportPlayerInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let gameServerId: string; // (default to undefined)
let playerId: string; // (default to undefined)
let teleportPlayerInputDTO: TeleportPlayerInputDTO; //TeleportPlayerInputDTO (optional)

const { status, data } = await apiInstance.gameServerControllerTeleportPlayer(
  gameServerId,
  playerId,
  teleportPlayerInputDTO,
);
```

### Parameters

| Name                       | Type                       | Description            | Notes                 |
| -------------------------- | -------------------------- | ---------------------- | --------------------- |
| **teleportPlayerInputDTO** | **TeleportPlayerInputDTO** | TeleportPlayerInputDTO |                       |
| **gameServerId**           | [**string**]               |                        | defaults to undefined |
| **playerId**               | [**string**]               |                        | defaults to undefined |

### Return type

**APIOutput**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerTestReachability**

> GameServerTestReachabilityDTOAPI gameServerControllerTestReachability()

Test if Takaro can connect to a gameserver. Will do a thorough check and report details.<br> OperationId: `GameServerControllerTestReachability`

### Example

```typescript
import { GameServerApi, Configuration, GameServerTestReachabilityInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let gameServerTestReachabilityInputDTO: GameServerTestReachabilityInputDTO; //GameServerTestReachabilityInputDTO (optional)

const { status, data } = await apiInstance.gameServerControllerTestReachability(gameServerTestReachabilityInputDTO);
```

### Parameters

| Name                                   | Type                                   | Description                        | Notes |
| -------------------------------------- | -------------------------------------- | ---------------------------------- | ----- |
| **gameServerTestReachabilityInputDTO** | **GameServerTestReachabilityInputDTO** | GameServerTestReachabilityInputDTO |       |

### Return type

**GameServerTestReachabilityDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerTestReachabilityForId**

> GameServerTestReachabilityDTOAPI gameServerControllerTestReachabilityForId()

Test if Takaro can connect to a gameserver. Will do a thorough check and report details.<br> OperationId: `GameServerControllerTestReachabilityForId`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gameServerControllerTestReachabilityForId(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**GameServerTestReachabilityDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerTriggerJob**

> JobStatusOutputDTOAPI gameServerControllerTriggerJob()

Manually trigger a job, you can poll the status with the GET endpoint Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerTriggerJob`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let type: string; // (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.gameServerControllerTriggerJob(type, id);
```

### Parameters

| Name     | Type         | Description | Notes                 |
| -------- | ------------ | ----------- | --------------------- |
| **type** | [**string**] |             | defaults to undefined |
| **id**   | [**string**] |             | defaults to undefined |

### Return type

**JobStatusOutputDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerUnbanPlayer**

> APIOutput gameServerControllerUnbanPlayer()

Unban a player from a gameserver. Requires gameserver to be online and reachable. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerUnbanPlayer`

### Example

```typescript
import { GameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let gameServerId: string; // (default to undefined)
let playerId: string; // (default to undefined)

const { status, data } = await apiInstance.gameServerControllerUnbanPlayer(gameServerId, playerId);
```

### Parameters

| Name             | Type         | Description | Notes                 |
| ---------------- | ------------ | ----------- | --------------------- |
| **gameServerId** | [**string**] |             | defaults to undefined |
| **playerId**     | [**string**] |             | defaults to undefined |

### Return type

**APIOutput**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameServerControllerUpdate**

> GameServerOutputDTOAPI gameServerControllerUpdate()

Update a gameserver Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `GameServerControllerUpdate`

### Example

```typescript
import { GameServerApi, Configuration, GameServerUpdateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new GameServerApi(configuration);

let id: string; // (default to undefined)
let gameServerUpdateDTO: GameServerUpdateDTO; //GameServerUpdateDTO (optional)

const { status, data } = await apiInstance.gameServerControllerUpdate(id, gameServerUpdateDTO);
```

### Parameters

| Name                    | Type                    | Description         | Notes                 |
| ----------------------- | ----------------------- | ------------------- | --------------------- |
| **gameServerUpdateDTO** | **GameServerUpdateDTO** | GameServerUpdateDTO |                       |
| **id**                  | [**string**]            |                     | defaults to undefined |

### Return type

**GameServerOutputDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
