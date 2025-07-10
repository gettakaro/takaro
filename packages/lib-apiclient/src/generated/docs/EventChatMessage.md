# EventChatMessage


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**player** | [**IGamePlayer**](IGamePlayer.md) |  | [default to undefined]
**channel** | **string** |  | [default to undefined]
**recipient** | [**IGamePlayer**](IGamePlayer.md) |  | [optional] [default to undefined]
**timestamp** | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |  | [default to undefined]
**msg** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { EventChatMessage } from './api';

const instance: EventChatMessage = {
    player,
    channel,
    recipient,
    timestamp,
    msg,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
