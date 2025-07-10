# ShopOrderOutputDTO

## Properties

| Name             | Type                                                                                    | Description | Notes                             |
| ---------------- | --------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **id**           | **string**                                                                              |             | [default to undefined]            |
| **listingId**    | **string**                                                                              |             | [default to undefined]            |
| **playerId**     | **string**                                                                              |             | [default to undefined]            |
| **gameServerId** | **string**                                                                              |             | [default to undefined]            |
| **amount**       | **number**                                                                              |             | [default to undefined]            |
| **status**       | **string**                                                                              |             | [default to undefined]            |
| **listing**      | [**ShopListingOutputDTO**](ShopListingOutputDTO.md)                                     |             | [optional] [default to undefined] |
| **createdAt**    | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |
| **updatedAt**    | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |

## Example

```typescript
import { ShopOrderOutputDTO } from './api';

const instance: ShopOrderOutputDTO = {
  id,
  listingId,
  playerId,
  gameServerId,
  amount,
  status,
  listing,
  createdAt,
  updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
