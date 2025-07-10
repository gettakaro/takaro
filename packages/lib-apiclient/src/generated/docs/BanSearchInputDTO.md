# BanSearchInputDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**filters** | [**BanSearchInputAllowedFilters**](BanSearchInputAllowedFilters.md) |  | [optional] [default to undefined]
**greaterThan** | [**BanSearchInputAllowedRangeFilter**](BanSearchInputAllowedRangeFilter.md) |  | [optional] [default to undefined]
**lessThan** | [**BanSearchInputAllowedRangeFilter**](BanSearchInputAllowedRangeFilter.md) |  | [optional] [default to undefined]
**search** | **any** |  | [optional] [default to undefined]
**page** | **number** |  | [optional] [default to undefined]
**limit** | **number** |  | [optional] [default to undefined]
**sortBy** | **string** |  | [optional] [default to undefined]
**sortDirection** | **string** |  | [optional] [default to undefined]
**extend** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { BanSearchInputDTO } from './api';

const instance: BanSearchInputDTO = {
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
