# HookApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**hookControllerCreate**](#hookcontrollercreate) | **POST** /hook | Create|
|[**hookControllerGetExecutions**](#hookcontrollergetexecutions) | **POST** /hook/{id}/executions | Get executions|
|[**hookControllerGetOne**](#hookcontrollergetone) | **GET** /hook/{id} | Get one|
|[**hookControllerRemove**](#hookcontrollerremove) | **DELETE** /hook/{id} | Remove|
|[**hookControllerSearch**](#hookcontrollersearch) | **POST** /hook/search | Search|
|[**hookControllerTrigger**](#hookcontrollertrigger) | **POST** /hook/trigger | Trigger|
|[**hookControllerUpdate**](#hookcontrollerupdate) | **PUT** /hook/{id} | Update|

# **hookControllerCreate**
> HookOutputDTOAPI hookControllerCreate()

   Required permissions: `MANAGE_MODULES`<br> OperationId: `HookControllerCreate`

### Example

```typescript
import {
    HookApi,
    Configuration,
    HookCreateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new HookApi(configuration);

let hookCreateDTO: HookCreateDTO; //HookCreateDTO (optional)

const { status, data } = await apiInstance.hookControllerCreate(
    hookCreateDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **hookCreateDTO** | **HookCreateDTO**| HookCreateDTO | |


### Return type

**HookOutputDTOAPI**

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

# **hookControllerGetExecutions**
> EventOutputArrayDTOAPI hookControllerGetExecutions()

   Required permissions: `READ_MODULES`<br> OperationId: `HookControllerGetExecutions`

### Example

```typescript
import {
    HookApi,
    Configuration,
    EventSearchInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new HookApi(configuration);

let id: string; // (default to undefined)
let success: any; // (optional) (default to undefined)
let eventSearchInputDTO: EventSearchInputDTO; //EventSearchInputDTO (optional)

const { status, data } = await apiInstance.hookControllerGetExecutions(
    id,
    success,
    eventSearchInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eventSearchInputDTO** | **EventSearchInputDTO**| EventSearchInputDTO | |
| **id** | [**string**] |  | defaults to undefined|
| **success** | **any** |  | (optional) defaults to undefined|


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

# **hookControllerGetOne**
> HookOutputDTOAPI hookControllerGetOne()

   Required permissions: `READ_MODULES`<br> OperationId: `HookControllerGetOne`

### Example

```typescript
import {
    HookApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new HookApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.hookControllerGetOne(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**HookOutputDTOAPI**

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

# **hookControllerRemove**
> APIOutput hookControllerRemove()

   Required permissions: `MANAGE_MODULES`<br> OperationId: `HookControllerRemove`

### Example

```typescript
import {
    HookApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new HookApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.hookControllerRemove(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


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

# **hookControllerSearch**
> HookOutputArrayDTOAPI hookControllerSearch()

   Required permissions: `READ_MODULES`<br> OperationId: `HookControllerSearch`

### Example

```typescript
import {
    HookApi,
    Configuration,
    HookSearchInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new HookApi(configuration);

let hookSearchInputDTO: HookSearchInputDTO; //HookSearchInputDTO (optional)

const { status, data } = await apiInstance.hookControllerSearch(
    hookSearchInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **hookSearchInputDTO** | **HookSearchInputDTO**| HookSearchInputDTO | |


### Return type

**HookOutputArrayDTOAPI**

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

# **hookControllerTrigger**
> hookControllerTrigger()

Trigger a hook. This is used for testing purposes, the event will not actually be created but the hook-logic will be executed.      You can pass any data you want, but it must validate against the corresponding event metadata. Eg to trigger the `chat-message` event, you must pass an object with a `message` property   Required permissions: `MANAGE_MODULES`<br> OperationId: `HookControllerTrigger`

### Example

```typescript
import {
    HookApi,
    Configuration,
    HookTriggerDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new HookApi(configuration);

let hookTriggerDTO: HookTriggerDTO; //HookTriggerDTO (optional)

const { status, data } = await apiInstance.hookControllerTrigger(
    hookTriggerDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **hookTriggerDTO** | **HookTriggerDTO**| HookTriggerDTO | |


### Return type

void (empty response body)

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **hookControllerUpdate**
> HookOutputDTOAPI hookControllerUpdate()

   Required permissions: `MANAGE_MODULES`<br> OperationId: `HookControllerUpdate`

### Example

```typescript
import {
    HookApi,
    Configuration,
    HookUpdateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new HookApi(configuration);

let id: string; // (default to undefined)
let hookUpdateDTO: HookUpdateDTO; //HookUpdateDTO (optional)

const { status, data } = await apiInstance.hookControllerUpdate(
    id,
    hookUpdateDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **hookUpdateDTO** | **HookUpdateDTO**| HookUpdateDTO | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**HookOutputDTOAPI**

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

