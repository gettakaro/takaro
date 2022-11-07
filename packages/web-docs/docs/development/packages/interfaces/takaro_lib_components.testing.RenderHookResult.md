---
id: "takaro_lib_components.testing.RenderHookResult"
title: "Interface: RenderHookResult<Result, Props>"
sidebar_label: "@takaro/lib-components.testing.RenderHookResult"
custom_edit_url: null
---

[@takaro/lib-components](../modules/takaro_lib_components.md).[testing](../namespaces/takaro_lib_components.testing.md).RenderHookResult

## Type parameters

| Name |
| :------ |
| `Result` |
| `Props` |

## Properties

### rerender

• **rerender**: (`props?`: `Props`) => `void`

#### Type declaration

▸ (`props?`): `void`

Triggers a re-render. The props will be passed to your renderHook callback.

##### Parameters

| Name | Type |
| :------ | :------ |
| `props?` | `Props` |

##### Returns

`void`

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:105

___

### result

• **result**: `Object`

This is a stable reference to the latest value returned by your renderHook
callback

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `current` | `Result` | The value returned by your renderHook callback |

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:110

___

### unmount

• **unmount**: () => `void`

#### Type declaration

▸ (): `void`

Unmounts the test component. This is useful for when you need to test
any cleanup your useEffects have.

##### Returns

`void`

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:120
