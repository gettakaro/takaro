# CommandOutputDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**trigger** | **string** |  | [default to undefined]
**helpText** | **string** |  | [default to undefined]
**_function** | [**FunctionOutputDTO**](FunctionOutputDTO.md) |  | [default to undefined]
**functionId** | **string** |  | [default to undefined]
**versionId** | **string** |  | [default to undefined]
**arguments** | [**Array&lt;CommandArgumentOutputDTO&gt;**](CommandArgumentOutputDTO.md) |  | [default to undefined]
**requiredPermissions** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**id** | **string** |  | [default to undefined]
**createdAt** | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |  | [default to undefined]
**updatedAt** | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |  | [default to undefined]

## Example

```typescript
import { CommandOutputDTO } from './api';

const instance: CommandOutputDTO = {
    name,
    description,
    trigger,
    helpText,
    _function,
    functionId,
    versionId,
    arguments,
    requiredPermissions,
    id,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
