# UserOutputDTO

## Properties

| Name                | Type                                                                                    | Description | Notes                             |
| ------------------- | --------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **name**            | **string**                                                                              |             | [default to undefined]            |
| **email**           | **string**                                                                              |             | [default to undefined]            |
| **idpId**           | **string**                                                                              |             | [default to undefined]            |
| **discordId**       | **string**                                                                              |             | [optional] [default to undefined] |
| **lastSeen**        | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |
| **playerId**        | **string**                                                                              |             | [optional] [default to undefined] |
| **player**          | [**PlayerOutputWithRolesDTO**](PlayerOutputWithRolesDTO.md)                             |             | [default to undefined]            |
| **isDashboardUser** | **boolean**                                                                             |             | [default to undefined]            |
| **id**              | **string**                                                                              |             | [default to undefined]            |
| **createdAt**       | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |
| **updatedAt**       | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |

## Example

```typescript
import { UserOutputDTO } from './api';

const instance: UserOutputDTO = {
  name,
  email,
  idpId,
  discordId,
  lastSeen,
  playerId,
  player,
  isDashboardUser,
  id,
  createdAt,
  updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
