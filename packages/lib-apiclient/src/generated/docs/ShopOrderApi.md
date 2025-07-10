# ShopOrderApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**shopOrderControllerCancel**](#shopordercontrollercancel) | **POST** /shop/order/{id}/cancel | Cancel|
|[**shopOrderControllerClaim**](#shopordercontrollerclaim) | **POST** /shop/order/{id}/claim | Claim an order|
|[**shopOrderControllerCreate**](#shopordercontrollercreate) | **POST** /shop/order/ | Create|
|[**shopOrderControllerGetOne**](#shopordercontrollergetone) | **GET** /shop/order/{id} | Get order by ID|
|[**shopOrderControllerSearch**](#shopordercontrollersearch) | **POST** /shop/order/search | Search orders|

# **shopOrderControllerCancel**
> ShopOrderOutputDTOAPI shopOrderControllerCancel()

<br> OperationId: `ShopOrderControllerCancel`

### Example

```typescript
import {
    ShopOrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ShopOrderApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.shopOrderControllerCancel(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ShopOrderOutputDTOAPI**

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

# **shopOrderControllerClaim**
> ShopOrderOutputDTOAPI shopOrderControllerClaim()

Claiming an order will mark it as completed and give the user the item in-game<br> OperationId: `ShopOrderControllerClaim`

### Example

```typescript
import {
    ShopOrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ShopOrderApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.shopOrderControllerClaim(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ShopOrderOutputDTOAPI**

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

# **shopOrderControllerCreate**
> ShopOrderOutputDTOAPI shopOrderControllerCreate()

<br> OperationId: `ShopOrderControllerCreate`

### Example

```typescript
import {
    ShopOrderApi,
    Configuration,
    ShopOrderCreateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new ShopOrderApi(configuration);

let shopOrderCreateDTO: ShopOrderCreateDTO; //ShopOrderCreateDTO (optional)

const { status, data } = await apiInstance.shopOrderControllerCreate(
    shopOrderCreateDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **shopOrderCreateDTO** | **ShopOrderCreateDTO**| ShopOrderCreateDTO | |


### Return type

**ShopOrderOutputDTOAPI**

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

# **shopOrderControllerGetOne**
> ShopOrderOutputDTOAPI shopOrderControllerGetOne()

Get an order by its ID. This endpoint only returns orders that belong to the caller. When the caller has permission to view all orders, they can get any order.<br> OperationId: `ShopOrderControllerGetOne`

### Example

```typescript
import {
    ShopOrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ShopOrderApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.shopOrderControllerGetOne(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ShopOrderOutputDTOAPI**

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

# **shopOrderControllerSearch**
> ShopOrderOutputArrayDTOAPI shopOrderControllerSearch()

Search for orders. By default, this endpoint only returns your own orders. When the caller has permission to view all orders, they can search for all orders.<br> OperationId: `ShopOrderControllerSearch`

### Example

```typescript
import {
    ShopOrderApi,
    Configuration,
    ShopOrderSearchInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new ShopOrderApi(configuration);

let shopOrderSearchInputDTO: ShopOrderSearchInputDTO; //ShopOrderSearchInputDTO (optional)

const { status, data } = await apiInstance.shopOrderControllerSearch(
    shopOrderSearchInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **shopOrderSearchInputDTO** | **ShopOrderSearchInputDTO**| ShopOrderSearchInputDTO | |


### Return type

**ShopOrderOutputArrayDTOAPI**

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

