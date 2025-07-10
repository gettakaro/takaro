# BanOutputDTO

## Properties

| Name              | Type                                                                                    | Description | Notes                             |
| ----------------- | --------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **id**            | **string**                                                                              |             | [default to undefined]            |
| **gameServerId**  | **string**                                                                              |             | [default to undefined]            |
| **playerId**      | **string**                                                                              |             | [default to undefined]            |
| **takaroManaged** | **boolean**                                                                             |             | [default to undefined]            |
| **isGlobal**      | **boolean**                                                                             |             | [default to undefined]            |
| **until**         | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [optional] [default to undefined] |
| **reason**        | **string**                                                                              |             | [optional] [default to undefined] |
| **createdAt**     | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |
| **updatedAt**     | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |

## Example

```typescript
import { BanOutputDTO } from './api';

const instance: BanOutputDTO = {
  id,
  gameServerId,
  playerId,
  takaroManaged,
  isGlobal,
  until,
  reason,
  createdAt,
  updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
