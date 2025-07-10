# RoleSearchInputDTO

## Properties

| Name              | Type                                                                  | Description | Notes                             |
| ----------------- | --------------------------------------------------------------------- | ----------- | --------------------------------- |
| **filters**       | [**RoleSearchInputAllowedFilters**](RoleSearchInputAllowedFilters.md) |             | [optional] [default to undefined] |
| **search**        | [**RoleSearchInputAllowedSearch**](RoleSearchInputAllowedSearch.md)   |             | [optional] [default to undefined] |
| **greaterThan**   | **any**                                                               |             | [optional] [default to undefined] |
| **lessThan**      | **any**                                                               |             | [optional] [default to undefined] |
| **page**          | **number**                                                            |             | [optional] [default to undefined] |
| **limit**         | **number**                                                            |             | [optional] [default to undefined] |
| **sortBy**        | **string**                                                            |             | [optional] [default to undefined] |
| **sortDirection** | **string**                                                            |             | [optional] [default to undefined] |
| **extend**        | **Array&lt;string&gt;**                                               |             | [optional] [default to undefined] |

## Example

```typescript
import { RoleSearchInputDTO } from './api';

const instance: RoleSearchInputDTO = {
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
