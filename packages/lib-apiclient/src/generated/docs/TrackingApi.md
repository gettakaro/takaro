# TrackingApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**trackingControllerGetBoundingBoxPlayers**](#trackingcontrollergetboundingboxplayers) | **POST** /tracking/location/box | Get bounding box players|
|[**trackingControllerGetPlayerInventoryHistory**](#trackingcontrollergetplayerinventoryhistory) | **POST** /tracking/inventory/player | Get player inventory history|
|[**trackingControllerGetPlayerMovementHistory**](#trackingcontrollergetplayermovementhistory) | **POST** /tracking/location | Get player movement history|
|[**trackingControllerGetPlayersByItem**](#trackingcontrollergetplayersbyitem) | **POST** /tracking/inventory/item | Get players by item|
|[**trackingControllerGetRadiusPlayers**](#trackingcontrollergetradiusplayers) | **POST** /tracking/location/radius | Get radius players|

# **trackingControllerGetBoundingBoxPlayers**
> PlayerLocationArrayOutputDTOAPI trackingControllerGetBoundingBoxPlayers()

Find all players within a 3D rectangular volume at a specific time   Required permissions: `READ_PLAYERS`<br> OperationId: `TrackingControllerGetBoundingBoxPlayers`

### Example

```typescript
import {
    TrackingApi,
    Configuration,
    BoundingBoxSearchInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new TrackingApi(configuration);

let boundingBoxSearchInputDTO: BoundingBoxSearchInputDTO; //BoundingBoxSearchInputDTO (optional)

const { status, data } = await apiInstance.trackingControllerGetBoundingBoxPlayers(
    boundingBoxSearchInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **boundingBoxSearchInputDTO** | **BoundingBoxSearchInputDTO**| BoundingBoxSearchInputDTO | |


### Return type

**PlayerLocationArrayOutputDTOAPI**

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

# **trackingControllerGetPlayerInventoryHistory**
> PlayerInventoryArrayOutputDTOAPI trackingControllerGetPlayerInventoryHistory()

Get inventory changes for a player between two timestamps   Required permissions: `READ_PLAYERS`<br> OperationId: `TrackingControllerGetPlayerInventoryHistory`

### Example

```typescript
import {
    TrackingApi,
    Configuration,
    PlayerInventoryHistoryInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new TrackingApi(configuration);

let playerInventoryHistoryInputDTO: PlayerInventoryHistoryInputDTO; //PlayerInventoryHistoryInputDTO (optional)

const { status, data } = await apiInstance.trackingControllerGetPlayerInventoryHistory(
    playerInventoryHistoryInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **playerInventoryHistoryInputDTO** | **PlayerInventoryHistoryInputDTO**| PlayerInventoryHistoryInputDTO | |


### Return type

**PlayerInventoryArrayOutputDTOAPI**

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

# **trackingControllerGetPlayerMovementHistory**
> PlayerLocationArrayOutputDTOAPI trackingControllerGetPlayerMovementHistory()

Get movement history for players within date bounds   Required permissions: `READ_PLAYERS`<br> OperationId: `TrackingControllerGetPlayerMovementHistory`

### Example

```typescript
import {
    TrackingApi,
    Configuration,
    PlayerMovementHistoryInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new TrackingApi(configuration);

let playerMovementHistoryInputDTO: PlayerMovementHistoryInputDTO; //PlayerMovementHistoryInputDTO (optional)

const { status, data } = await apiInstance.trackingControllerGetPlayerMovementHistory(
    playerMovementHistoryInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **playerMovementHistoryInputDTO** | **PlayerMovementHistoryInputDTO**| PlayerMovementHistoryInputDTO | |


### Return type

**PlayerLocationArrayOutputDTOAPI**

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

# **trackingControllerGetPlayersByItem**
> PlayerItemHistoryArrayOutputDTOAPI trackingControllerGetPlayersByItem()

Find all players who have had a specific item in their inventory   Required permissions: `READ_PLAYERS`<br> OperationId: `TrackingControllerGetPlayersByItem`

### Example

```typescript
import {
    TrackingApi,
    Configuration,
    PlayersByItemInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new TrackingApi(configuration);

let playersByItemInputDTO: PlayersByItemInputDTO; //PlayersByItemInputDTO (optional)

const { status, data } = await apiInstance.trackingControllerGetPlayersByItem(
    playersByItemInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **playersByItemInputDTO** | **PlayersByItemInputDTO**| PlayersByItemInputDTO | |


### Return type

**PlayerItemHistoryArrayOutputDTOAPI**

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

# **trackingControllerGetRadiusPlayers**
> PlayerLocationArrayOutputDTOAPI trackingControllerGetRadiusPlayers()

Find all players within a spherical area from a center point   Required permissions: `READ_PLAYERS`<br> OperationId: `TrackingControllerGetRadiusPlayers`

### Example

```typescript
import {
    TrackingApi,
    Configuration,
    RadiusSearchInputDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new TrackingApi(configuration);

let radiusSearchInputDTO: RadiusSearchInputDTO; //RadiusSearchInputDTO (optional)

const { status, data } = await apiInstance.trackingControllerGetRadiusPlayers(
    radiusSearchInputDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **radiusSearchInputDTO** | **RadiusSearchInputDTO**| RadiusSearchInputDTO | |


### Return type

**PlayerLocationArrayOutputDTOAPI**

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

