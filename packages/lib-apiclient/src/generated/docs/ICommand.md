# ICommand

## Properties

| Name                    | Type                                                     | Description | Notes                             |
| ----------------------- | -------------------------------------------------------- | ----------- | --------------------------------- |
| **name**                | **string**                                               |             | [default to undefined]            |
| **description**         | **string**                                               |             | [optional] [default to undefined] |
| **\_function**          | **string**                                               |             | [default to undefined]            |
| **trigger**             | **string**                                               |             | [default to undefined]            |
| **helpText**            | **string**                                               |             | [optional] [default to undefined] |
| **arguments**           | [**Array&lt;ICommandArgument&gt;**](ICommandArgument.md) |             | [optional] [default to undefined] |
| **requiredPermissions** | **Array&lt;string&gt;**                                  |             | [optional] [default to undefined] |

## Example

```typescript
import { ICommand } from './api';

const instance: ICommand = {
  name,
  description,
  _function,
  trigger,
  helpText,
  arguments,
  requiredPermissions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
