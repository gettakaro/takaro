# BanCreateDTO

## Properties

| Name              | Type                                                                                    | Description | Notes                             |
| ----------------- | --------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **gameServerId**  | **string**                                                                              |             | [optional] [default to undefined] |
| **playerId**      | **string**                                                                              |             | [default to undefined]            |
| **takaroManaged** | **boolean**                                                                             |             | [optional] [default to undefined] |
| **isGlobal**      | **boolean**                                                                             |             | [optional] [default to undefined] |
| **until**         | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [optional] [default to undefined] |
| **reason**        | **string**                                                                              |             | [optional] [default to undefined] |

## Example

```typescript
import { BanCreateDTO } from './api';

const instance: BanCreateDTO = {
  gameServerId,
  playerId,
  takaroManaged,
  isGlobal,
  until,
  reason,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
