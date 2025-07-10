# EventOutputDTO

## Properties

| Name               | Type                                                                                    | Description | Notes                             |
| ------------------ | --------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **eventName**      | **string**                                                                              |             | [default to undefined]            |
| **moduleId**       | **string**                                                                              |             | [optional] [default to undefined] |
| **playerId**       | **string**                                                                              |             | [optional] [default to undefined] |
| **userId**         | **string**                                                                              |             | [optional] [default to undefined] |
| **gameserverId**   | **string**                                                                              |             | [optional] [default to undefined] |
| **actingUserId**   | **string**                                                                              |             | [optional] [default to undefined] |
| **actingModuleId** | **string**                                                                              |             | [optional] [default to undefined] |
| **meta**           | [**EventOutputDTOMeta**](EventOutputDTOMeta.md)                                         |             | [optional] [default to undefined] |
| **player**         | [**PlayerOutputDTO**](PlayerOutputDTO.md)                                               |             | [optional] [default to undefined] |
| **gameServer**     | [**GameServerOutputDTO**](GameServerOutputDTO.md)                                       |             | [optional] [default to undefined] |
| **module**         | [**ModuleOutputDTO**](ModuleOutputDTO.md)                                               |             | [optional] [default to undefined] |
| **user**           | [**UserOutputDTO**](UserOutputDTO.md)                                                   |             | [optional] [default to undefined] |
| **id**             | **string**                                                                              |             | [default to undefined]            |
| **createdAt**      | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |
| **updatedAt**      | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |

## Example

```typescript
import { EventOutputDTO } from './api';

const instance: EventOutputDTO = {
  eventName,
  moduleId,
  playerId,
  userId,
  gameserverId,
  actingUserId,
  actingModuleId,
  meta,
  player,
  gameServer,
  module,
  user,
  id,
  createdAt,
  updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
