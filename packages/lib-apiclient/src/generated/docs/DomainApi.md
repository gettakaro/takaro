# DomainApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**domainControllerCreate**](#domaincontrollercreate) | **POST** /domain | Create|
|[**domainControllerGetOne**](#domaincontrollergetone) | **GET** /domain/{id} | Get one|
|[**domainControllerGetToken**](#domaincontrollergettoken) | **POST** /token | Get token|
|[**domainControllerRemove**](#domaincontrollerremove) | **DELETE** /domain/{id} | Remove|
|[**domainControllerResolveRegistrationToken**](#domaincontrollerresolveregistrationtoken) | **POST** /resolve-registration-token | Resolve registration token|
|[**domainControllerSearch**](#domaincontrollersearch) | **POST** /domain/search | Search|
|[**domainControllerUpdate**](#domaincontrollerupdate) | **PUT** /domain/{id} | Update|

# **domainControllerCreate**
> DomainCreateOutputDTOAPI domainControllerCreate()

<br> OperationId: `DomainControllerCreate`

### Example

```typescript
import {
    DomainApi,
    Configuration,
    DomainCreateInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DomainApi(configuration);

let domainCreateInputDTO: DomainCreateInputDTO; //DomainCreateInputDTO (optional)

const { status, data } = await apiInstance.domainControllerCreate(
    domainCreateInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **domainCreateInputDTO** | **DomainCreateInputDTO**| DomainCreateInputDTO | |


### Return type

**DomainCreateOutputDTOAPI**

### Authorization

[adminAuth](../README.md#adminAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **domainControllerGetOne**
> DomainOutputDTOAPI domainControllerGetOne()

<br> OperationId: `DomainControllerGetOne`

### Example

```typescript
import {
    DomainApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DomainApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.domainControllerGetOne(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DomainOutputDTOAPI**

### Authorization

[adminAuth](../README.md#adminAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **domainControllerGetToken**
> TokenOutputDTOAPI domainControllerGetToken()

<br> OperationId: `DomainControllerGetToken`

### Example

```typescript
import {
    DomainApi,
    Configuration,
    TokenInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DomainApi(configuration);

let tokenInputDTO: TokenInputDTO; //TokenInputDTO (optional)

const { status, data } = await apiInstance.domainControllerGetToken(
    tokenInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tokenInputDTO** | **TokenInputDTO**| TokenInputDTO | |


### Return type

**TokenOutputDTOAPI**

### Authorization

[adminAuth](../README.md#adminAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **domainControllerRemove**
> APIOutput domainControllerRemove()

<br> OperationId: `DomainControllerRemove`

### Example

```typescript
import {
    DomainApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DomainApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.domainControllerRemove(
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

[adminAuth](../README.md#adminAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **domainControllerResolveRegistrationToken**
> DomainOutputDTOAPI domainControllerResolveRegistrationToken()

<br> OperationId: `DomainControllerResolveRegistrationToken`

### Example

```typescript
import {
    DomainApi,
    Configuration,
    ResolveRegistrationTokenInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DomainApi(configuration);

let resolveRegistrationTokenInputDTO: ResolveRegistrationTokenInputDTO; //ResolveRegistrationTokenInputDTO (optional)

const { status, data } = await apiInstance.domainControllerResolveRegistrationToken(
    resolveRegistrationTokenInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **resolveRegistrationTokenInputDTO** | **ResolveRegistrationTokenInputDTO**| ResolveRegistrationTokenInputDTO | |


### Return type

**DomainOutputDTOAPI**

### Authorization

[adminAuth](../README.md#adminAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **domainControllerSearch**
> DomainOutputArrayDTOAPI domainControllerSearch()

<br> OperationId: `DomainControllerSearch`

### Example

```typescript
import {
    DomainApi,
    Configuration,
    DomainSearchInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DomainApi(configuration);

let domainSearchInputDTO: DomainSearchInputDTO; //DomainSearchInputDTO (optional)

const { status, data } = await apiInstance.domainControllerSearch(
    domainSearchInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **domainSearchInputDTO** | **DomainSearchInputDTO**| DomainSearchInputDTO | |


### Return type

**DomainOutputArrayDTOAPI**

### Authorization

[adminAuth](../README.md#adminAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **domainControllerUpdate**
> DomainOutputDTOAPI domainControllerUpdate()

<br> OperationId: `DomainControllerUpdate`

### Example

```typescript
import {
    DomainApi,
    Configuration,
    DomainUpdateInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new DomainApi(configuration);

let id: string; // (default to undefined)
let domainUpdateInputDTO: DomainUpdateInputDTO; //DomainUpdateInputDTO (optional)

const { status, data } = await apiInstance.domainControllerUpdate(
    id,
    domainUpdateInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **domainUpdateInputDTO** | **DomainUpdateInputDTO**| DomainUpdateInputDTO | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DomainOutputDTOAPI**

### Authorization

[adminAuth](../README.md#adminAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

