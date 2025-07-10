# StatsApi

All URIs are relative to _http://localhost_

| Method                                                                          | HTTP request                  | Description                                       |
| ------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------- |
| [**statsControllerGetActivityStats**](#statscontrollergetactivitystats)         | **GET** /stats/activity       | Get activity stats                                |
| [**statsControllerGetCountryStats**](#statscontrollergetcountrystats)           | **GET** /stats/countries      | Get statistics about the countries of the players |
| [**statsControllerGetCurrencyStats**](#statscontrollergetcurrencystats)         | **GET** /stats/currency       | Get currency stats                                |
| [**statsControllerGetEventsCount**](#statscontrollergeteventscount)             | **GET** /stats/events-count   | Get event count over time                         |
| [**statsControllerGetLatencyStats**](#statscontrollergetlatencystats)           | **GET** /stats/latency        | Get latency stats                                 |
| [**statsControllerGetPingStats**](#statscontrollergetpingstats)                 | **GET** /stats/ping           | Get ping stats                                    |
| [**statsControllerGetPlayerOnlineStats**](#statscontrollergetplayeronlinestats) | **GET** /stats/players-online | Get player online stats                           |

# **statsControllerGetActivityStats**

> StatsOutputDTOAPI statsControllerGetActivityStats()

Required permissions: `READ_PLAYERS`<br> OperationId: `StatsControllerGetActivityStats`

### Example

```typescript
import { StatsApi, Configuration, string, string } from './api';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let timeType: 'daily' | 'weekly' | 'monthly'; // (default to undefined)
let dataType: 'users' | 'players'; // (default to undefined)
let gameServerId: string; // (optional) (default to undefined)
let startDate: string; // (optional) (default to undefined)
let endDate: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.statsControllerGetActivityStats(
  timeType,
  dataType,
  gameServerId,
  startDate,
  endDate,
);
```

### Parameters

| Name             | Type                 | Description                                                               | Notes                                                                                             |
| ---------------- | -------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------- | --------------------- |
| **timeType**     | [\*\*&#39;daily&#39; | &#39;weekly&#39;                                                          | &#39;monthly&#39;**]**Array<&#39;daily&#39; &#124; &#39;weekly&#39; &#124; &#39;monthly&#39;>\*\* |                       | defaults to undefined |
| **dataType**     | [\*\*&#39;users&#39; | &#39;players&#39;**]**Array<&#39;users&#39; &#124; &#39;players&#39;>\*\* |                                                                                                   | defaults to undefined |
| **gameServerId** | [**string**]         |                                                                           | (optional) defaults to undefined                                                                  |
| **startDate**    | [**string**]         |                                                                           | (optional) defaults to undefined                                                                  |
| **endDate**      | [**string**]         |                                                                           | (optional) defaults to undefined                                                                  |

### Return type

**StatsOutputDTOAPI**

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

# **statsControllerGetCountryStats**

> StatsOutputDTOAPI statsControllerGetCountryStats()

Calculates how many players are from each country. Returns a count per country (ISO3166). Required permissions: `READ_PLAYERS`<br> OperationId: `StatsControllerGetCountryStats`

### Example

```typescript
import { StatsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let gameServerId: Array<string>; // (optional) (default to undefined)

const { status, data } = await apiInstance.statsControllerGetCountryStats(gameServerId);
```

### Parameters

| Name             | Type                    | Description | Notes                            |
| ---------------- | ----------------------- | ----------- | -------------------------------- |
| **gameServerId** | **Array&lt;string&gt;** |             | (optional) defaults to undefined |

### Return type

**StatsOutputDTOAPI**

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

# **statsControllerGetCurrencyStats**

> StatsOutputDTOAPI statsControllerGetCurrencyStats()

Required permissions: `READ_PLAYERS`<br> OperationId: `StatsControllerGetCurrencyStats`

### Example

```typescript
import { StatsApi, Configuration, string, string } from './api';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let gameServerId: string; // (default to undefined)
let playerId: string; // (optional) (default to undefined)
let startDate: string; // (optional) (default to undefined)
let endDate: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.statsControllerGetCurrencyStats(gameServerId, playerId, startDate, endDate);
```

### Parameters

| Name             | Type         | Description | Notes                            |
| ---------------- | ------------ | ----------- | -------------------------------- |
| **gameServerId** | [**string**] |             | defaults to undefined            |
| **playerId**     | [**string**] |             | (optional) defaults to undefined |
| **startDate**    | [**string**] |             | (optional) defaults to undefined |
| **endDate**      | [**string**] |             | (optional) defaults to undefined |

### Return type

**StatsOutputDTOAPI**

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

# **statsControllerGetEventsCount**

> StatsOutputDTOAPI statsControllerGetEventsCount()

Calculates how many times an event type has occured over `bucketStep` time. Supports different filters and can return multiple series at a time. Required permissions: `READ_PLAYERS`<br> OperationId: `StatsControllerGetEventsCount`

### Example

```typescript
import { StatsApi, Configuration, string, string } from './api';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let eventName:
  | 'role-assigned'
  | 'role-removed'
  | 'role-created'
  | 'role-updated'
  | 'role-deleted'
  | 'command-executed'
  | 'command-execution-denied'
  | 'hook-executed'
  | 'cronjob-executed'
  | 'currency-added'
  | 'currency-deducted'
  | 'settings-set'
  | 'player-new-ip-detected'
  | 'server-status-changed'
  | 'module-created'
  | 'module-updated'
  | 'module-deleted'
  | 'module-installed'
  | 'module-uninstalled'
  | 'player-created'
  | 'shop-listing-created'
  | 'shop-listing-updated'
  | 'shop-listing-deleted'
  | 'shop-order-created'
  | 'shop-order-status-changed'
  | 'shop-order-delivery-failed'
  | 'player-linked'
  | 'gameserver-created'
  | 'gameserver-updated'
  | 'gameserver-deleted'
  | 'player-banned'
  | 'player-unbanned'
  | 'player-connected'
  | 'player-disconnected'
  | 'chat-message'
  | 'player-death'
  | 'entity-killed'; // (default to undefined)
let bucketStep: '5m' | '30m' | '1h' | '6h' | '12h' | '24h'; // (default to undefined)
let sumBy: Array<'player' | 'module' | 'user' | 'gameserver'>; // (optional) (default to undefined)
let gameServerId: string; // (optional) (default to undefined)
let moduleId: string; // (optional) (default to undefined)
let playerId: string; // (optional) (default to undefined)
let userId: string; // (optional) (default to undefined)
let startDate: string; // (optional) (default to undefined)
let endDate: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.statsControllerGetEventsCount(
  eventName,
  bucketStep,
  sumBy,
  gameServerId,
  moduleId,
  playerId,
  userId,
  startDate,
  endDate,
);
```

### Parameters

| Name             | Type                                                                                                  | Description            | Notes                            |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------- | ---------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ----------------------- | -------------------------- | ------------------------ | --------------------------- | ---------------------- | -------------------------------- | ------------------------------- | ------------------------ | ------------------------ | ------------------------ | -------------------------- | ---------------------------- | ------------------------ | ------------------------------ | ------------------------------ | ------------------------------ | ---------------------------- | ----------------------------------- | ------------------------------------ | ----------------------- | ---------------------------- | ---------------------------- | ---------------------------- | ----------------------- | ------------------------- | -------------------------- | ----------------------------- | ---------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --------------------- |
| **eventName**    | [\*\*&#39;role-assigned&#39;                                                                          | &#39;role-removed&#39; | &#39;role-created&#39;           | &#39;role-updated&#39; | &#39;role-deleted&#39; | &#39;command-executed&#39;                                                                                                                       | &#39;command-execution-denied&#39; | &#39;hook-executed&#39; | &#39;cronjob-executed&#39; | &#39;currency-added&#39; | &#39;currency-deducted&#39; | &#39;settings-set&#39; | &#39;player-new-ip-detected&#39; | &#39;server-status-changed&#39; | &#39;module-created&#39; | &#39;module-updated&#39; | &#39;module-deleted&#39; | &#39;module-installed&#39; | &#39;module-uninstalled&#39; | &#39;player-created&#39; | &#39;shop-listing-created&#39; | &#39;shop-listing-updated&#39; | &#39;shop-listing-deleted&#39; | &#39;shop-order-created&#39; | &#39;shop-order-status-changed&#39; | &#39;shop-order-delivery-failed&#39; | &#39;player-linked&#39; | &#39;gameserver-created&#39; | &#39;gameserver-updated&#39; | &#39;gameserver-deleted&#39; | &#39;player-banned&#39; | &#39;player-unbanned&#39; | &#39;player-connected&#39; | &#39;player-disconnected&#39; | &#39;chat-message&#39; | &#39;player-death&#39; | &#39;entity-killed&#39;**]**Array<&#39;role-assigned&#39; &#124; &#39;role-removed&#39; &#124; &#39;role-created&#39; &#124; &#39;role-updated&#39; &#124; &#39;role-deleted&#39; &#124; &#39;command-executed&#39; &#124; &#39;command-execution-denied&#39; &#124; &#39;hook-executed&#39; &#124; &#39;cronjob-executed&#39; &#124; &#39;currency-added&#39; &#124; &#39;currency-deducted&#39; &#124; &#39;settings-set&#39; &#124; &#39;player-new-ip-detected&#39; &#124; &#39;server-status-changed&#39; &#124; &#39;module-created&#39; &#124; &#39;module-updated&#39; &#124; &#39;module-deleted&#39; &#124; &#39;module-installed&#39; &#124; &#39;module-uninstalled&#39; &#124; &#39;player-created&#39; &#124; &#39;shop-listing-created&#39; &#124; &#39;shop-listing-updated&#39; &#124; &#39;shop-listing-deleted&#39; &#124; &#39;shop-order-created&#39; &#124; &#39;shop-order-status-changed&#39; &#124; &#39;shop-order-delivery-failed&#39; &#124; &#39;player-linked&#39; &#124; &#39;gameserver-created&#39; &#124; &#39;gameserver-updated&#39; &#124; &#39;gameserver-deleted&#39; &#124; &#39;player-banned&#39; &#124; &#39;player-unbanned&#39; &#124; &#39;player-connected&#39; &#124; &#39;player-disconnected&#39; &#124; &#39;chat-message&#39; &#124; &#39;player-death&#39; &#124; &#39;entity-killed&#39;>\*\* |     | defaults to undefined |
| **bucketStep**   | [\*\*&#39;5m&#39;                                                                                     | &#39;30m&#39;          | &#39;1h&#39;                     | &#39;6h&#39;           | &#39;12h&#39;          | &#39;24h&#39;**]**Array<&#39;5m&#39; &#124; &#39;30m&#39; &#124; &#39;1h&#39; &#124; &#39;6h&#39; &#124; &#39;12h&#39; &#124; &#39;24h&#39;>\*\* |                                    | defaults to undefined   |
| **sumBy**        | **Array<&#39;player&#39; &#124; &#39;module&#39; &#124; &#39;user&#39; &#124; &#39;gameserver&#39;>** |                        | (optional) defaults to undefined |
| **gameServerId** | [**string**]                                                                                          |                        | (optional) defaults to undefined |
| **moduleId**     | [**string**]                                                                                          |                        | (optional) defaults to undefined |
| **playerId**     | [**string**]                                                                                          |                        | (optional) defaults to undefined |
| **userId**       | [**string**]                                                                                          |                        | (optional) defaults to undefined |
| **startDate**    | [**string**]                                                                                          |                        | (optional) defaults to undefined |
| **endDate**      | [**string**]                                                                                          |                        | (optional) defaults to undefined |

### Return type

**StatsOutputDTOAPI**

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

# **statsControllerGetLatencyStats**

> StatsOutputDTOAPI statsControllerGetLatencyStats()

The roundtrip time for reachability tests between Takaro and the game server<br> OperationId: `StatsControllerGetLatencyStats`

### Example

```typescript
import { StatsApi, Configuration, string, string } from './api';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let gameServerId: string; // (default to undefined)
let startDate: string; // (optional) (default to undefined)
let endDate: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.statsControllerGetLatencyStats(gameServerId, startDate, endDate);
```

### Parameters

| Name             | Type         | Description | Notes                            |
| ---------------- | ------------ | ----------- | -------------------------------- |
| **gameServerId** | [**string**] |             | defaults to undefined            |
| **startDate**    | [**string**] |             | (optional) defaults to undefined |
| **endDate**      | [**string**] |             | (optional) defaults to undefined |

### Return type

**StatsOutputDTOAPI**

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

# **statsControllerGetPingStats**

> StatsOutputDTOAPI statsControllerGetPingStats()

Required permissions: `READ_PLAYERS`<br> OperationId: `StatsControllerGetPingStats`

### Example

```typescript
import { StatsApi, Configuration, string, string } from './api';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let gameServerId: string; // (default to undefined)
let playerId: string; // (default to undefined)
let startDate: string; // (optional) (default to undefined)
let endDate: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.statsControllerGetPingStats(gameServerId, playerId, startDate, endDate);
```

### Parameters

| Name             | Type         | Description | Notes                            |
| ---------------- | ------------ | ----------- | -------------------------------- |
| **gameServerId** | [**string**] |             | defaults to undefined            |
| **playerId**     | [**string**] |             | defaults to undefined            |
| **startDate**    | [**string**] |             | (optional) defaults to undefined |
| **endDate**      | [**string**] |             | (optional) defaults to undefined |

### Return type

**StatsOutputDTOAPI**

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

# **statsControllerGetPlayerOnlineStats**

> StatsOutputDTOAPI statsControllerGetPlayerOnlineStats()

Required permissions: `READ_PLAYERS`<br> OperationId: `StatsControllerGetPlayerOnlineStats`

### Example

```typescript
import { StatsApi, Configuration, string, string } from './api';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let gameServerId: string; // (optional) (default to undefined)
let startDate: string; // (optional) (default to undefined)
let endDate: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.statsControllerGetPlayerOnlineStats(gameServerId, startDate, endDate);
```

### Parameters

| Name             | Type         | Description | Notes                            |
| ---------------- | ------------ | ----------- | -------------------------------- |
| **gameServerId** | [**string**] |             | (optional) defaults to undefined |
| **startDate**    | [**string**] |             | (optional) defaults to undefined |
| **endDate**      | [**string**] |             | (optional) defaults to undefined |

### Return type

**StatsOutputDTOAPI**

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
