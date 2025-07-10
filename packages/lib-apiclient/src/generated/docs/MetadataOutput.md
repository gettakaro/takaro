# MetadataOutput

## Properties

| Name           | Type                              | Description | Notes                             |
| -------------- | --------------------------------- | ----------- | --------------------------------- |
| **serverTime** | **string**                        |             | [default to undefined]            |
| **error**      | [**ErrorOutput**](ErrorOutput.md) |             | [default to undefined]            |
| **page**       | **number**                        |             | [optional] [default to undefined] |
| **limit**      | **number**                        |             | [optional] [default to undefined] |
| **total**      | **number**                        |             | [optional] [default to undefined] |

## Example

```typescript
import { MetadataOutput } from './api';

const instance: MetadataOutput = {
  serverTime,
  error,
  page,
  limit,
  total,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
