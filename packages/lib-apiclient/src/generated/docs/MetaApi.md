# MetaApi

All URIs are relative to _http://localhost_

| Method                                        | HTTP request          | Description       |
| --------------------------------------------- | --------------------- | ----------------- |
| [**metaGetHealth**](#metagethealth)           | **GET** /healthz      | Get health        |
| [**metaGetMetrics**](#metagetmetrics)         | **GET** /metrics      | Get metrics       |
| [**metaGetOpenApi**](#metagetopenapi)         | **GET** /openapi.json | Get open api      |
| [**metaGetOpenApiHtml**](#metagetopenapihtml) | **GET** /api.html     | Get open api html |
| [**metaGetReadiness**](#metagetreadiness)     | **GET** /readyz       | Get readiness     |
| [**metaGetRoot**](#metagetroot)               | **GET** /             | Get root          |

# **metaGetHealth**

> HealthOutputDTO metaGetHealth()

<br> OperationId: `MetaGetHealth`

### Example

```typescript
import { MetaApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new MetaApi(configuration);

const { status, data } = await apiInstance.metaGetHealth();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**HealthOutputDTO**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/html; charset=utf-8

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **metaGetMetrics**

> metaGetMetrics()

<br> OperationId: `MetaGetMetrics`

### Example

```typescript
import { MetaApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new MetaApi(configuration);

const { status, data } = await apiInstance.metaGetMetrics();
```

### Parameters

This endpoint does not have any parameters.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/html; charset=utf-8

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **metaGetOpenApi**

> metaGetOpenApi()

<br> OperationId: `MetaGetOpenApi`

### Example

```typescript
import { MetaApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new MetaApi(configuration);

const { status, data } = await apiInstance.metaGetOpenApi();
```

### Parameters

This endpoint does not have any parameters.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/html; charset=utf-8

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **metaGetOpenApiHtml**

> metaGetOpenApiHtml()

<br> OperationId: `MetaGetOpenApiHtml`

### Example

```typescript
import { MetaApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new MetaApi(configuration);

const { status, data } = await apiInstance.metaGetOpenApiHtml();
```

### Parameters

This endpoint does not have any parameters.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/html; charset=utf-8

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **metaGetReadiness**

> HealthOutputDTO metaGetReadiness()

<br> OperationId: `MetaGetReadiness`

### Example

```typescript
import { MetaApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new MetaApi(configuration);

const { status, data } = await apiInstance.metaGetReadiness();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**HealthOutputDTO**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/html; charset=utf-8

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **metaGetRoot**

> metaGetRoot()

<br> OperationId: `MetaGetRoot`

### Example

```typescript
import { MetaApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new MetaApi(configuration);

const { status, data } = await apiInstance.metaGetRoot();
```

### Parameters

This endpoint does not have any parameters.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/html; charset=utf-8

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
