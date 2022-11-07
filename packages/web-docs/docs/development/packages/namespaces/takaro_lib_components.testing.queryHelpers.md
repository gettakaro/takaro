---
id: "takaro_lib_components.testing.queryHelpers"
title: "Namespace: queryHelpers"
sidebar_label: "@takaro/lib-components.testing.queryHelpers"
custom_edit_url: null
---

[@takaro/lib-components](../modules/takaro_lib_components.md).[testing](takaro_lib_components.testing.md).queryHelpers

## Interfaces

- [SelectorMatcherOptions](../interfaces/takaro_lib_components.testing.queryHelpers.SelectorMatcherOptions.md)

## Type Aliases

### AllByAttribute

Ƭ **AllByAttribute**: (`attribute`: `string`, `container`: `HTMLElement`, `id`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md)) => `HTMLElement`[]

#### Type declaration

▸ (`attribute`, `container`, `id`, `options?`): `HTMLElement`[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md) |

##### Returns

`HTMLElement`[]

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:23

___

### BuiltQueryMethods

Ƭ **BuiltQueryMethods**<`Arguments`\>: [[`QueryBy`](takaro_lib_components.testing.queryHelpers.md#queryby)<`Arguments`\>, [`GetAllBy`](takaro_lib_components.testing.queryHelpers.md#getallby)<`Arguments`\>, [`GetBy`](takaro_lib_components.testing.queryHelpers.md#getby)<`Arguments`\>, [`FindAllBy`](takaro_lib_components.testing.queryHelpers.md#findallby)<`Arguments`\>, [`FindBy`](takaro_lib_components.testing.queryHelpers.md#findby)<`Arguments`\>]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Arguments` | extends `any`[] |

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:62

___

### FindAllBy

Ƭ **FindAllBy**<`Arguments`\>: [`QueryMethod`](takaro_lib_components.testing.queryHelpers.md#querymethod)<[`Arguments`[``0``], Arguments[1]?, waitForOptions?], `Promise`<`HTMLElement`[]\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Arguments` | extends `any`[] |

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:52

___

### FindBy

Ƭ **FindBy**<`Arguments`\>: [`QueryMethod`](takaro_lib_components.testing.queryHelpers.md#querymethod)<[`Arguments`[``0``], Arguments[1]?, waitForOptions?], `Promise`<`HTMLElement`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Arguments` | extends `any`[] |

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:57

___

### GetAllBy

Ƭ **GetAllBy**<`Arguments`\>: [`QueryMethod`](takaro_lib_components.testing.queryHelpers.md#querymethod)<`Arguments`, `HTMLElement`[]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Arguments` | extends `any`[] |

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:48

___

### GetBy

Ƭ **GetBy**<`Arguments`\>: [`QueryMethod`](takaro_lib_components.testing.queryHelpers.md#querymethod)<`Arguments`, `HTMLElement`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Arguments` | extends `any`[] |

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:56

___

### GetErrorFunction

Ƭ **GetErrorFunction**<`Arguments`\>: (`c`: `Element` \| ``null``, ...`args`: `Arguments`) => `string`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Arguments` | extends `any`[] = [`string`] |

#### Type declaration

▸ (`c`, ...`args`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `Element` \| ``null`` |
| `...args` | `Arguments` |

##### Returns

`string`

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:6

___

### QueryBy

Ƭ **QueryBy**<`Arguments`\>: [`QueryMethod`](takaro_lib_components.testing.queryHelpers.md#querymethod)<`Arguments`, `HTMLElement` \| ``null``\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Arguments` | extends `any`[] |

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:44

___

### QueryByAttribute

Ƭ **QueryByAttribute**: (`attribute`: `string`, `container`: `HTMLElement`, `id`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md)) => `HTMLElement` \| ``null``

#### Type declaration

▸ (`attribute`, `container`, `id`, `options?`): `HTMLElement` \| ``null``

##### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md) |

##### Returns

`HTMLElement` \| ``null``

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:16

___

### QueryMethod

Ƭ **QueryMethod**<`Arguments`, `Return`\>: (`container`: `HTMLElement`, ...`args`: `Arguments`) => `Return`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Arguments` | extends `any`[] |
| `Return` | `Return` |

#### Type declaration

▸ (`container`, ...`args`): `Return`

query methods have a common call signature. Only the return type differs.

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `...args` | `Arguments` |

##### Returns

`Return`

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:40

___

### WithSuggest

Ƭ **WithSuggest**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `suggest?` | `boolean` |

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:4

## Functions

### buildQueries

▸ **buildQueries**<`Arguments`\>(`queryAllBy`, `getMultipleError`, `getMissingError`): [`BuiltQueryMethods`](takaro_lib_components.testing.queryHelpers.md#builtquerymethods)<`Arguments`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Arguments` | extends `any`[] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `queryAllBy` | [`GetAllBy`](takaro_lib_components.testing.queryHelpers.md#getallby)<`Arguments`\> |
| `getMultipleError` | [`GetErrorFunction`](takaro_lib_components.testing.queryHelpers.md#geterrorfunction)<`Arguments`\> |
| `getMissingError` | [`GetErrorFunction`](takaro_lib_components.testing.queryHelpers.md#geterrorfunction)<`Arguments`\> |

#### Returns

[`BuiltQueryMethods`](takaro_lib_components.testing.queryHelpers.md#builtquerymethods)<`Arguments`\>

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:70

___

### getElementError

▸ **getElementError**(`message`, `container`): `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | ``null`` \| `string` |
| `container` | `HTMLElement` |

#### Returns

`Error`

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:32

___

### queryAllByAttribute

▸ **queryAllByAttribute**(`attribute`, `container`, `id`, `options?`): `HTMLElement`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md) |

#### Returns

`HTMLElement`[]

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:23

___

### queryByAttribute

▸ **queryByAttribute**(`attribute`, `container`, `id`, `options?`): ``null`` \| `HTMLElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md) |

#### Returns

``null`` \| `HTMLElement`

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:16
