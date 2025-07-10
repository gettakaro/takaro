# PlayerApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**banControllerCreate**](#bancontrollercreate) | **POST** /player/ban | Ban player|
|[**banControllerDelete**](#bancontrollerdelete) | **DELETE** /player/ban/{id} | Unban player|
|[**banControllerGetOne**](#bancontrollergetone) | **GET** /player/ban/{id} | Get a single ban|
|[**banControllerSearch**](#bancontrollersearch) | **POST** /player/ban/search | Search for bans|
|[**banControllerUpdate**](#bancontrollerupdate) | **PUT** /player/ban/{id} | Update ban|
|[**playerControllerAssignRole**](#playercontrollerassignrole) | **POST** /player/{id}/role/{roleId} | Assign role|
|[**playerControllerGetMe**](#playercontrollergetme) | **GET** /player/me | Get current player|
|[**playerControllerGetOne**](#playercontrollergetone) | **GET** /player/{id} | Get one|
|[**playerControllerRemoveRole**](#playercontrollerremoverole) | **DELETE** /player/{id}/role/{roleId} | Remove role|
|[**playerControllerSearch**](#playercontrollersearch) | **POST** /player/search | Search|

# **banControllerCreate**
> BanOutputDTOAPI banControllerCreate()

Create a new ban, creating a ban via the API will always make it takaro managed.   Required permissions: `MANAGE_PLAYERS`<br> OperationId: `BanControllerCreate`

### Example

```typescript
import {
    PlayerApi,
    Configuration,
    BanCreateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

let banCreateDTO: BanCreateDTO; //BanCreateDTO (optional)

const { status, data } = await apiInstance.banControllerCreate(
    banCreateDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **banCreateDTO** | **BanCreateDTO**| BanCreateDTO | |


### Return type

**BanOutputDTOAPI**

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

# **banControllerDelete**
> APIOutput banControllerDelete()

Unban player. This will remove the ban from Takaro and the gameserver(s)   Required permissions: `MANAGE_PLAYERS`<br> OperationId: `BanControllerDelete`

### Example

```typescript
import {
    PlayerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.banControllerDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**APIOutput**

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

# **banControllerGetOne**
> BanOutputDTOAPI banControllerGetOne()

Get a single ban   Required permissions: `READ_PLAYERS`<br> OperationId: `BanControllerGetOne`

### Example

```typescript
import {
    PlayerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.banControllerGetOne(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BanOutputDTOAPI**

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

# **banControllerSearch**
> BanOutputArrayDTOAPI banControllerSearch()

Search for bans   Required permissions: `READ_PLAYERS`<br> OperationId: `BanControllerSearch`

### Example

```typescript
import {
    PlayerApi,
    Configuration,
    BanSearchInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

let banSearchInputDTO: BanSearchInputDTO; //BanSearchInputDTO (optional)

const { status, data } = await apiInstance.banControllerSearch(
    banSearchInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **banSearchInputDTO** | **BanSearchInputDTO**| BanSearchInputDTO | |


### Return type

**BanOutputArrayDTOAPI**

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

# **banControllerUpdate**
> BanOutputDTOAPI banControllerUpdate()

Update an existing ban, updating a ban via the API will always make it takaro managed.   Required permissions: `MANAGE_PLAYERS`<br> OperationId: `BanControllerUpdate`

### Example

```typescript
import {
    PlayerApi,
    Configuration,
    BanUpdateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

let id: string; // (default to undefined)
let banUpdateDTO: BanUpdateDTO; //BanUpdateDTO (optional)

const { status, data } = await apiInstance.banControllerUpdate(
    id,
    banUpdateDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **banUpdateDTO** | **BanUpdateDTO**| BanUpdateDTO | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BanOutputDTOAPI**

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

# **playerControllerAssignRole**
> APIOutput playerControllerAssignRole()

   Required permissions: `MANAGE_PLAYERS`, `MANAGE_ROLES`<br> OperationId: `PlayerControllerAssignRole`

### Example

```typescript
import {
    PlayerApi,
    Configuration,
    PlayerRoleAssignChangeDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

let id: string; // (default to undefined)
let roleId: string; // (default to undefined)
let playerRoleAssignChangeDTO: PlayerRoleAssignChangeDTO; //PlayerRoleAssignChangeDTO (optional)

const { status, data } = await apiInstance.playerControllerAssignRole(
    id,
    roleId,
    playerRoleAssignChangeDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **playerRoleAssignChangeDTO** | **PlayerRoleAssignChangeDTO**| PlayerRoleAssignChangeDTO | |
| **id** | [**string**] |  | defaults to undefined|
| **roleId** | [**string**] |  | defaults to undefined|


### Return type

**APIOutput**

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

# **playerControllerGetMe**
> PlayerMeOutputDTO playerControllerGetMe()

Get the player that is currently authenticated. This is a low-privilege route, returning limited data.<br> OperationId: `PlayerControllerGetMe`

### Example

```typescript
import {
    PlayerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

const { status, data } = await apiInstance.playerControllerGetMe();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PlayerMeOutputDTO**

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

# **playerControllerGetOne**
> PlayerOutputWithRolesDTOAPI playerControllerGetOne()

   Required permissions: `READ_PLAYERS`<br> OperationId: `PlayerControllerGetOne`

### Example

```typescript
import {
    PlayerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.playerControllerGetOne(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PlayerOutputWithRolesDTOAPI**

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

# **playerControllerRemoveRole**
> APIOutput playerControllerRemoveRole()

   Required permissions: `MANAGE_PLAYERS`, `MANAGE_ROLES`<br> OperationId: `PlayerControllerRemoveRole`

### Example

```typescript
import {
    PlayerApi,
    Configuration,
    PlayerRoleAssignChangeDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

let id: string; // (default to undefined)
let roleId: string; // (default to undefined)
let playerRoleAssignChangeDTO: PlayerRoleAssignChangeDTO; //PlayerRoleAssignChangeDTO (optional)

const { status, data } = await apiInstance.playerControllerRemoveRole(
    id,
    roleId,
    playerRoleAssignChangeDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **playerRoleAssignChangeDTO** | **PlayerRoleAssignChangeDTO**| PlayerRoleAssignChangeDTO | |
| **id** | [**string**] |  | defaults to undefined|
| **roleId** | [**string**] |  | defaults to undefined|


### Return type

**APIOutput**

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

# **playerControllerSearch**
> PlayerOutputArrayDTOAPI playerControllerSearch()

   Required permissions: `READ_PLAYERS`<br> OperationId: `PlayerControllerSearch`

### Example

```typescript
import {
    PlayerApi,
    Configuration,
    PlayerSearchInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

let playerSearchInputDTO: PlayerSearchInputDTO; //PlayerSearchInputDTO (optional)

const { status, data } = await apiInstance.playerControllerSearch(
    playerSearchInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **playerSearchInputDTO** | **PlayerSearchInputDTO**| PlayerSearchInputDTO | |


### Return type

**PlayerOutputArrayDTOAPI**

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

