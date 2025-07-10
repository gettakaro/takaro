# ShopCategoryApi

All URIs are relative to _http://localhost_

| Method                                                                    | HTTP request                        | Description |
| ------------------------------------------------------------------------- | ----------------------------------- | ----------- |
| [**shopCategoryControllerBulkAssign**](#shopcategorycontrollerbulkassign) | **POST** /shop/category/bulk-assign | Bulk assign |
| [**shopCategoryControllerCreate**](#shopcategorycontrollercreate)         | **POST** /shop/category/            | Create      |
| [**shopCategoryControllerGetAll**](#shopcategorycontrollergetall)         | **GET** /shop/category/             | Get all     |
| [**shopCategoryControllerGetOne**](#shopcategorycontrollergetone)         | **GET** /shop/category/{id}         | Get one     |
| [**shopCategoryControllerMove**](#shopcategorycontrollermove)             | **POST** /shop/category/{id}/move   | Move        |
| [**shopCategoryControllerRemove**](#shopcategorycontrollerremove)         | **DELETE** /shop/category/{id}      | Remove      |
| [**shopCategoryControllerSearch**](#shopcategorycontrollersearch)         | **POST** /shop/category/search      | Search      |
| [**shopCategoryControllerUpdate**](#shopcategorycontrollerupdate)         | **PUT** /shop/category/{id}         | Update      |

# **shopCategoryControllerBulkAssign**

> shopCategoryControllerBulkAssign()

Bulk assign categories to multiple shop listings Required permissions: `MANAGE_SHOP_LISTINGS`<br> OperationId: `ShopCategoryControllerBulkAssign`

### Example

```typescript
import { ShopCategoryApi, Configuration, ShopCategoryBulkAssignDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ShopCategoryApi(configuration);

let shopCategoryBulkAssignDTO: ShopCategoryBulkAssignDTO; //ShopCategoryBulkAssignDTO (optional)

const { status, data } = await apiInstance.shopCategoryControllerBulkAssign(shopCategoryBulkAssignDTO);
```

### Parameters

| Name                          | Type                          | Description               | Notes |
| ----------------------------- | ----------------------------- | ------------------------- | ----- |
| **shopCategoryBulkAssignDTO** | **ShopCategoryBulkAssignDTO** | ShopCategoryBulkAssignDTO |       |

### Return type

void (empty response body)

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **shopCategoryControllerCreate**

> ShopCategoryOutputDTOAPI shopCategoryControllerCreate()

Create a new shop category Required permissions: `MANAGE_SHOP_LISTINGS`<br> OperationId: `ShopCategoryControllerCreate`

### Example

```typescript
import { ShopCategoryApi, Configuration, ShopCategoryCreateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ShopCategoryApi(configuration);

let shopCategoryCreateDTO: ShopCategoryCreateDTO; //ShopCategoryCreateDTO (optional)

const { status, data } = await apiInstance.shopCategoryControllerCreate(shopCategoryCreateDTO);
```

### Parameters

| Name                      | Type                      | Description           | Notes |
| ------------------------- | ------------------------- | --------------------- | ----- |
| **shopCategoryCreateDTO** | **ShopCategoryCreateDTO** | ShopCategoryCreateDTO |       |

### Return type

**ShopCategoryOutputDTOAPI**

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

# **shopCategoryControllerGetAll**

> ShopCategoryOutputArrayDTOAPI shopCategoryControllerGetAll()

Get all shop categories<br> OperationId: `ShopCategoryControllerGetAll`

### Example

```typescript
import { ShopCategoryApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ShopCategoryApi(configuration);

const { status, data } = await apiInstance.shopCategoryControllerGetAll();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**ShopCategoryOutputArrayDTOAPI**

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

# **shopCategoryControllerGetOne**

> ShopCategoryOutputDTOAPI shopCategoryControllerGetOne()

Get a shop category by id<br> OperationId: `ShopCategoryControllerGetOne`

### Example

```typescript
import { ShopCategoryApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ShopCategoryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.shopCategoryControllerGetOne(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**ShopCategoryOutputDTOAPI**

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

# **shopCategoryControllerMove**

> ShopCategoryOutputDTOAPI shopCategoryControllerMove()

Move a shop category to a different parent Required permissions: `MANAGE_SHOP_LISTINGS`<br> OperationId: `ShopCategoryControllerMove`

### Example

```typescript
import { ShopCategoryApi, Configuration, ShopCategoryMoveDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ShopCategoryApi(configuration);

let id: string; // (default to undefined)
let shopCategoryMoveDTO: ShopCategoryMoveDTO; //ShopCategoryMoveDTO (optional)

const { status, data } = await apiInstance.shopCategoryControllerMove(id, shopCategoryMoveDTO);
```

### Parameters

| Name                    | Type                    | Description         | Notes                 |
| ----------------------- | ----------------------- | ------------------- | --------------------- |
| **shopCategoryMoveDTO** | **ShopCategoryMoveDTO** | ShopCategoryMoveDTO |                       |
| **id**                  | [**string**]            |                     | defaults to undefined |

### Return type

**ShopCategoryOutputDTOAPI**

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

# **shopCategoryControllerRemove**

> shopCategoryControllerRemove()

Delete a shop category Required permissions: `MANAGE_SHOP_LISTINGS`<br> OperationId: `ShopCategoryControllerRemove`

### Example

```typescript
import { ShopCategoryApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ShopCategoryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.shopCategoryControllerRemove(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[domainAuth](../README.md#domainAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **shopCategoryControllerSearch**

> ShopCategoryOutputArrayDTOAPI shopCategoryControllerSearch()

Search shop categories<br> OperationId: `ShopCategoryControllerSearch`

### Example

```typescript
import { ShopCategoryApi, Configuration, ShopCategorySearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ShopCategoryApi(configuration);

let shopCategorySearchInputDTO: ShopCategorySearchInputDTO; //ShopCategorySearchInputDTO (optional)

const { status, data } = await apiInstance.shopCategoryControllerSearch(shopCategorySearchInputDTO);
```

### Parameters

| Name                           | Type                           | Description                | Notes |
| ------------------------------ | ------------------------------ | -------------------------- | ----- |
| **shopCategorySearchInputDTO** | **ShopCategorySearchInputDTO** | ShopCategorySearchInputDTO |       |

### Return type

**ShopCategoryOutputArrayDTOAPI**

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

# **shopCategoryControllerUpdate**

> ShopCategoryOutputDTOAPI shopCategoryControllerUpdate()

Update a shop category Required permissions: `MANAGE_SHOP_LISTINGS`<br> OperationId: `ShopCategoryControllerUpdate`

### Example

```typescript
import { ShopCategoryApi, Configuration, ShopCategoryUpdateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ShopCategoryApi(configuration);

let id: string; // (default to undefined)
let shopCategoryUpdateDTO: ShopCategoryUpdateDTO; //ShopCategoryUpdateDTO (optional)

const { status, data } = await apiInstance.shopCategoryControllerUpdate(id, shopCategoryUpdateDTO);
```

### Parameters

| Name                      | Type                      | Description           | Notes                 |
| ------------------------- | ------------------------- | --------------------- | --------------------- |
| **shopCategoryUpdateDTO** | **ShopCategoryUpdateDTO** | ShopCategoryUpdateDTO |                       |
| **id**                    | [**string**]              |                       | defaults to undefined |

### Return type

**ShopCategoryOutputDTOAPI**

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
