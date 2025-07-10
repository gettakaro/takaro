# CommandCreateDTO

## Properties

| Name                    | Type                                                                     | Description | Notes                             |
| ----------------------- | ------------------------------------------------------------------------ | ----------- | --------------------------------- |
| **name**                | **string**                                                               |             | [default to undefined]            |
| **description**         | **string**                                                               |             | [optional] [default to undefined] |
| **trigger**             | **string**                                                               |             | [default to undefined]            |
| **helpText**            | **string**                                                               |             | [optional] [default to undefined] |
| **versionId**           | **string**                                                               |             | [default to undefined]            |
| **\_function**          | **string**                                                               |             | [optional] [default to undefined] |
| **arguments**           | [**Array&lt;CommandArgumentCreateDTO&gt;**](CommandArgumentCreateDTO.md) |             | [optional] [default to undefined] |
| **requiredPermissions** | **Array&lt;string&gt;**                                                  |             | [optional] [default to undefined] |

## Example

```typescript
import { CommandCreateDTO } from './api';

const instance: CommandCreateDTO = {
  name,
  description,
  trigger,
  helpText,
  versionId,
  _function,
  arguments,
  requiredPermissions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
