# BoundingBoxSearchInputDTO

## Properties

| Name             | Type                                                                                    | Description | Notes                             |
| ---------------- | --------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **minX**         | **number**                                                                              |             | [default to undefined]            |
| **maxX**         | **number**                                                                              |             | [default to undefined]            |
| **minY**         | **number**                                                                              |             | [default to undefined]            |
| **maxY**         | **number**                                                                              |             | [default to undefined]            |
| **minZ**         | **number**                                                                              |             | [default to undefined]            |
| **maxZ**         | **number**                                                                              |             | [default to undefined]            |
| **startDate**    | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [optional] [default to undefined] |
| **endDate**      | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [optional] [default to undefined] |
| **gameserverId** | **string**                                                                              |             | [default to undefined]            |

## Example

```typescript
import { BoundingBoxSearchInputDTO } from './api';

const instance: BoundingBoxSearchInputDTO = {
  minX,
  maxX,
  minY,
  maxY,
  minZ,
  maxZ,
  startDate,
  endDate,
  gameserverId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
