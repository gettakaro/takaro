# ModuleSearchInputDTO

## Properties

| Name              | Type                                                                      | Description | Notes                             |
| ----------------- | ------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **filters**       | [**ModuleSearchInputAllowedFilters**](ModuleSearchInputAllowedFilters.md) |             | [optional] [default to undefined] |
| **search**        | [**ModuleSearchInputAllowedSearch**](ModuleSearchInputAllowedSearch.md)   |             | [optional] [default to undefined] |
| **greaterThan**   | [**RangeFilterCreatedAndUpdatedAt**](RangeFilterCreatedAndUpdatedAt.md)   |             | [optional] [default to undefined] |
| **lessThan**      | [**RangeFilterCreatedAndUpdatedAt**](RangeFilterCreatedAndUpdatedAt.md)   |             | [optional] [default to undefined] |
| **page**          | **number**                                                                |             | [optional] [default to undefined] |
| **limit**         | **number**                                                                |             | [optional] [default to undefined] |
| **sortBy**        | **string**                                                                |             | [optional] [default to undefined] |
| **sortDirection** | **string**                                                                |             | [optional] [default to undefined] |
| **extend**        | **Array&lt;string&gt;**                                                   |             | [optional] [default to undefined] |

## Example

```typescript
import { ModuleSearchInputDTO } from './api';

const instance: ModuleSearchInputDTO = {
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
