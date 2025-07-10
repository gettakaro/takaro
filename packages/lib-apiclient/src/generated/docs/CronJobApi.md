# CronJobApi

All URIs are relative to _http://localhost_

| Method                                                                | HTTP request                      | Description    |
| --------------------------------------------------------------------- | --------------------------------- | -------------- |
| [**cronJobControllerCreate**](#cronjobcontrollercreate)               | **POST** /cronjob                 | Create         |
| [**cronJobControllerGetExecutions**](#cronjobcontrollergetexecutions) | **POST** /cronjob/{id}/executions | Get executions |
| [**cronJobControllerGetOne**](#cronjobcontrollergetone)               | **GET** /cronjob/{id}             | Get one        |
| [**cronJobControllerRemove**](#cronjobcontrollerremove)               | **DELETE** /cronjob/{id}          | Remove         |
| [**cronJobControllerSearch**](#cronjobcontrollersearch)               | **POST** /cronjob/search          | Search         |
| [**cronJobControllerTrigger**](#cronjobcontrollertrigger)             | **POST** /cronjob/trigger         | Trigger        |
| [**cronJobControllerUpdate**](#cronjobcontrollerupdate)               | **PUT** /cronjob/{id}             | Update         |

# **cronJobControllerCreate**

> CronJobOutputDTOAPI cronJobControllerCreate()

Required permissions: `MANAGE_MODULES`<br> OperationId: `CronJobControllerCreate`

### Example

```typescript
import { CronJobApi, Configuration, CronJobCreateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new CronJobApi(configuration);

let cronJobCreateDTO: CronJobCreateDTO; //CronJobCreateDTO (optional)

const { status, data } = await apiInstance.cronJobControllerCreate(cronJobCreateDTO);
```

### Parameters

| Name                 | Type                 | Description      | Notes |
| -------------------- | -------------------- | ---------------- | ----- |
| **cronJobCreateDTO** | **CronJobCreateDTO** | CronJobCreateDTO |       |

### Return type

**CronJobOutputDTOAPI**

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

# **cronJobControllerGetExecutions**

> EventOutputArrayDTOAPI cronJobControllerGetExecutions()

Required permissions: `READ_MODULES`<br> OperationId: `CronJobControllerGetExecutions`

### Example

```typescript
import { CronJobApi, Configuration, EventSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new CronJobApi(configuration);

let id: string; // (default to undefined)
let success: any; // (optional) (default to undefined)
let eventSearchInputDTO: EventSearchInputDTO; //EventSearchInputDTO (optional)

const { status, data } = await apiInstance.cronJobControllerGetExecutions(id, success, eventSearchInputDTO);
```

### Parameters

| Name                    | Type                    | Description         | Notes                            |
| ----------------------- | ----------------------- | ------------------- | -------------------------------- |
| **eventSearchInputDTO** | **EventSearchInputDTO** | EventSearchInputDTO |                                  |
| **id**                  | [**string**]            |                     | defaults to undefined            |
| **success**             | **any**                 |                     | (optional) defaults to undefined |

### Return type

**EventOutputArrayDTOAPI**

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

# **cronJobControllerGetOne**

> CronJobOutputDTOAPI cronJobControllerGetOne()

Required permissions: `READ_MODULES`<br> OperationId: `CronJobControllerGetOne`

### Example

```typescript
import { CronJobApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new CronJobApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.cronJobControllerGetOne(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**CronJobOutputDTOAPI**

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

# **cronJobControllerRemove**

> APIOutput cronJobControllerRemove()

Required permissions: `MANAGE_MODULES`<br> OperationId: `CronJobControllerRemove`

### Example

```typescript
import { CronJobApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new CronJobApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.cronJobControllerRemove(id);
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

# **cronJobControllerSearch**

> CronJobOutputArrayDTOAPI cronJobControllerSearch()

Required permissions: `READ_MODULES`<br> OperationId: `CronJobControllerSearch`

### Example

```typescript
import { CronJobApi, Configuration, CronJobSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new CronJobApi(configuration);

let cronJobSearchInputDTO: CronJobSearchInputDTO; //CronJobSearchInputDTO (optional)

const { status, data } = await apiInstance.cronJobControllerSearch(cronJobSearchInputDTO);
```

### Parameters

| Name                      | Type                      | Description           | Notes |
| ------------------------- | ------------------------- | --------------------- | ----- |
| **cronJobSearchInputDTO** | **CronJobSearchInputDTO** | CronJobSearchInputDTO |       |

### Return type

**CronJobOutputArrayDTOAPI**

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

# **cronJobControllerTrigger**

> cronJobControllerTrigger()

Required permissions: `MANAGE_MODULES`<br> OperationId: `CronJobControllerTrigger`

### Example

```typescript
import { CronJobApi, Configuration, CronJobTriggerDTO } from './api';

const configuration = new Configuration();
const apiInstance = new CronJobApi(configuration);

let cronJobTriggerDTO: CronJobTriggerDTO; //CronJobTriggerDTO (optional)

const { status, data } = await apiInstance.cronJobControllerTrigger(cronJobTriggerDTO);
```

### Parameters

| Name                  | Type                  | Description       | Notes |
| --------------------- | --------------------- | ----------------- | ----- |
| **cronJobTriggerDTO** | **CronJobTriggerDTO** | CronJobTriggerDTO |       |

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

# **cronJobControllerUpdate**

> CronJobOutputDTOAPI cronJobControllerUpdate()

Required permissions: `MANAGE_MODULES`<br> OperationId: `CronJobControllerUpdate`

### Example

```typescript
import { CronJobApi, Configuration, CronJobUpdateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new CronJobApi(configuration);

let id: string; // (default to undefined)
let cronJobUpdateDTO: CronJobUpdateDTO; //CronJobUpdateDTO (optional)

const { status, data } = await apiInstance.cronJobControllerUpdate(id, cronJobUpdateDTO);
```

### Parameters

| Name                 | Type                 | Description      | Notes                 |
| -------------------- | -------------------- | ---------------- | --------------------- |
| **cronJobUpdateDTO** | **CronJobUpdateDTO** | CronJobUpdateDTO |                       |
| **id**               | [**string**]         |                  | defaults to undefined |

### Return type

**CronJobOutputDTOAPI**

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
