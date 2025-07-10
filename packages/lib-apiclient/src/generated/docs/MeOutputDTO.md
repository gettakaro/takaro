# MeOutputDTO

## Properties

| Name        | Type                                                                           | Description | Notes                             |
| ----------- | ------------------------------------------------------------------------------ | ----------- | --------------------------------- |
| **user**    | [**UserOutputWithRolesDTO**](UserOutputWithRolesDTO.md)                        |             | [default to undefined]            |
| **domains** | [**Array&lt;DomainOutputDTO&gt;**](DomainOutputDTO.md)                         |             | [default to undefined]            |
| **domain**  | **string**                                                                     |             | [default to undefined]            |
| **player**  | [**PlayerOutputWithRolesDTO**](PlayerOutputWithRolesDTO.md)                    |             | [optional] [default to undefined] |
| **pogs**    | [**Array&lt;PlayerOnGameserverOutputDTO&gt;**](PlayerOnGameserverOutputDTO.md) |             | [default to undefined]            |

## Example

```typescript
import { MeOutputDTO } from './api';

const instance: MeOutputDTO = {
  user,
  domains,
  domain,
  player,
  pogs,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
