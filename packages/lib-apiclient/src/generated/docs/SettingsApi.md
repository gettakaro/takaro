# SettingsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**settingsControllerDelete**](#settingscontrollerdelete) | **DELETE** /settings/{key} | Delete|
|[**settingsControllerGet**](#settingscontrollerget) | **GET** /settings | Get|
|[**settingsControllerGetOne**](#settingscontrollergetone) | **GET** /settings/{key} | Get one|
|[**settingsControllerSet**](#settingscontrollerset) | **POST** /settings/{key} | Set|

# **settingsControllerDelete**
> APIOutput settingsControllerDelete()

   Required permissions: `MANAGE_SETTINGS`<br> OperationId: `SettingsControllerDelete`

### Example

```typescript
import {
    SettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

let key: string; // (default to undefined)
let gameServerId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.settingsControllerDelete(
    key,
    gameServerId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|
| **gameServerId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**APIOutput**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **settingsControllerGet**
> SettingsOutputArrayDTOAPI settingsControllerGet()

<br> OperationId: `SettingsControllerGet`

### Example

```typescript
import {
    SettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

let keys: Array<'commandPrefix' | 'serverChatName' | 'economyEnabled' | 'currencyName' | 'developerMode' | 'messagePrefix' | 'domainName'>; // (optional) (default to undefined)
let gameServerId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.settingsControllerGet(
    keys,
    gameServerId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **keys** | **Array<&#39;commandPrefix&#39; &#124; &#39;serverChatName&#39; &#124; &#39;economyEnabled&#39; &#124; &#39;currencyName&#39; &#124; &#39;developerMode&#39; &#124; &#39;messagePrefix&#39; &#124; &#39;domainName&#39;>** |  | (optional) defaults to undefined|
| **gameServerId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**SettingsOutputArrayDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **settingsControllerGetOne**
> SettingsOutputDTOAPI settingsControllerGetOne()

<br> OperationId: `SettingsControllerGetOne`

### Example

```typescript
import {
    SettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

let key: string; // (default to undefined)
let gameServerId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.settingsControllerGetOne(
    key,
    gameServerId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|
| **gameServerId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**SettingsOutputDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **settingsControllerSet**
> SettingsOutputDTOAPI settingsControllerSet()

   Required permissions: `MANAGE_SETTINGS`<br> OperationId: `SettingsControllerSet`

### Example

```typescript
import {
    SettingsApi,
    Configuration,
    SettingsSetDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

let key: string; // (default to undefined)
let settingsSetDTO: SettingsSetDTO; //SettingsSetDTO (optional)

const { status, data } = await apiInstance.settingsControllerSet(
    key,
    settingsSetDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **settingsSetDTO** | **SettingsSetDTO**| SettingsSetDTO | |
| **key** | [**string**] |  | defaults to undefined|


### Return type

**SettingsOutputDTOAPI**

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

