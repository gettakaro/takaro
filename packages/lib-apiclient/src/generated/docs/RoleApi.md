# RoleApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**roleControllerCreate**](#rolecontrollercreate) | **POST** /role | Create|
|[**roleControllerGetOne**](#rolecontrollergetone) | **GET** /role/{id} | Get one|
|[**roleControllerGetPermissions**](#rolecontrollergetpermissions) | **GET** /permissions | Get permissions|
|[**roleControllerRemove**](#rolecontrollerremove) | **DELETE** /role/{id} | Remove|
|[**roleControllerSearch**](#rolecontrollersearch) | **POST** /role/search | Search|
|[**roleControllerUpdate**](#rolecontrollerupdate) | **PUT** /role/{id} | Update|

# **roleControllerCreate**
> RoleOutputDTOAPI roleControllerCreate()

   Required permissions: `MANAGE_ROLES`<br> OperationId: `RoleControllerCreate`

### Example

```typescript
import {
    RoleApi,
    Configuration,
    RoleCreateInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new RoleApi(configuration);

let roleCreateInputDTO: RoleCreateInputDTO; //RoleCreateInputDTO (optional)

const { status, data } = await apiInstance.roleControllerCreate(
    roleCreateInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **roleCreateInputDTO** | **RoleCreateInputDTO**| RoleCreateInputDTO | |


### Return type

**RoleOutputDTOAPI**

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

# **roleControllerGetOne**
> RoleOutputDTOAPI roleControllerGetOne()

   Required permissions: `READ_ROLES`<br> OperationId: `RoleControllerGetOne`

### Example

```typescript
import {
    RoleApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RoleApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.roleControllerGetOne(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**RoleOutputDTOAPI**

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

# **roleControllerGetPermissions**
> PermissionOutputDTOAPI roleControllerGetPermissions()

<br> OperationId: `RoleControllerGetPermissions`

### Example

```typescript
import {
    RoleApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RoleApi(configuration);

const { status, data } = await apiInstance.roleControllerGetPermissions();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PermissionOutputDTOAPI**

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

# **roleControllerRemove**
> APIOutput roleControllerRemove()

   Required permissions: `MANAGE_ROLES`<br> OperationId: `RoleControllerRemove`

### Example

```typescript
import {
    RoleApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RoleApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.roleControllerRemove(
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

# **roleControllerSearch**
> RoleOutputArrayDTOAPI roleControllerSearch()

   Required permissions: `READ_ROLES`<br> OperationId: `RoleControllerSearch`

### Example

```typescript
import {
    RoleApi,
    Configuration,
    RoleSearchInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new RoleApi(configuration);

let roleSearchInputDTO: RoleSearchInputDTO; //RoleSearchInputDTO (optional)

const { status, data } = await apiInstance.roleControllerSearch(
    roleSearchInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **roleSearchInputDTO** | **RoleSearchInputDTO**| RoleSearchInputDTO | |


### Return type

**RoleOutputArrayDTOAPI**

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

# **roleControllerUpdate**
> RoleOutputDTOAPI roleControllerUpdate()

   Required permissions: `MANAGE_ROLES`<br> OperationId: `RoleControllerUpdate`

### Example

```typescript
import {
    RoleApi,
    Configuration,
    RoleUpdateInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new RoleApi(configuration);

let id: string; // (default to undefined)
let roleUpdateInputDTO: RoleUpdateInputDTO; //RoleUpdateInputDTO (optional)

const { status, data } = await apiInstance.roleControllerUpdate(
    id,
    roleUpdateInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **roleUpdateInputDTO** | **RoleUpdateInputDTO**| RoleUpdateInputDTO | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**RoleOutputDTOAPI**

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

