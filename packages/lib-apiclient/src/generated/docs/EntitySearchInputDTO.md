# EntitySearchInputDTO

## Properties

| Name              | Type                                                                      | Description | Notes                             |
| ----------------- | ------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **filters**       | [**EntitySearchInputAllowedFilters**](EntitySearchInputAllowedFilters.md) |             | [optional] [default to undefined] |
| **search**        | [**EntitySearchInputAllowedSearch**](EntitySearchInputAllowedSearch.md)   |             | [optional] [default to undefined] |
| **greaterThan**   | **any**                                                                   |             | [optional] [default to undefined] |
| **lessThan**      | **any**                                                                   |             | [optional] [default to undefined] |
| **page**          | **number**                                                                |             | [optional] [default to undefined] |
| **limit**         | **number**                                                                |             | [optional] [default to undefined] |
| **sortBy**        | **string**                                                                |             | [optional] [default to undefined] |
| **sortDirection** | **string**                                                                |             | [optional] [default to undefined] |

## Example

```typescript
import { EntitySearchInputDTO } from './api';

const instance: EntitySearchInputDTO = {
  filters,
  search,
  greaterThan,
  lessThan,
  page,
  limit,
  sortBy,
  sortDirection,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
