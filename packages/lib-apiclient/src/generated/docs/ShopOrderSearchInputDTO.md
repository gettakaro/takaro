# ShopOrderSearchInputDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**filters** | [**ShopOrderSearchInputAllowedFilters**](ShopOrderSearchInputAllowedFilters.md) |  | [optional] [default to undefined]
**greaterThan** | [**ShopOrderSearchInputAllowedRangeFilter**](ShopOrderSearchInputAllowedRangeFilter.md) |  | [optional] [default to undefined]
**lessThan** | [**ShopOrderSearchInputAllowedRangeFilter**](ShopOrderSearchInputAllowedRangeFilter.md) |  | [optional] [default to undefined]
**search** | **any** |  | [optional] [default to undefined]
**page** | **number** |  | [optional] [default to undefined]
**limit** | **number** |  | [optional] [default to undefined]
**sortBy** | **string** |  | [optional] [default to undefined]
**sortDirection** | **string** |  | [optional] [default to undefined]
**extend** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { ShopOrderSearchInputDTO } from './api';

const instance: ShopOrderSearchInputDTO = {
    filters,
    greaterThan,
    lessThan,
    search,
    page,
    limit,
    sortBy,
    sortDirection,
    extend,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
