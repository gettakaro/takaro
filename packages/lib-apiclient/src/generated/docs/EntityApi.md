# EntityApi

All URIs are relative to _http://localhost_

| Method                                                  | HTTP request              | Description |
| ------------------------------------------------------- | ------------------------- | ----------- |
| [**entityControllerFindOne**](#entitycontrollerfindone) | **GET** /entities/{id}    | Find one    |
| [**entityControllerSearch**](#entitycontrollersearch)   | **POST** /entities/search | Search      |

# **entityControllerFindOne**

> EntityOutputDTOAPI entityControllerFindOne()

Required permissions: `READ_ENTITIES`<br> OperationId: `EntityControllerFindOne`

### Example

```typescript
import { EntityApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new EntityApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.entityControllerFindOne(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**EntityOutputDTOAPI**

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

# **entityControllerSearch**

> EntityOutputArrayDTOAPI entityControllerSearch()

Required permissions: `READ_ENTITIES`<br> OperationId: `EntityControllerSearch`

### Example

```typescript
import { EntityApi, Configuration, EntitySearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new EntityApi(configuration);

let entitySearchInputDTO: EntitySearchInputDTO; //EntitySearchInputDTO (optional)

const { status, data } = await apiInstance.entityControllerSearch(entitySearchInputDTO);
```

### Parameters

| Name                     | Type                     | Description          | Notes |
| ------------------------ | ------------------------ | -------------------- | ----- |
| **entitySearchInputDTO** | **EntitySearchInputDTO** | EntitySearchInputDTO |       |

### Return type

**EntityOutputArrayDTOAPI**

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
