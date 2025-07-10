# CommandApi

All URIs are relative to _http://localhost_

| Method                                                                  | HTTP request                      | Description     |
| ----------------------------------------------------------------------- | --------------------------------- | --------------- |
| [**commandControllerCreate**](#commandcontrollercreate)                 | **POST** /command                 | Create          |
| [**commandControllerCreateArgument**](#commandcontrollercreateargument) | **POST** /command/argument        | Create argument |
| [**commandControllerGetExecutions**](#commandcontrollergetexecutions)   | **POST** /command/{id}/executions | Get executions  |
| [**commandControllerGetOne**](#commandcontrollergetone)                 | **GET** /command/{id}             | Get one         |
| [**commandControllerRemove**](#commandcontrollerremove)                 | **DELETE** /command/{id}          | Remove          |
| [**commandControllerRemoveArgument**](#commandcontrollerremoveargument) | **DELETE** /command/argument/{id} | Remove argument |
| [**commandControllerSearch**](#commandcontrollersearch)                 | **POST** /command/search          | Search          |
| [**commandControllerTrigger**](#commandcontrollertrigger)               | **POST** /command/{id}/trigger    | Trigger         |
| [**commandControllerUpdate**](#commandcontrollerupdate)                 | **PUT** /command/{id}             | Update          |
| [**commandControllerUpdateArgument**](#commandcontrollerupdateargument) | **PUT** /command/argument/{id}    | Update argument |

# **commandControllerCreate**

> CommandOutputDTOAPI commandControllerCreate()

Required permissions: `MANAGE_MODULES`<br> OperationId: `CommandControllerCreate`

### Example

```typescript
import { CommandApi, Configuration, CommandCreateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new CommandApi(configuration);

let commandCreateDTO: CommandCreateDTO; //CommandCreateDTO (optional)

const { status, data } = await apiInstance.commandControllerCreate(commandCreateDTO);
```

### Parameters

| Name                 | Type                 | Description      | Notes |
| -------------------- | -------------------- | ---------------- | ----- |
| **commandCreateDTO** | **CommandCreateDTO** | CommandCreateDTO |       |

### Return type

**CommandOutputDTOAPI**

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

# **commandControllerCreateArgument**

> CommandArgumentDTOAPI commandControllerCreateArgument()

Required permissions: `MANAGE_MODULES`<br> OperationId: `CommandControllerCreateArgument`

### Example

```typescript
import { CommandApi, Configuration, CommandArgumentCreateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new CommandApi(configuration);

let commandArgumentCreateDTO: CommandArgumentCreateDTO; //CommandArgumentCreateDTO (optional)

const { status, data } = await apiInstance.commandControllerCreateArgument(commandArgumentCreateDTO);
```

### Parameters

| Name                         | Type                         | Description              | Notes |
| ---------------------------- | ---------------------------- | ------------------------ | ----- |
| **commandArgumentCreateDTO** | **CommandArgumentCreateDTO** | CommandArgumentCreateDTO |       |

### Return type

**CommandArgumentDTOAPI**

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

# **commandControllerGetExecutions**

> EventOutputArrayDTOAPI commandControllerGetExecutions()

Required permissions: `READ_MODULES`<br> OperationId: `CommandControllerGetExecutions`

### Example

```typescript
import { CommandApi, Configuration, EventSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new CommandApi(configuration);

let id: string; // (default to undefined)
let success: any; // (optional) (default to undefined)
let eventSearchInputDTO: EventSearchInputDTO; //EventSearchInputDTO (optional)

const { status, data } = await apiInstance.commandControllerGetExecutions(id, success, eventSearchInputDTO);
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

# **commandControllerGetOne**

> CommandOutputDTOAPI commandControllerGetOne()

Required permissions: `READ_MODULES`<br> OperationId: `CommandControllerGetOne`

### Example

```typescript
import { CommandApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new CommandApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.commandControllerGetOne(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**CommandOutputDTOAPI**

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

# **commandControllerRemove**

> APIOutput commandControllerRemove()

Required permissions: `MANAGE_MODULES`<br> OperationId: `CommandControllerRemove`

### Example

```typescript
import { CommandApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new CommandApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.commandControllerRemove(id);
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

# **commandControllerRemoveArgument**

> APIOutput commandControllerRemoveArgument()

Required permissions: `MANAGE_MODULES`<br> OperationId: `CommandControllerRemoveArgument`

### Example

```typescript
import { CommandApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new CommandApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.commandControllerRemoveArgument(id);
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

# **commandControllerSearch**

> CommandOutputArrayDTOAPI commandControllerSearch()

Required permissions: `READ_MODULES`<br> OperationId: `CommandControllerSearch`

### Example

```typescript
import { CommandApi, Configuration, CommandSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new CommandApi(configuration);

let commandSearchInputDTO: CommandSearchInputDTO; //CommandSearchInputDTO (optional)

const { status, data } = await apiInstance.commandControllerSearch(commandSearchInputDTO);
```

### Parameters

| Name                      | Type                      | Description           | Notes |
| ------------------------- | ------------------------- | --------------------- | ----- |
| **commandSearchInputDTO** | **CommandSearchInputDTO** | CommandSearchInputDTO |       |

### Return type

**CommandOutputArrayDTOAPI**

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

# **commandControllerTrigger**

> commandControllerTrigger()

Required permissions: `MANAGE_MODULES`<br> OperationId: `CommandControllerTrigger`

### Example

```typescript
import { CommandApi, Configuration, CommandTriggerDTO } from './api';

const configuration = new Configuration();
const apiInstance = new CommandApi(configuration);

let id: string; // (default to undefined)
let commandTriggerDTO: CommandTriggerDTO; //CommandTriggerDTO (optional)

const { status, data } = await apiInstance.commandControllerTrigger(id, commandTriggerDTO);
```

### Parameters

| Name                  | Type                  | Description       | Notes                 |
| --------------------- | --------------------- | ----------------- | --------------------- |
| **commandTriggerDTO** | **CommandTriggerDTO** | CommandTriggerDTO |                       |
| **id**                | [**string**]          |                   | defaults to undefined |

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

# **commandControllerUpdate**

> CommandOutputDTOAPI commandControllerUpdate()

Required permissions: `MANAGE_MODULES`<br> OperationId: `CommandControllerUpdate`

### Example

```typescript
import { CommandApi, Configuration, CommandUpdateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new CommandApi(configuration);

let id: string; // (default to undefined)
let commandUpdateDTO: CommandUpdateDTO; //CommandUpdateDTO (optional)

const { status, data } = await apiInstance.commandControllerUpdate(id, commandUpdateDTO);
```

### Parameters

| Name                 | Type                 | Description      | Notes                 |
| -------------------- | -------------------- | ---------------- | --------------------- |
| **commandUpdateDTO** | **CommandUpdateDTO** | CommandUpdateDTO |                       |
| **id**               | [**string**]         |                  | defaults to undefined |

### Return type

**CommandOutputDTOAPI**

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

# **commandControllerUpdateArgument**

> CommandArgumentDTOAPI commandControllerUpdateArgument()

Required permissions: `MANAGE_MODULES`<br> OperationId: `CommandControllerUpdateArgument`

### Example

```typescript
import { CommandApi, Configuration, CommandArgumentUpdateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new CommandApi(configuration);

let id: string; // (default to undefined)
let commandArgumentUpdateDTO: CommandArgumentUpdateDTO; //CommandArgumentUpdateDTO (optional)

const { status, data } = await apiInstance.commandControllerUpdateArgument(id, commandArgumentUpdateDTO);
```

### Parameters

| Name                         | Type                         | Description              | Notes                 |
| ---------------------------- | ---------------------------- | ------------------------ | --------------------- |
| **commandArgumentUpdateDTO** | **CommandArgumentUpdateDTO** | CommandArgumentUpdateDTO |                       |
| **id**                       | [**string**]                 |                          | defaults to undefined |

### Return type

**CommandArgumentDTOAPI**

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
