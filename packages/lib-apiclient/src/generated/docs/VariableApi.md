# VariableApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**variableControllerCreate**](#variablecontrollercreate) | **POST** /variables | Create|
|[**variableControllerDelete**](#variablecontrollerdelete) | **DELETE** /variables/{id} | Delete|
|[**variableControllerFindOne**](#variablecontrollerfindone) | **GET** /variables/{id} | Find one|
|[**variableControllerSearch**](#variablecontrollersearch) | **POST** /variables/search | Search|
|[**variableControllerUpdate**](#variablecontrollerupdate) | **PUT** /variables/{id} | Update|

# **variableControllerCreate**
> VariableOutputDTOAPI variableControllerCreate()

   Required permissions: `MANAGE_VARIABLES`<br> OperationId: `VariableControllerCreate`

### Example

```typescript
import {
    VariableApi,
    Configuration,
    VariableCreateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new VariableApi(configuration);

let variableCreateDTO: VariableCreateDTO; //VariableCreateDTO (optional)

const { status, data } = await apiInstance.variableControllerCreate(
    variableCreateDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **variableCreateDTO** | **VariableCreateDTO**| VariableCreateDTO | |


### Return type

**VariableOutputDTOAPI**

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

# **variableControllerDelete**
> APIOutput variableControllerDelete()

   Required permissions: `MANAGE_VARIABLES`<br> OperationId: `VariableControllerDelete`

### Example

```typescript
import {
    VariableApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VariableApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.variableControllerDelete(
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

# **variableControllerFindOne**
> VariableOutputDTOAPI variableControllerFindOne()

   Required permissions: `READ_VARIABLES`<br> OperationId: `VariableControllerFindOne`

### Example

```typescript
import {
    VariableApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VariableApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.variableControllerFindOne(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**VariableOutputDTOAPI**

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

# **variableControllerSearch**
> VariableOutputArrayDTOAPI variableControllerSearch()

   Required permissions: `READ_VARIABLES`<br> OperationId: `VariableControllerSearch`

### Example

```typescript
import {
    VariableApi,
    Configuration,
    VariableSearchInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new VariableApi(configuration);

let variableSearchInputDTO: VariableSearchInputDTO; //VariableSearchInputDTO (optional)

const { status, data } = await apiInstance.variableControllerSearch(
    variableSearchInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **variableSearchInputDTO** | **VariableSearchInputDTO**| VariableSearchInputDTO | |


### Return type

**VariableOutputArrayDTOAPI**

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

# **variableControllerUpdate**
> VariableOutputDTOAPI variableControllerUpdate()

   Required permissions: `MANAGE_VARIABLES`<br> OperationId: `VariableControllerUpdate`

### Example

```typescript
import {
    VariableApi,
    Configuration,
    VariableUpdateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new VariableApi(configuration);

let id: string; // (default to undefined)
let variableUpdateDTO: VariableUpdateDTO; //VariableUpdateDTO (optional)

const { status, data } = await apiInstance.variableControllerUpdate(
    id,
    variableUpdateDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **variableUpdateDTO** | **VariableUpdateDTO**| VariableUpdateDTO | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**VariableOutputDTOAPI**

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

