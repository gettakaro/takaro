# ShopListingCreateDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**gameServerId** | **string** |  | [default to undefined]
**items** | [**Array&lt;ShopListingItemMetaInputDTO&gt;**](ShopListingItemMetaInputDTO.md) |  | [default to undefined]
**price** | **number** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**draft** | **boolean** |  | [optional] [default to undefined]
**categoryIds** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { ShopListingCreateDTO } from './api';

const instance: ShopListingCreateDTO = {
    gameServerId,
    items,
    price,
    name,
    draft,
    categoryIds,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
