# ShopCategoryOutputDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**emoji** | **string** |  | [default to undefined]
**parentId** | **string** |  | [optional] [default to undefined]
**parent** | [**ShopCategoryOutputDTO**](ShopCategoryOutputDTO.md) |  | [optional] [default to undefined]
**children** | [**Array&lt;ShopCategoryOutputDTO&gt;**](ShopCategoryOutputDTO.md) |  | [optional] [default to undefined]
**listings** | [**Array&lt;ShopListingOutputDTO&gt;**](ShopListingOutputDTO.md) |  | [optional] [default to undefined]
**listingCount** | **number** |  | [optional] [default to undefined]
**createdAt** | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |  | [default to undefined]
**updatedAt** | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |  | [default to undefined]

## Example

```typescript
import { ShopCategoryOutputDTO } from './api';

const instance: ShopCategoryOutputDTO = {
    id,
    name,
    emoji,
    parentId,
    parent,
    children,
    listings,
    listingCount,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
