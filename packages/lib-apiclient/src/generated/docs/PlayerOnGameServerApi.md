# PlayerOnGameServerApi

All URIs are relative to _http://localhost_

| Method                                                                                                        | HTTP request                                                            | Description              |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------ |
| [**playerOnGameServerControllerAddCurrency**](#playerongameservercontrolleraddcurrency)                       | **POST** /gameserver/{gameServerId}/player/{playerId}/add-currency      | Add currency             |
| [**playerOnGameServerControllerDeductCurrency**](#playerongameservercontrollerdeductcurrency)                 | **POST** /gameserver/{gameServerId}/player/{playerId}/deduct-currency   | Deduct currency          |
| [**playerOnGameServerControllerGetOne**](#playerongameservercontrollergetone)                                 | **GET** /gameserver/{gameServerId}/player/{playerId}                    | Get one                  |
| [**playerOnGameServerControllerSearch**](#playerongameservercontrollersearch)                                 | **POST** /gameserver/player/search                                      | Search                   |
| [**playerOnGameServerControllerSetCurrency**](#playerongameservercontrollersetcurrency)                       | **POST** /gameserver/{gameServerId}/player/{playerId}/currency          | Set currency             |
| [**playerOnGameServerControllerTransactBetweenPlayers**](#playerongameservercontrollertransactbetweenplayers) | **POST** /gameserver/{gameServerId}/player/{sender}/{receiver}/transfer | Transact between players |

# **playerOnGameServerControllerAddCurrency**

> PlayerOnGameserverOutputDTOAPI playerOnGameServerControllerAddCurrency()

Required permissions: `MANAGE_PLAYERS`<br> OperationId: `PlayerOnGameServerControllerAddCurrency`

### Example

```typescript
import { PlayerOnGameServerApi, Configuration, PlayerOnGameServerSetCurrencyInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new PlayerOnGameServerApi(configuration);

let gameServerId: string; // (default to undefined)
let playerId: string; // (default to undefined)
let playerOnGameServerSetCurrencyInputDTO: PlayerOnGameServerSetCurrencyInputDTO; //PlayerOnGameServerSetCurrencyInputDTO (optional)

const { status, data } = await apiInstance.playerOnGameServerControllerAddCurrency(
  gameServerId,
  playerId,
  playerOnGameServerSetCurrencyInputDTO,
);
```

### Parameters

| Name                                      | Type                                      | Description                           | Notes                 |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------- | --------------------- |
| **playerOnGameServerSetCurrencyInputDTO** | **PlayerOnGameServerSetCurrencyInputDTO** | PlayerOnGameServerSetCurrencyInputDTO |                       |
| **gameServerId**                          | [**string**]                              |                                       | defaults to undefined |
| **playerId**                              | [**string**]                              |                                       | defaults to undefined |

### Return type

**PlayerOnGameserverOutputDTOAPI**

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

# **playerOnGameServerControllerDeductCurrency**

> PlayerOnGameserverOutputDTOAPI playerOnGameServerControllerDeductCurrency()

Required permissions: `MANAGE_PLAYERS`<br> OperationId: `PlayerOnGameServerControllerDeductCurrency`

### Example

```typescript
import { PlayerOnGameServerApi, Configuration, PlayerOnGameServerSetCurrencyInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new PlayerOnGameServerApi(configuration);

let gameServerId: string; // (default to undefined)
let playerId: string; // (default to undefined)
let playerOnGameServerSetCurrencyInputDTO: PlayerOnGameServerSetCurrencyInputDTO; //PlayerOnGameServerSetCurrencyInputDTO (optional)

const { status, data } = await apiInstance.playerOnGameServerControllerDeductCurrency(
  gameServerId,
  playerId,
  playerOnGameServerSetCurrencyInputDTO,
);
```

### Parameters

| Name                                      | Type                                      | Description                           | Notes                 |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------- | --------------------- |
| **playerOnGameServerSetCurrencyInputDTO** | **PlayerOnGameServerSetCurrencyInputDTO** | PlayerOnGameServerSetCurrencyInputDTO |                       |
| **gameServerId**                          | [**string**]                              |                                       | defaults to undefined |
| **playerId**                              | [**string**]                              |                                       | defaults to undefined |

### Return type

**PlayerOnGameserverOutputDTOAPI**

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

# **playerOnGameServerControllerGetOne**

> PlayerOnGameserverOutputDTOAPI playerOnGameServerControllerGetOne()

Required permissions: `READ_PLAYERS`<br> OperationId: `PlayerOnGameServerControllerGetOne`

### Example

```typescript
import { PlayerOnGameServerApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new PlayerOnGameServerApi(configuration);

let gameServerId: string; // (default to undefined)
let playerId: string; // (default to undefined)

const { status, data } = await apiInstance.playerOnGameServerControllerGetOne(gameServerId, playerId);
```

### Parameters

| Name             | Type         | Description | Notes                 |
| ---------------- | ------------ | ----------- | --------------------- |
| **gameServerId** | [**string**] |             | defaults to undefined |
| **playerId**     | [**string**] |             | defaults to undefined |

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

# **playerOnGameServerControllerSearch**

> PlayerOnGameserverOutputArrayDTOAPI playerOnGameServerControllerSearch()

Required permissions: `READ_PLAYERS`<br> OperationId: `PlayerOnGameServerControllerSearch`

### Example

```typescript
import { PlayerOnGameServerApi, Configuration, PlayerOnGameServerSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new PlayerOnGameServerApi(configuration);

let playerOnGameServerSearchInputDTO: PlayerOnGameServerSearchInputDTO; //PlayerOnGameServerSearchInputDTO (optional)

const { status, data } = await apiInstance.playerOnGameServerControllerSearch(playerOnGameServerSearchInputDTO);
```

### Parameters

| Name                                 | Type                                 | Description                      | Notes |
| ------------------------------------ | ------------------------------------ | -------------------------------- | ----- |
| **playerOnGameServerSearchInputDTO** | **PlayerOnGameServerSearchInputDTO** | PlayerOnGameServerSearchInputDTO |       |

### Return type

**PlayerOnGameserverOutputArrayDTOAPI**

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

# **playerOnGameServerControllerSetCurrency**

> PlayerOnGameserverOutputDTOAPI playerOnGameServerControllerSetCurrency()

Required permissions: `MANAGE_PLAYERS`<br> OperationId: `PlayerOnGameServerControllerSetCurrency`

### Example

```typescript
import { PlayerOnGameServerApi, Configuration, PlayerOnGameServerSetCurrencyInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new PlayerOnGameServerApi(configuration);

let gameServerId: string; // (default to undefined)
let playerId: string; // (default to undefined)
let playerOnGameServerSetCurrencyInputDTO: PlayerOnGameServerSetCurrencyInputDTO; //PlayerOnGameServerSetCurrencyInputDTO (optional)

const { status, data } = await apiInstance.playerOnGameServerControllerSetCurrency(
  gameServerId,
  playerId,
  playerOnGameServerSetCurrencyInputDTO,
);
```

### Parameters

| Name                                      | Type                                      | Description                           | Notes                 |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------- | --------------------- |
| **playerOnGameServerSetCurrencyInputDTO** | **PlayerOnGameServerSetCurrencyInputDTO** | PlayerOnGameServerSetCurrencyInputDTO |                       |
| **gameServerId**                          | [**string**]                              |                                       | defaults to undefined |
| **playerId**                              | [**string**]                              |                                       | defaults to undefined |

### Return type

**PlayerOnGameserverOutputDTOAPI**

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

# **playerOnGameServerControllerTransactBetweenPlayers**

> PlayerOnGameserverOutputDTOAPI playerOnGameServerControllerTransactBetweenPlayers()

Required permissions: `MANAGE_PLAYERS`<br> OperationId: `PlayerOnGameServerControllerTransactBetweenPlayers`

### Example

```typescript
import { PlayerOnGameServerApi, Configuration, PlayerOnGameServerSetCurrencyInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new PlayerOnGameServerApi(configuration);

let gameServerId: string; // (default to undefined)
let sender: string; // (default to undefined)
let receiver: string; // (default to undefined)
let playerOnGameServerSetCurrencyInputDTO: PlayerOnGameServerSetCurrencyInputDTO; //PlayerOnGameServerSetCurrencyInputDTO (optional)

const { status, data } = await apiInstance.playerOnGameServerControllerTransactBetweenPlayers(
  gameServerId,
  sender,
  receiver,
  playerOnGameServerSetCurrencyInputDTO,
);
```

### Parameters

| Name                                      | Type                                      | Description                           | Notes                 |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------- | --------------------- |
| **playerOnGameServerSetCurrencyInputDTO** | **PlayerOnGameServerSetCurrencyInputDTO** | PlayerOnGameServerSetCurrencyInputDTO |                       |
| **gameServerId**                          | [**string**]                              |                                       | defaults to undefined |
| **sender**                                | [**string**]                              |                                       | defaults to undefined |
| **receiver**                              | [**string**]                              |                                       | defaults to undefined |

### Return type

**PlayerOnGameserverOutputDTOAPI**

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
