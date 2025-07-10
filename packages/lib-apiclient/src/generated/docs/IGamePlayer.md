# IGamePlayer

## Properties

| Name                     | Type       | Description | Notes                             |
| ------------------------ | ---------- | ----------- | --------------------------------- |
| **gameId**               | **string** |             | [default to undefined]            |
| **name**                 | **string** |             | [default to undefined]            |
| **steamId**              | **string** |             | [optional] [default to undefined] |
| **epicOnlineServicesId** | **string** |             | [optional] [default to undefined] |
| **xboxLiveId**           | **string** |             | [optional] [default to undefined] |
| **platformId**           | **string** |             | [optional] [default to undefined] |
| **ip**                   | **string** |             | [optional] [default to undefined] |
| **ping**                 | **number** |             | [optional] [default to undefined] |

## Example

```typescript
import { IGamePlayer } from './api';

const instance: IGamePlayer = {
  gameId,
  name,
  steamId,
  epicOnlineServicesId,
  xboxLiveId,
  platformId,
  ip,
  ping,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
