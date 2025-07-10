# DomainSearchInputDTO

## Properties

| Name              | Type                                                                      | Description | Notes                             |
| ----------------- | ------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **filters**       | [**DomainSearchInputAllowedFilters**](DomainSearchInputAllowedFilters.md) |             | [optional] [default to undefined] |
| **search**        | [**DomainSearchInputAllowedSearch**](DomainSearchInputAllowedSearch.md)   |             | [optional] [default to undefined] |
| **greaterThan**   | **any**                                                                   |             | [optional] [default to undefined] |
| **lessThan**      | **any**                                                                   |             | [optional] [default to undefined] |
| **page**          | **number**                                                                |             | [optional] [default to undefined] |
| **limit**         | **number**                                                                |             | [optional] [default to undefined] |
| **sortBy**        | **string**                                                                |             | [optional] [default to undefined] |
| **sortDirection** | **string**                                                                |             | [optional] [default to undefined] |
| **extend**        | **Array&lt;string&gt;**                                                   |             | [optional] [default to undefined] |

## Example

```typescript
import { DomainSearchInputDTO } from './api';

const instance: DomainSearchInputDTO = {
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
