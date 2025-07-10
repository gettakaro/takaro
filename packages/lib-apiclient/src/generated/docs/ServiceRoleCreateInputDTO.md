# ServiceRoleCreateInputDTO

## Properties

| Name            | Type                                                         | Description | Notes                             |
| --------------- | ------------------------------------------------------------ | ----------- | --------------------------------- |
| **name**        | **string**                                                   |             | [default to undefined]            |
| **permissions** | [**Array&lt;PermissionInputDTO&gt;**](PermissionInputDTO.md) |             | [default to undefined]            |
| **system**      | **boolean**                                                  |             | [optional] [default to undefined] |

## Example

```typescript
import { ServiceRoleCreateInputDTO } from './api';

const instance: ServiceRoleCreateInputDTO = {
  name,
  permissions,
  system,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
