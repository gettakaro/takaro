# UserApi

All URIs are relative to _http://localhost_

| Method                                                                                    | HTTP request                         | Description                            |
| ----------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------- |
| [**userControllerAssignRole**](#usercontrollerassignrole)                                 | **POST** /user/{id}/role/{roleId}    | Assign role                            |
| [**userControllerCreate**](#usercontrollercreate)                                         | **POST** /user                       | Create                                 |
| [**userControllerDeleteSelectedDomainCookie**](#usercontrollerdeleteselecteddomaincookie) | **DELETE** /selected-domain          | Unset the selected domain for the user |
| [**userControllerGetOne**](#usercontrollergetone)                                         | **GET** /user/{id}                   | Get one                                |
| [**userControllerInvite**](#usercontrollerinvite)                                         | **POST** /user/invite                | Invite                                 |
| [**userControllerLinkPlayerProfile**](#usercontrollerlinkplayerprofile)                   | **POST** /user/player                | Link player profile                    |
| [**userControllerLogin**](#usercontrollerlogin)                                           | **POST** /login                      | Login                                  |
| [**userControllerLogout**](#usercontrollerlogout)                                         | **POST** /logout                     | Logout                                 |
| [**userControllerMe**](#usercontrollerme)                                                 | **GET** /me                          | Get the current logged in user         |
| [**userControllerRemove**](#usercontrollerremove)                                         | **DELETE** /user/{id}                | Remove                                 |
| [**userControllerRemoveRole**](#usercontrollerremoverole)                                 | **DELETE** /user/{id}/role/{roleId}  | Remove role                            |
| [**userControllerSearch**](#usercontrollersearch)                                         | **POST** /user/search                | Search                                 |
| [**userControllerSetSelectedDomain**](#usercontrollersetselecteddomain)                   | **POST** /selected-domain/{domainId} | Set the selected domain for the user   |
| [**userControllerUpdate**](#usercontrollerupdate)                                         | **PUT** /user/{id}                   | Update                                 |

# **userControllerAssignRole**

> APIOutput userControllerAssignRole()

Required permissions: `MANAGE_USERS`, `MANAGE_ROLES`<br> OperationId: `UserControllerAssignRole`

### Example

```typescript
import { UserApi, Configuration, UserRoleAssignChangeDTO } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)
let roleId: string; // (default to undefined)
let userRoleAssignChangeDTO: UserRoleAssignChangeDTO; //UserRoleAssignChangeDTO (optional)

const { status, data } = await apiInstance.userControllerAssignRole(id, roleId, userRoleAssignChangeDTO);
```

### Parameters

| Name                        | Type                        | Description             | Notes                 |
| --------------------------- | --------------------------- | ----------------------- | --------------------- |
| **userRoleAssignChangeDTO** | **UserRoleAssignChangeDTO** | UserRoleAssignChangeDTO |                       |
| **id**                      | [**string**]                |                         | defaults to undefined |
| **roleId**                  | [**string**]                |                         | defaults to undefined |

### Return type

**APIOutput**

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

# **userControllerCreate**

> UserOutputDTOAPI userControllerCreate()

Required permissions: `MANAGE_USERS`<br> OperationId: `UserControllerCreate`

### Example

```typescript
import { UserApi, Configuration, UserCreateInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let userCreateInputDTO: UserCreateInputDTO; //UserCreateInputDTO (optional)

const { status, data } = await apiInstance.userControllerCreate(userCreateInputDTO);
```

### Parameters

| Name                   | Type                   | Description        | Notes |
| ---------------------- | ---------------------- | ------------------ | ----- |
| **userCreateInputDTO** | **UserCreateInputDTO** | UserCreateInputDTO |       |

### Return type

**UserOutputDTOAPI**

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

# **userControllerDeleteSelectedDomainCookie**

> userControllerDeleteSelectedDomainCookie()

Unset the selected domain for the user, this will clear the domain cookie. On the next request, the backend will set this again.<br> OperationId: `UserControllerDeleteSelectedDomainCookie`

### Example

```typescript
import { UserApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

const { status, data } = await apiInstance.userControllerDeleteSelectedDomainCookie();
```

### Parameters

This endpoint does not have any parameters.

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

# **userControllerGetOne**

> UserOutputDTOAPI userControllerGetOne()

Required permissions: `READ_USERS`<br> OperationId: `UserControllerGetOne`

### Example

```typescript
import { UserApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.userControllerGetOne(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] |             | defaults to undefined |

### Return type

**UserOutputDTOAPI**

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

# **userControllerInvite**

> UserOutputDTOAPI userControllerInvite()

Required permissions: `MANAGE_USERS`<br> OperationId: `UserControllerInvite`

### Example

```typescript
import { UserApi, Configuration, InviteCreateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let inviteCreateDTO: InviteCreateDTO; //InviteCreateDTO (optional)

const { status, data } = await apiInstance.userControllerInvite(inviteCreateDTO);
```

### Parameters

| Name                | Type                | Description     | Notes |
| ------------------- | ------------------- | --------------- | ----- |
| **inviteCreateDTO** | **InviteCreateDTO** | InviteCreateDTO |       |

### Return type

**UserOutputDTOAPI**

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

# **userControllerLinkPlayerProfile**

> userControllerLinkPlayerProfile()

Link your player profile to Takaro, allowing web access for things like shop and stats. To get the code, use the /link command in the game.<br> OperationId: `UserControllerLinkPlayerProfile`

### Example

```typescript
import { UserApi, Configuration, LinkPlayerUnauthedInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let linkPlayerUnauthedInputDTO: LinkPlayerUnauthedInputDTO; //LinkPlayerUnauthedInputDTO (optional)

const { status, data } = await apiInstance.userControllerLinkPlayerProfile(linkPlayerUnauthedInputDTO);
```

### Parameters

| Name                           | Type                           | Description                | Notes |
| ------------------------------ | ------------------------------ | -------------------------- | ----- |
| **linkPlayerUnauthedInputDTO** | **LinkPlayerUnauthedInputDTO** | LinkPlayerUnauthedInputDTO |       |

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

# **userControllerLogin**

> LoginOutputDTOAPI userControllerLogin()

<br> OperationId: `UserControllerLogin`

### Example

```typescript
import { UserApi, Configuration, LoginDTO } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let loginDTO: LoginDTO; //LoginDTO (optional)

const { status, data } = await apiInstance.userControllerLogin(loginDTO);
```

### Parameters

| Name         | Type         | Description | Notes |
| ------------ | ------------ | ----------- | ----- |
| **loginDTO** | **LoginDTO** | LoginDTO    |       |

### Return type

**LoginOutputDTOAPI**

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

# **userControllerLogout**

> APIOutput userControllerLogout()

<br> OperationId: `UserControllerLogout`

### Example

```typescript
import { UserApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

const { status, data } = await apiInstance.userControllerLogout();
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

# **userControllerMe**

> MeOutoutDTOAPI userControllerMe()

Get the current user and the domains that the user has access to. Note that you can only make requests in the scope of a single domain. In order to switch the domain, you need to use the domain selection endpoints<br> OperationId: `UserControllerMe`

### Example

```typescript
import { UserApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

const { status, data } = await apiInstance.userControllerMe();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**MeOutoutDTOAPI**

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

# **userControllerRemove**

> APIOutput userControllerRemove()

Required permissions: `MANAGE_USERS`<br> OperationId: `UserControllerRemove`

### Example

```typescript
import { UserApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.userControllerRemove(id);
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

# **userControllerRemoveRole**

> APIOutput userControllerRemoveRole()

Required permissions: `MANAGE_USERS`, `MANAGE_ROLES`<br> OperationId: `UserControllerRemoveRole`

### Example

```typescript
import { UserApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)
let roleId: string; // (default to undefined)

const { status, data } = await apiInstance.userControllerRemoveRole(id, roleId);
```

### Parameters

| Name       | Type         | Description | Notes                 |
| ---------- | ------------ | ----------- | --------------------- |
| **id**     | [**string**] |             | defaults to undefined |
| **roleId** | [**string**] |             | defaults to undefined |

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

# **userControllerSearch**

> UserOutputArrayDTOAPI userControllerSearch()

Required permissions: `READ_USERS`<br> OperationId: `UserControllerSearch`

### Example

```typescript
import { UserApi, Configuration, UserSearchInputDTO } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let userSearchInputDTO: UserSearchInputDTO; //UserSearchInputDTO (optional)

const { status, data } = await apiInstance.userControllerSearch(userSearchInputDTO);
```

### Parameters

| Name                   | Type                   | Description        | Notes |
| ---------------------- | ---------------------- | ------------------ | ----- |
| **userSearchInputDTO** | **UserSearchInputDTO** | UserSearchInputDTO |       |

### Return type

**UserOutputArrayDTOAPI**

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

# **userControllerSetSelectedDomain**

> userControllerSetSelectedDomain()

One user can have multiple domains, this endpoint is a helper to set the selected domain for the user<br> OperationId: `UserControllerSetSelectedDomain`

### Example

```typescript
import { UserApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let domainId: string; // (default to undefined)

const { status, data } = await apiInstance.userControllerSetSelectedDomain(domainId);
```

### Parameters

| Name         | Type         | Description | Notes                 |
| ------------ | ------------ | ----------- | --------------------- |
| **domainId** | [**string**] |             | defaults to undefined |

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

# **userControllerUpdate**

> UserOutputDTOAPI userControllerUpdate()

Required permissions: `MANAGE_USERS`<br> OperationId: `UserControllerUpdate`

### Example

```typescript
import { UserApi, Configuration, UserUpdateDTO } from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)
let userUpdateDTO: UserUpdateDTO; //UserUpdateDTO (optional)

const { status, data } = await apiInstance.userControllerUpdate(id, userUpdateDTO);
```

### Parameters

| Name              | Type              | Description   | Notes                 |
| ----------------- | ----------------- | ------------- | --------------------- |
| **userUpdateDTO** | **UserUpdateDTO** | UserUpdateDTO |                       |
| **id**            | [**string**]      |               | defaults to undefined |

### Return type

**UserOutputDTOAPI**

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
