# VariableSearchInputDTO

## Properties

| Name              | Type                                                                          | Description | Notes                             |
| ----------------- | ----------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **filters**       | [**VariableSearchInputAllowedFilters**](VariableSearchInputAllowedFilters.md) |             | [optional] [default to undefined] |
| **search**        | [**VariableSearchInputAllowedSearch**](VariableSearchInputAllowedSearch.md)   |             | [optional] [default to undefined] |
| **extend**        | **Array&lt;string&gt;**                                                       |             | [optional] [default to undefined] |
| **greaterThan**   | **any**                                                                       |             | [optional] [default to undefined] |
| **lessThan**      | **any**                                                                       |             | [optional] [default to undefined] |
| **page**          | **number**                                                                    |             | [optional] [default to undefined] |
| **limit**         | **number**                                                                    |             | [optional] [default to undefined] |
| **sortBy**        | **string**                                                                    |             | [optional] [default to undefined] |
| **sortDirection** | **string**                                                                    |             | [optional] [default to undefined] |

## Example

```typescript
import { VariableSearchInputDTO } from './api';

const instance: VariableSearchInputDTO = {
  filters,
  search,
  extend,
  greaterThan,
  lessThan,
  page,
  limit,
  sortBy,
  sortDirection,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
