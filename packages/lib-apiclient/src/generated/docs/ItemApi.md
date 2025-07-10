# ItemApi

All URIs are relative to _http://localhost_

| Method                                              | HTTP request           | Description |
| --------------------------------------------------- | ---------------------- | ----------- |
| [**itemControllerFindOne**](#itemcontrollerfindone) | **GET** /items/{id}    | Find one    |
| [**itemControllerSearch**](#itemcontrollersearch)   | **POST** /items/search | Search      |

# **itemControllerFindOne**

> ItemOutputDTOAPI itemControllerFindOne()

Required permissions: `READ_ITEMS`<br> OperationId: `ItemControllerFindOne`

### Example

```typescript
import { ItemApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ItemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.itemControllerFindOne(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**ItemOutputDTOAPI**

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

# **itemControllerSearch**

> ItemOutputArrayDTOAPI itemControllerSearch()

Required permissions: `READ_ITEMS`<br> OperationId: `ItemControllerSearch`

### Example

```typescript
import { ItemApi, Configuration, ItemSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ItemApi(configuration);

let itemSearchInputDTO: ItemSearchInputDTO; //ItemSearchInputDTO (optional)

const { status, data } = await apiInstance.itemControllerSearch(itemSearchInputDTO);
```

### Parameters

| Name                   | Type                   | Description        | Notes |
| ---------------------- | ---------------------- | ------------------ | ----- |
| **itemSearchInputDTO** | **ItemSearchInputDTO** | ItemSearchInputDTO |       |

### Return type

**ItemOutputArrayDTOAPI**

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
