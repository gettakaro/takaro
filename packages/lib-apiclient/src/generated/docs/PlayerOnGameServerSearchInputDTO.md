# PlayerOnGameServerSearchInputDTO

## Properties

| Name              | Type                                                                                                      | Description | Notes                             |
| ----------------- | --------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **filters**       | [**PlayerOnGameServerSearchInputAllowedFilters**](PlayerOnGameServerSearchInputAllowedFilters.md)         |             | [optional] [default to undefined] |
| **greaterThan**   | [**PlayerOnGameServerSearchInputAllowedRangeFilter**](PlayerOnGameServerSearchInputAllowedRangeFilter.md) |             | [optional] [default to undefined] |
| **lessThan**      | [**PlayerOnGameServerSearchInputAllowedRangeFilter**](PlayerOnGameServerSearchInputAllowedRangeFilter.md) |             | [optional] [default to undefined] |
| **extend**        | **Array&lt;string&gt;**                                                                                   |             | [optional] [default to undefined] |
| **search**        | **any**                                                                                                   |             | [optional] [default to undefined] |
| **page**          | **number**                                                                                                |             | [optional] [default to undefined] |
| **limit**         | **number**                                                                                                |             | [optional] [default to undefined] |
| **sortBy**        | **string**                                                                                                |             | [optional] [default to undefined] |
| **sortDirection** | **string**                                                                                                |             | [optional] [default to undefined] |

## Example

```typescript
import { PlayerOnGameServerSearchInputDTO } from './api';

const instance: PlayerOnGameServerSearchInputDTO = {
  filters,
  greaterThan,
  lessThan,
  extend,
  search,
  page,
  limit,
  sortBy,
  sortDirection,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
