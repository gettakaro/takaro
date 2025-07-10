# FunctionApi

All URIs are relative to _http://localhost_

| Method                                                    | HTTP request              | Description |
| --------------------------------------------------------- | ------------------------- | ----------- |
| [**functionControllerCreate**](#functioncontrollercreate) | **POST** /function        | Create      |
| [**functionControllerGetOne**](#functioncontrollergetone) | **GET** /function/{id}    | Get one     |
| [**functionControllerRemove**](#functioncontrollerremove) | **DELETE** /function/{id} | Remove      |
| [**functionControllerSearch**](#functioncontrollersearch) | **POST** /function/search | Search      |
| [**functionControllerUpdate**](#functioncontrollerupdate) | **PUT** /function/{id}    | Update      |

# **functionControllerCreate**

> FunctionOutputDTOAPI functionControllerCreate()

Required permissions: `MANAGE_MODULES`<br> OperationId: `FunctionControllerCreate`

### Example

```typescript
import { FunctionApi, Configuration, FunctionCreateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new FunctionApi(configuration);

let functionCreateDTO: FunctionCreateDTO; //FunctionCreateDTO (optional)

const { status, data } = await apiInstance.functionControllerCreate(functionCreateDTO);
```

### Parameters

| Name                  | Type                  | Description       | Notes |
| --------------------- | --------------------- | ----------------- | ----- |
| **functionCreateDTO** | **FunctionCreateDTO** | FunctionCreateDTO |       |

### Return type

**FunctionOutputDTOAPI**

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

# **functionControllerGetOne**

> FunctionOutputDTOAPI functionControllerGetOne()

Required permissions: `READ_MODULES`<br> OperationId: `FunctionControllerGetOne`

### Example

```typescript
import { FunctionApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new FunctionApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.functionControllerGetOne(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**FunctionOutputDTOAPI**

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

# **functionControllerRemove**

> APIOutput functionControllerRemove()

Required permissions: `MANAGE_MODULES`<br> OperationId: `FunctionControllerRemove`

### Example

```typescript
import { FunctionApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new FunctionApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.functionControllerRemove(id);
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

# **functionControllerSearch**

> FunctionOutputArrayDTOAPI functionControllerSearch()

Required permissions: `READ_MODULES`<br> OperationId: `FunctionControllerSearch`

### Example

```typescript
import { FunctionApi, Configuration, FunctionSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new FunctionApi(configuration);

let functionSearchInputDTO: FunctionSearchInputDTO; //FunctionSearchInputDTO (optional)

const { status, data } = await apiInstance.functionControllerSearch(functionSearchInputDTO);
```

### Parameters

| Name                       | Type                       | Description            | Notes |
| -------------------------- | -------------------------- | ---------------------- | ----- |
| **functionSearchInputDTO** | **FunctionSearchInputDTO** | FunctionSearchInputDTO |       |

### Return type

**FunctionOutputArrayDTOAPI**

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

# **functionControllerUpdate**

> FunctionOutputDTOAPI functionControllerUpdate()

Required permissions: `MANAGE_MODULES`<br> OperationId: `FunctionControllerUpdate`

### Example

```typescript
import { FunctionApi, Configuration, FunctionUpdateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new FunctionApi(configuration);

let id: string; // (default to undefined)
let functionUpdateDTO: FunctionUpdateDTO; //FunctionUpdateDTO (optional)

const { status, data } = await apiInstance.functionControllerUpdate(id, functionUpdateDTO);
```

### Parameters

| Name                  | Type                  | Description       | Notes                 |
| --------------------- | --------------------- | ----------------- | --------------------- |
| **functionUpdateDTO** | **FunctionUpdateDTO** | FunctionUpdateDTO |                       |
| **id**                | [**string**]          |                   | defaults to undefined |

### Return type

**FunctionOutputDTOAPI**

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
