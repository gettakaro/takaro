# ModuleVersionOutputDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tag** | **string** |  | [default to undefined]
**description** | **string** |  | [default to undefined]
**configSchema** | **string** |  | [default to undefined]
**uiSchema** | **string** |  | [default to undefined]
**systemConfigSchema** | **string** |  | [default to undefined]
**defaultSystemConfig** | **string** |  | [optional] [default to undefined]
**moduleId** | **string** |  | [default to undefined]
**cronJobs** | [**Array&lt;CronJobOutputDTO&gt;**](CronJobOutputDTO.md) |  | [default to undefined]
**hooks** | [**Array&lt;HookOutputDTO&gt;**](HookOutputDTO.md) |  | [default to undefined]
**commands** | [**Array&lt;CommandOutputDTO&gt;**](CommandOutputDTO.md) |  | [default to undefined]
**functions** | [**Array&lt;FunctionOutputDTO&gt;**](FunctionOutputDTO.md) |  | [default to undefined]
**permissions** | [**Array&lt;PermissionOutputDTO&gt;**](PermissionOutputDTO.md) |  | [default to undefined]
**id** | **string** |  | [default to undefined]
**createdAt** | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |  | [default to undefined]
**updatedAt** | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |  | [default to undefined]

## Example

```typescript
import { ModuleVersionOutputDTO } from './api';

const instance: ModuleVersionOutputDTO = {
    tag,
    description,
    configSchema,
    uiSchema,
    systemConfigSchema,
    defaultSystemConfig,
    moduleId,
    cronJobs,
    hooks,
    commands,
    functions,
    permissions,
    id,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
