# CommandUpdateDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**trigger** | **string** |  | [optional] [default to undefined]
**helpText** | **string** |  | [optional] [default to undefined]
**_function** | **string** |  | [optional] [default to undefined]
**arguments** | [**Array&lt;CommandArgumentCreateDTO&gt;**](CommandArgumentCreateDTO.md) |  | [optional] [default to undefined]
**requiredPermissions** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { CommandUpdateDTO } from './api';

const instance: CommandUpdateDTO = {
    name,
    description,
    trigger,
    helpText,
    _function,
    arguments,
    requiredPermissions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
