# EntityCreateDTO

## Properties

| Name             | Type       | Description | Notes                             |
| ---------------- | ---------- | ----------- | --------------------------------- |
| **name**         | **string** |             | [default to undefined]            |
| **code**         | **string** |             | [default to undefined]            |
| **description**  | **string** |             | [optional] [default to undefined] |
| **type**         | **string** |             | [optional] [default to undefined] |
| **metadata**     | **object** |             | [optional] [default to undefined] |
| **gameserverId** | **string** |             | [default to undefined]            |

## Example

```typescript
import { EntityCreateDTO } from './api';

const instance: EntityCreateDTO = {
  name,
  code,
  description,
  type,
  metadata,
  gameserverId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
