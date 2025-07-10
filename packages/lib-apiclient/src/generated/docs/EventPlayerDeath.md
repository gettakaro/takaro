# EventPlayerDeath

## Properties

| Name          | Type                                                                                    | Description | Notes                             |
| ------------- | --------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **player**    | [**IGamePlayer**](IGamePlayer.md)                                                       |             | [default to undefined]            |
| **attacker**  | [**IGamePlayer**](IGamePlayer.md)                                                       |             | [optional] [default to undefined] |
| **position**  | [**IPosition**](IPosition.md)                                                           |             | [optional] [default to undefined] |
| **timestamp** | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |
| **msg**       | **string**                                                                              |             | [optional] [default to undefined] |

## Example

```typescript
import { EventPlayerDeath } from './api';

const instance: EventPlayerDeath = {
  player,
  attacker,
  position,
  timestamp,
  msg,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
