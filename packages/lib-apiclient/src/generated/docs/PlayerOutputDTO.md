# PlayerOutputDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**steamId** | **string** |  | [optional] [default to undefined]
**xboxLiveId** | **string** |  | [optional] [default to undefined]
**epicOnlineServicesId** | **string** |  | [optional] [default to undefined]
**platformId** | **string** |  | [optional] [default to undefined]
**steamAvatar** | **string** |  | [optional] [default to undefined]
**steamAccountCreated** | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |  | [optional] [default to undefined]
**steamCommunityBanned** | **boolean** |  | [optional] [default to undefined]
**steamEconomyBan** | **string** |  | [optional] [default to undefined]
**steamVacBanned** | **boolean** |  | [optional] [default to undefined]
**steamsDaysSinceLastBan** | **number** |  | [optional] [default to undefined]
**steamNumberOfVACBans** | **number** |  | [optional] [default to undefined]
**steamLevel** | **number** |  | [optional] [default to undefined]
**playtimeSeconds** | **number** |  | [default to undefined]
**playerOnGameServers** | [**Array&lt;PlayerOnGameserverOutputDTO&gt;**](PlayerOnGameserverOutputDTO.md) |  | [optional] [default to undefined]
**ipHistory** | [**Array&lt;IpHistoryOutputDTO&gt;**](IpHistoryOutputDTO.md) |  | [default to undefined]
**id** | **string** |  | [default to undefined]
**createdAt** | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |  | [default to undefined]
**updatedAt** | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |  | [default to undefined]

## Example

```typescript
import { PlayerOutputDTO } from './api';

const instance: PlayerOutputDTO = {
    name,
    steamId,
    xboxLiveId,
    epicOnlineServicesId,
    platformId,
    steamAvatar,
    steamAccountCreated,
    steamCommunityBanned,
    steamEconomyBan,
    steamVacBanned,
    steamsDaysSinceLastBan,
    steamNumberOfVACBans,
    steamLevel,
    playtimeSeconds,
    playerOnGameServers,
    ipHistory,
    id,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
