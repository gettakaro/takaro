# ModuleVersionSearchInputDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**filters** | [**ModuleVersionSearchInputAllowedFilters**](ModuleVersionSearchInputAllowedFilters.md) |  | [optional] [default to undefined]
**search** | [**ModuleVersionSearchInputAllowedSearch**](ModuleVersionSearchInputAllowedSearch.md) |  | [optional] [default to undefined]
**greaterThan** | [**RangeFilterCreatedAndUpdatedAt**](RangeFilterCreatedAndUpdatedAt.md) |  | [optional] [default to undefined]
**lessThan** | [**RangeFilterCreatedAndUpdatedAt**](RangeFilterCreatedAndUpdatedAt.md) |  | [optional] [default to undefined]
**page** | **number** |  | [optional] [default to undefined]
**limit** | **number** |  | [optional] [default to undefined]
**sortBy** | **string** |  | [optional] [default to undefined]
**sortDirection** | **string** |  | [optional] [default to undefined]
**extend** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { ModuleVersionSearchInputDTO } from './api';

const instance: ModuleVersionSearchInputDTO = {
    filters,
    search,
    greaterThan,
    lessThan,
    page,
    limit,
    sortBy,
    sortDirection,
    extend,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
