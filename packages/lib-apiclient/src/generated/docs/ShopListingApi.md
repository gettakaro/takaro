# ShopListingApi

All URIs are relative to _http://localhost_

| Method                                                                          | HTTP request                  | Description     |
| ------------------------------------------------------------------------------- | ----------------------------- | --------------- |
| [**shopListingControllerCreate**](#shoplistingcontrollercreate)                 | **POST** /shop/listing/       | Create          |
| [**shopListingControllerDelete**](#shoplistingcontrollerdelete)                 | **DELETE** /shop/listing/{id} | Delete          |
| [**shopListingControllerGetOne**](#shoplistingcontrollergetone)                 | **GET** /shop/listing/{id}    | Get one         |
| [**shopListingControllerImportListings**](#shoplistingcontrollerimportlistings) | **POST** /shop/listing/import | Import listings |
| [**shopListingControllerSearch**](#shoplistingcontrollersearch)                 | **POST** /shop/listing/search | Search          |
| [**shopListingControllerUpdate**](#shoplistingcontrollerupdate)                 | **PUT** /shop/listing/{id}    | Update          |

# **shopListingControllerCreate**

> ShopListingOutputDTOAPI shopListingControllerCreate()

Required permissions: `MANAGE_SHOP_LISTINGS`<br> OperationId: `ShopListingControllerCreate`

### Example

```typescript
import { ShopListingApi, Configuration, ShopListingCreateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ShopListingApi(configuration);

let shopListingCreateDTO: ShopListingCreateDTO; //ShopListingCreateDTO (optional)

const { status, data } = await apiInstance.shopListingControllerCreate(shopListingCreateDTO);
```

### Parameters

| Name                     | Type                     | Description          | Notes |
| ------------------------ | ------------------------ | -------------------- | ----- |
| **shopListingCreateDTO** | **ShopListingCreateDTO** | ShopListingCreateDTO |       |

### Return type

**ShopListingOutputDTOAPI**

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

# **shopListingControllerDelete**

> APIOutput shopListingControllerDelete()

Required permissions: `MANAGE_SHOP_LISTINGS`<br> OperationId: `ShopListingControllerDelete`

### Example

```typescript
import { ShopListingApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ShopListingApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.shopListingControllerDelete(id);
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

# **shopListingControllerGetOne**

> ShopListingOutputDTOAPI shopListingControllerGetOne()

<br> OperationId: `ShopListingControllerGetOne`

### Example

```typescript
import { ShopListingApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ShopListingApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.shopListingControllerGetOne(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**ShopListingOutputDTOAPI**

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

# **shopListingControllerImportListings**

> APIOutput shopListingControllerImportListings()

Required permissions: `MANAGE_SHOP_LISTINGS`<br> OperationId: `ShopListingControllerImportListings`

### Example

```typescript
import { ShopListingApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ShopListingApi(configuration);

const { status, data } = await apiInstance.shopListingControllerImportListings();
```

### Parameters

This endpoint does not have any parameters.

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

# **shopListingControllerSearch**

> ShopListingOutputArrayDTOAPI shopListingControllerSearch()

<br> OperationId: `ShopListingControllerSearch`

### Example

```typescript
import { ShopListingApi, Configuration, ShopListingSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ShopListingApi(configuration);

let shopListingSearchInputDTO: ShopListingSearchInputDTO; //ShopListingSearchInputDTO (optional)

const { status, data } = await apiInstance.shopListingControllerSearch(shopListingSearchInputDTO);
```

### Parameters

| Name                          | Type                          | Description               | Notes |
| ----------------------------- | ----------------------------- | ------------------------- | ----- |
| **shopListingSearchInputDTO** | **ShopListingSearchInputDTO** | ShopListingSearchInputDTO |       |

### Return type

**ShopListingOutputArrayDTOAPI**

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

# **shopListingControllerUpdate**

> ShopListingOutputDTOAPI shopListingControllerUpdate()

Required permissions: `MANAGE_SHOP_LISTINGS`<br> OperationId: `ShopListingControllerUpdate`

### Example

```typescript
import { ShopListingApi, Configuration, ShopListingUpdateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ShopListingApi(configuration);

let id: string; // (default to undefined)
let shopListingUpdateDTO: ShopListingUpdateDTO; //ShopListingUpdateDTO (optional)

const { status, data } = await apiInstance.shopListingControllerUpdate(id, shopListingUpdateDTO);
```

### Parameters

| Name                     | Type                     | Description          | Notes                 |
| ------------------------ | ------------------------ | -------------------- | --------------------- |
| **shopListingUpdateDTO** | **ShopListingUpdateDTO** | ShopListingUpdateDTO |                       |
| **id**                   | [**string**]             |                      | defaults to undefined |

### Return type

**ShopListingOutputDTOAPI**

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
