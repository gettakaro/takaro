# HookTriggerDTO

## Properties

| Name             | Type       | Description | Notes                             |
| ---------------- | ---------- | ----------- | --------------------------------- |
| **gameServerId** | **string** |             | [default to undefined]            |
| **playerId**     | **string** |             | [optional] [default to undefined] |
| **moduleId**     | **string** |             | [optional] [default to undefined] |
| **eventType**    | **string** |             | [default to undefined]            |
| **eventMeta**    | **object** |             | [default to undefined]            |

## Example

```typescript
import { HookTriggerDTO } from './api';

const instance: HookTriggerDTO = {
  gameServerId,
  playerId,
  moduleId,
  eventType,
  eventMeta,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
