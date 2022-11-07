---
id: "takaro_lib_components.testing.Config"
title: "Interface: Config"
sidebar_label: "@takaro/lib-components.testing.Config"
custom_edit_url: null
---

[@takaro/lib-components](../modules/takaro_lib_components.md).[testing](../namespaces/takaro_lib_components.testing.md).Config

## Properties

### asyncUtilTimeout

• **asyncUtilTimeout**: `number`

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:12

___

### computedStyleSupportsPseudoElements

• **computedStyleSupportsPseudoElements**: `boolean`

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:13

___

### defaultHidden

• **defaultHidden**: `boolean`

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:14

___

### defaultIgnore

• **defaultIgnore**: `string`

default value for the `ignore` option in `ByText` queries

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:16

___

### getElementError

• **getElementError**: (`message`: ``null`` \| `string`, `container`: `Element`) => `Error`

#### Type declaration

▸ (`message`, `container`): `Error`

##### Parameters

| Name | Type |
| :------ | :------ |
| `message` | ``null`` \| `string` |
| `container` | `Element` |

##### Returns

`Error`

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:19

___

### showOriginalStackTrace

• **showOriginalStackTrace**: `boolean`

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:17

___

### testIdAttribute

• **testIdAttribute**: `string`

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:2

___

### throwSuggestions

• **throwSuggestions**: `boolean`

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:18

## Methods

### asyncWrapper

▸ **asyncWrapper**(`cb`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `cb` | (...`args`: `any`[]) => `any` |

#### Returns

`Promise`<`any`\>

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:9

___

### eventWrapper

▸ **eventWrapper**(`cb`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `cb` | (...`args`: `any`[]) => `any` |

#### Returns

`void`

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:11

___

### unstable\_advanceTimersWrapper

▸ **unstable_advanceTimersWrapper**(`cb`): `unknown`

WARNING: `unstable` prefix means this API may change in patch and minor releases.

#### Parameters

| Name | Type |
| :------ | :------ |
| `cb` | (...`args`: `unknown`[]) => `unknown` |

#### Returns

`unknown`

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:7
