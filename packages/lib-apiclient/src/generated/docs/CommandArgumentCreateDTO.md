# CommandArgumentCreateDTO

## Properties

| Name             | Type       | Description | Notes                             |
| ---------------- | ---------- | ----------- | --------------------------------- |
| **name**         | **string** |             | [default to undefined]            |
| **type**         | **string** |             | [default to undefined]            |
| **helpText**     | **string** |             | [optional] [default to undefined] |
| **defaultValue** | **string** |             | [optional] [default to undefined] |
| **position**     | **number** |             | [default to undefined]            |
| **commandId**    | **string** |             | [optional] [default to undefined] |

## Example

```typescript
import { CommandArgumentCreateDTO } from './api';

const instance: CommandArgumentCreateDTO = {
  name,
  type,
  helpText,
  defaultValue,
  position,
  commandId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
