# ModuleApi

All URIs are relative to _http://localhost_

| Method                                                                                                        | HTTP request                                                         | Description                 |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------- |
| [**moduleControllerCreate**](#modulecontrollercreate)                                                         | **POST** /module                                                     | Create module               |
| [**moduleControllerExport**](#modulecontrollerexport)                                                         | **POST** /module/{id}/export                                         | Export a module             |
| [**moduleControllerGetOne**](#modulecontrollergetone)                                                         | **GET** /module/{id}                                                 | Get one module              |
| [**moduleControllerGetTags**](#modulecontrollergettags)                                                       | **GET** /module/{id}/tags                                            | Get tags                    |
| [**moduleControllerImport**](#modulecontrollerimport)                                                         | **POST** /module/import                                              | Import a module             |
| [**moduleControllerRemove**](#modulecontrollerremove)                                                         | **DELETE** /module/{id}                                              | Remove a module             |
| [**moduleControllerSearch**](#modulecontrollersearch)                                                         | **POST** /module/search                                              | Search modules              |
| [**moduleControllerUpdate**](#modulecontrollerupdate)                                                         | **PUT** /module/{id}                                                 | Update a module             |
| [**moduleInstallationsControllerGetInstalledModules**](#moduleinstallationscontrollergetinstalledmodules)     | **POST** /module/installation/search                                 | Search module installations |
| [**moduleInstallationsControllerGetModuleInstallation**](#moduleinstallationscontrollergetmoduleinstallation) | **GET** /module/{moduleId}/gameserver/{gameServerId}/installation    | Get one installation        |
| [**moduleInstallationsControllerInstallModule**](#moduleinstallationscontrollerinstallmodule)                 | **POST** /module/installation/                                       | Install module              |
| [**moduleInstallationsControllerUninstallModule**](#moduleinstallationscontrolleruninstallmodule)             | **DELETE** /module/{moduleId}/gameserver/{gameServerId}/installation | Uninstall module            |
| [**moduleVersionControllerGetModuleVersion**](#moduleversioncontrollergetmoduleversion)                       | **GET** /module/version/{id}                                         | Get one version             |
| [**moduleVersionControllerSearchVersions**](#moduleversioncontrollersearchversions)                           | **POST** /module/version/search                                      | Search module versions      |
| [**moduleVersionControllerTagVersion**](#moduleversioncontrollertagversion)                                   | **POST** /module/version/                                            | Tag a new version           |

# **moduleControllerCreate**

> ModuleOutputDTOAPI moduleControllerCreate()

Create a new module Required permissions: `MANAGE_MODULES`<br> OperationId: `ModuleControllerCreate`

### Example

```typescript
import { ModuleApi, Configuration, ModuleCreateAPIDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let moduleCreateAPIDTO: ModuleCreateAPIDTO; //ModuleCreateAPIDTO (optional)

const { status, data } = await apiInstance.moduleControllerCreate(moduleCreateAPIDTO);
```

### Parameters

| Name                   | Type                   | Description        | Notes |
| ---------------------- | ---------------------- | ------------------ | ----- |
| **moduleCreateAPIDTO** | **ModuleCreateAPIDTO** | ModuleCreateAPIDTO |       |

### Return type

**ModuleOutputDTOAPI**

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

# **moduleControllerExport**

> ModuleExportDTOAPI moduleControllerExport()

Exports a module to a format that can be imported into another Takaro instance. This endpoint will export all known versions of the module Required permissions: `READ_MODULES`<br> OperationId: `ModuleControllerExport`

### Example

```typescript
import { ModuleApi, Configuration, ModuleExportOptionsDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let id: string; // (default to undefined)
let moduleExportOptionsDTO: ModuleExportOptionsDTO; //ModuleExportOptionsDTO (optional)

const { status, data } = await apiInstance.moduleControllerExport(id, moduleExportOptionsDTO);
```

### Parameters

| Name                       | Type                       | Description            | Notes                 |
| -------------------------- | -------------------------- | ---------------------- | --------------------- |
| **moduleExportOptionsDTO** | **ModuleExportOptionsDTO** | ModuleExportOptionsDTO |                       |
| **id**                     | [**string**]               |                        | defaults to undefined |

### Return type

**ModuleExportDTOAPI**

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

# **moduleControllerGetOne**

> ModuleOutputDTOAPI moduleControllerGetOne()

Required permissions: `READ_MODULES`<br> OperationId: `ModuleControllerGetOne`

### Example

```typescript
import { ModuleApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.moduleControllerGetOne(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**ModuleOutputDTOAPI**

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

# **moduleControllerGetTags**

> SmallModuleOutputArrayDTOAPI moduleControllerGetTags()

Get a list of all tags for a module, without including all the underlying data Required permissions: `READ_MODULES`<br> OperationId: `ModuleControllerGetTags`

### Example

```typescript
import { ModuleApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let id: string; // (default to undefined)
let page: number; // (optional) (default to undefined)
let limit: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.moduleControllerGetTags(id, page, limit);
```

### Parameters

| Name      | Type         | Description | Notes                            |
| --------- | ------------ | ----------- | -------------------------------- |
| **id**    | [**string**] |             | defaults to undefined            |
| **page**  | [**number**] |             | (optional) defaults to undefined |
| **limit** | [**number**] |             | (optional) defaults to undefined |

### Return type

**SmallModuleOutputArrayDTOAPI**

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

# **moduleControllerImport**

> moduleControllerImport()

Imports a module from a format that was exported from another Takaro instance Required permissions: `MANAGE_MODULES`<br> OperationId: `ModuleControllerImport`

### Example

```typescript
import { ModuleApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let body: any; // (optional)

const { status, data } = await apiInstance.moduleControllerImport(body);
```

### Parameters

| Name     | Type    | Description | Notes |
| -------- | ------- | ----------- | ----- |
| **body** | **any** |             |       |

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

# **moduleControllerRemove**

> APIOutput moduleControllerRemove()

Removes a module, including all versions and config Required permissions: `MANAGE_MODULES`<br> OperationId: `ModuleControllerRemove`

### Example

```typescript
import { ModuleApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.moduleControllerRemove(id);
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

# **moduleControllerSearch**

> ModuleOutputArrayDTOAPI moduleControllerSearch()

Required permissions: `READ_MODULES`<br> OperationId: `ModuleControllerSearch`

### Example

```typescript
import { ModuleApi, Configuration, ModuleSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let moduleSearchInputDTO: ModuleSearchInputDTO; //ModuleSearchInputDTO (optional)

const { status, data } = await apiInstance.moduleControllerSearch(moduleSearchInputDTO);
```

### Parameters

| Name                     | Type                     | Description          | Notes |
| ------------------------ | ------------------------ | -------------------- | ----- |
| **moduleSearchInputDTO** | **ModuleSearchInputDTO** | ModuleSearchInputDTO |       |

### Return type

**ModuleOutputArrayDTOAPI**

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

# **moduleControllerUpdate**

> ModuleOutputDTOAPI moduleControllerUpdate()

Update a module Required permissions: `MANAGE_MODULES`<br> OperationId: `ModuleControllerUpdate`

### Example

```typescript
import { ModuleApi, Configuration, ModuleUpdateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let id: string; // (default to undefined)
let moduleUpdateDTO: ModuleUpdateDTO; //ModuleUpdateDTO (optional)

const { status, data } = await apiInstance.moduleControllerUpdate(id, moduleUpdateDTO);
```

### Parameters

| Name                | Type                | Description     | Notes                 |
| ------------------- | ------------------- | --------------- | --------------------- |
| **moduleUpdateDTO** | **ModuleUpdateDTO** | ModuleUpdateDTO |                       |
| **id**              | [**string**]        |                 | defaults to undefined |

### Return type

**ModuleOutputDTOAPI**

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

# **moduleInstallationsControllerGetInstalledModules**

> ModuleInstallationOutputArrayDTOAPI moduleInstallationsControllerGetInstalledModules()

Required permissions: `READ_MODULES`<br> OperationId: `ModuleInstallationsControllerGetInstalledModules`

### Example

```typescript
import { ModuleApi, Configuration, ModuleInstallationSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let moduleInstallationSearchInputDTO: ModuleInstallationSearchInputDTO; //ModuleInstallationSearchInputDTO (optional)

const { status, data } = await apiInstance.moduleInstallationsControllerGetInstalledModules(
  moduleInstallationSearchInputDTO,
);
```

### Parameters

| Name                                 | Type                                 | Description                      | Notes |
| ------------------------------------ | ------------------------------------ | -------------------------------- | ----- |
| **moduleInstallationSearchInputDTO** | **ModuleInstallationSearchInputDTO** | ModuleInstallationSearchInputDTO |       |

### Return type

**ModuleInstallationOutputArrayDTOAPI**

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

# **moduleInstallationsControllerGetModuleInstallation**

> ModuleInstallationOutputDTOAPI moduleInstallationsControllerGetModuleInstallation()

Required permissions: `READ_MODULES`<br> OperationId: `ModuleInstallationsControllerGetModuleInstallation`

### Example

```typescript
import { ModuleApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let moduleId: string; // (default to undefined)
let gameServerId: string; // (default to undefined)

const { status, data } = await apiInstance.moduleInstallationsControllerGetModuleInstallation(moduleId, gameServerId);
```

### Parameters

| Name             | Type         | Description | Notes                 |
| ---------------- | ------------ | ----------- | --------------------- |
| **moduleId**     | [**string**] |             | defaults to undefined |
| **gameServerId** | [**string**] |             | defaults to undefined |

### Return type

**ModuleInstallationOutputDTOAPI**

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

# **moduleInstallationsControllerInstallModule**

> ModuleInstallationOutputDTOAPI moduleInstallationsControllerInstallModule()

Install a module on a gameserver. You can have multiple installations of the same module on the same gameserver. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `ModuleInstallationsControllerInstallModule`

### Example

```typescript
import { ModuleApi, Configuration, InstallModuleDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let installModuleDTO: InstallModuleDTO; //InstallModuleDTO (optional)

const { status, data } = await apiInstance.moduleInstallationsControllerInstallModule(installModuleDTO);
```

### Parameters

| Name                 | Type                 | Description      | Notes |
| -------------------- | -------------------- | ---------------- | ----- |
| **installModuleDTO** | **InstallModuleDTO** | InstallModuleDTO |       |

### Return type

**ModuleInstallationOutputDTOAPI**

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

# **moduleInstallationsControllerUninstallModule**

> ModuleInstallationOutputDTOAPI moduleInstallationsControllerUninstallModule()

Uninstall a module from a gameserver. This will not delete the module from the database. Required permissions: `MANAGE_GAMESERVERS`<br> OperationId: `ModuleInstallationsControllerUninstallModule`

### Example

```typescript
import { ModuleApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let moduleId: string; // (default to undefined)
let gameServerId: string; // (default to undefined)

const { status, data } = await apiInstance.moduleInstallationsControllerUninstallModule(moduleId, gameServerId);
```

### Parameters

| Name             | Type         | Description | Notes                 |
| ---------------- | ------------ | ----------- | --------------------- |
| **moduleId**     | [**string**] |             | defaults to undefined |
| **gameServerId** | [**string**] |             | defaults to undefined |

### Return type

**ModuleInstallationOutputDTOAPI**

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

# **moduleVersionControllerGetModuleVersion**

> ModuleVersionOutputDTOAPI moduleVersionControllerGetModuleVersion()

Required permissions: `READ_MODULES`<br> OperationId: `ModuleVersionControllerGetModuleVersion`

### Example

```typescript
import { ModuleApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.moduleVersionControllerGetModuleVersion(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**ModuleVersionOutputDTOAPI**

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

# **moduleVersionControllerSearchVersions**

> ModuleVersionOutputArrayDTOAPI moduleVersionControllerSearchVersions()

Required permissions: `READ_MODULES`<br> OperationId: `ModuleVersionControllerSearchVersions`

### Example

```typescript
import { ModuleApi, Configuration, ModuleVersionSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let moduleVersionSearchInputDTO: ModuleVersionSearchInputDTO; //ModuleVersionSearchInputDTO (optional)

const { status, data } = await apiInstance.moduleVersionControllerSearchVersions(moduleVersionSearchInputDTO);
```

### Parameters

| Name                            | Type                            | Description                 | Notes |
| ------------------------------- | ------------------------------- | --------------------------- | ----- |
| **moduleVersionSearchInputDTO** | **ModuleVersionSearchInputDTO** | ModuleVersionSearchInputDTO |       |

### Return type

**ModuleVersionOutputArrayDTOAPI**

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

# **moduleVersionControllerTagVersion**

> ModuleVersionOutputDTOAPI moduleVersionControllerTagVersion()

Creates a new version of a module, copying all config (commands,hooks,cronjobs,...) from the \"latest\" version into a new, immutable version Required permissions: `MANAGE_MODULES`<br> OperationId: `ModuleVersionControllerTagVersion`

### Example

```typescript
import { ModuleApi, Configuration, ModuleVersionCreateAPIDTO } from './api';

const configuration = new Configuration();
const apiInstance = new ModuleApi(configuration);

let moduleVersionCreateAPIDTO: ModuleVersionCreateAPIDTO; //ModuleVersionCreateAPIDTO (optional)

const { status, data } = await apiInstance.moduleVersionControllerTagVersion(moduleVersionCreateAPIDTO);
```

### Parameters

| Name                          | Type                          | Description               | Notes |
| ----------------------------- | ----------------------------- | ------------------------- | ----- |
| **moduleVersionCreateAPIDTO** | **ModuleVersionCreateAPIDTO** | ModuleVersionCreateAPIDTO |       |

### Return type

**ModuleVersionOutputDTOAPI**

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
