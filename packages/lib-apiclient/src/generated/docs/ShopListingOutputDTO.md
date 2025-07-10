# ShopListingOutputDTO

## Properties

| Name             | Type                                                                                    | Description | Notes                             |
| ---------------- | --------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **id**           | **string**                                                                              |             | [default to undefined]            |
| **gameServerId** | **string**                                                                              |             | [default to undefined]            |
| **items**        | [**Array&lt;ShopListingItemMetaOutputDTO&gt;**](ShopListingItemMetaOutputDTO.md)        |             | [default to undefined]            |
| **price**        | **number**                                                                              |             | [default to undefined]            |
| **name**         | **string**                                                                              |             | [default to undefined]            |
| **deletedAt**    | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [optional] [default to undefined] |
| **draft**        | **boolean**                                                                             |             | [default to undefined]            |
| **categories**   | [**Array&lt;ShopCategoryOutputDTO&gt;**](ShopCategoryOutputDTO.md)                      |             | [optional] [default to undefined] |
| **createdAt**    | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |
| **updatedAt**    | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |

## Example

```typescript
import { ShopListingOutputDTO } from './api';

const instance: ShopListingOutputDTO = {
  id,
  gameServerId,
  items,
  price,
  name,
  deletedAt,
  draft,
  categories,
  createdAt,
  updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
