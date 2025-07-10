# ModuleTransferVersionDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tag** | **string** |  | [default to undefined]
**description** | **string** |  | [default to undefined]
**configSchema** | **string** |  | [default to undefined]
**uiSchema** | **string** |  | [default to undefined]
**commands** | [**Array&lt;ICommand&gt;**](ICommand.md) |  | [optional] [default to undefined]
**hooks** | [**Array&lt;IHook&gt;**](IHook.md) |  | [optional] [default to undefined]
**cronJobs** | [**Array&lt;ICronJob&gt;**](ICronJob.md) |  | [optional] [default to undefined]
**functions** | [**Array&lt;IFunction&gt;**](IFunction.md) |  | [optional] [default to undefined]
**permissions** | [**Array&lt;IPermission&gt;**](IPermission.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ModuleTransferVersionDTO } from './api';

const instance: ModuleTransferVersionDTO = {
    tag,
    description,
    configSchema,
    uiSchema,
    commands,
    hooks,
    cronJobs,
    functions,
    permissions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
