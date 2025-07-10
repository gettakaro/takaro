# EventEntityKilled

## Properties

| Name          | Type                                                                                    | Description | Notes                             |
| ------------- | --------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **player**    | [**IGamePlayer**](IGamePlayer.md)                                                       |             | [default to undefined]            |
| **entity**    | **string**                                                                              |             | [default to undefined]            |
| **weapon**    | **string**                                                                              |             | [default to undefined]            |
| **timestamp** | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |
| **msg**       | **string**                                                                              |             | [optional] [default to undefined] |

## Example

```typescript
import { EventEntityKilled } from './api';

const instance: EventEntityKilled = {
  player,
  entity,
  weapon,
  timestamp,
  msg,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
