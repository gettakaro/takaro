# EventApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**eventControllerCreate**](#eventcontrollercreate) | **POST** /event | Create|
|[**eventControllerGetFailedFunctions**](#eventcontrollergetfailedfunctions) | **POST** /event/filter/failed-functions | Get failed functions|
|[**eventControllerGetOne**](#eventcontrollergetone) | **GET** /event/{id} | Get one|
|[**eventControllerSearch**](#eventcontrollersearch) | **POST** /event/search | Search|

# **eventControllerCreate**
> EventOutputDTO eventControllerCreate()

   Required permissions: `MANAGE_EVENTS`<br> OperationId: `EventControllerCreate`

### Example

```typescript
import {
    EventApi,
    Configuration,
    EventCreateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new EventApi(configuration);

let eventCreateDTO: EventCreateDTO; //EventCreateDTO (optional)

const { status, data } = await apiInstance.eventControllerCreate(
    eventCreateDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eventCreateDTO** | **EventCreateDTO**| EventCreateDTO | |


### Return type

**EventOutputDTO**

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

# **eventControllerGetFailedFunctions**
> EventOutputArrayDTOAPI eventControllerGetFailedFunctions()

Fetches events where cronjob, hook and command failed. Supports all the common query parameters   Required permissions: `READ_MODULES`, `READ_EVENTS`<br> OperationId: `EventControllerGetFailedFunctions`

### Example

```typescript
import {
    EventApi,
    Configuration,
    EventSearchInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new EventApi(configuration);

let eventSearchInputDTO: EventSearchInputDTO; //EventSearchInputDTO (optional)

const { status, data } = await apiInstance.eventControllerGetFailedFunctions(
    eventSearchInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eventSearchInputDTO** | **EventSearchInputDTO**| EventSearchInputDTO | |


### Return type

**EventOutputArrayDTOAPI**

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

# **eventControllerGetOne**
> EventOutputDTO eventControllerGetOne()

   Required permissions: `READ_EVENTS`<br> OperationId: `EventControllerGetOne`

### Example

```typescript
import {
    EventApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EventApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eventControllerGetOne(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**EventOutputDTO**

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

# **eventControllerSearch**
> EventOutputArrayDTOAPI eventControllerSearch()

   Required permissions: `READ_EVENTS`<br> OperationId: `EventControllerSearch`

### Example

```typescript
import {
    EventApi,
    Configuration,
    EventSearchInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new EventApi(configuration);

let eventSearchInputDTO: EventSearchInputDTO; //EventSearchInputDTO (optional)

const { status, data } = await apiInstance.eventControllerSearch(
    eventSearchInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eventSearchInputDTO** | **EventSearchInputDTO**| EventSearchInputDTO | |


### Return type

**EventOutputArrayDTOAPI**

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

