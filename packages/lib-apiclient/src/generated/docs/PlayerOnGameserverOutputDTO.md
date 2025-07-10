# PlayerOnGameserverOutputDTO

## Properties

| Name                | Type                                                                                    | Description | Notes                             |
| ------------------- | --------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **gameServerId**    | **string**                                                                              |             | [default to undefined]            |
| **playerId**        | **string**                                                                              |             | [default to undefined]            |
| **gameId**          | **string**                                                                              |             | [default to undefined]            |
| **positionX**       | **number**                                                                              |             | [optional] [default to undefined] |
| **positionY**       | **number**                                                                              |             | [optional] [default to undefined] |
| **positionZ**       | **number**                                                                              |             | [optional] [default to undefined] |
| **dimension**       | **string**                                                                              |             | [optional] [default to undefined] |
| **ip**              | **string**                                                                              |             | [optional] [default to undefined] |
| **ping**            | **number**                                                                              |             | [optional] [default to undefined] |
| **currency**        | **number**                                                                              |             | [default to undefined]            |
| **online**          | **boolean**                                                                             |             | [default to undefined]            |
| **inventory**       | [**Array&lt;IItemDTO&gt;**](IItemDTO.md)                                                |             | [default to undefined]            |
| **lastSeen**        | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |
| **playtimeSeconds** | **number**                                                                              |             | [default to undefined]            |
| **id**              | **string**                                                                              |             | [default to undefined]            |
| **createdAt**       | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |
| **updatedAt**       | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |

## Example

```typescript
import { PlayerOnGameserverOutputDTO } from './api';

const instance: PlayerOnGameserverOutputDTO = {
  gameServerId,
  playerId,
  gameId,
  positionX,
  positionY,
  positionZ,
  dimension,
  ip,
  ping,
  currency,
  online,
  inventory,
  lastSeen,
  playtimeSeconds,
  id,
  createdAt,
  updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
