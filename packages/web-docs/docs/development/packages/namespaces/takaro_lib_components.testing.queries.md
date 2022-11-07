---
id: "takaro_lib_components.testing.queries"
title: "Namespace: queries"
sidebar_label: "@takaro/lib-components.testing.queries"
custom_edit_url: null
---

[@takaro/lib-components](../modules/takaro_lib_components.md).[testing](takaro_lib_components.testing.md).queries

## Interfaces

- [ByRoleOptions](../interfaces/takaro_lib_components.testing.queries.ByRoleOptions.md)

## Type Aliases

### AllByBoundAttribute

Ƭ **AllByBoundAttribute**<`T`\>: (`container`: `HTMLElement`, `id`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md)) => `T`[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `id`, `options?`): `T`[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md) |

##### Returns

`T`[]

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:11

___

### AllByRole

Ƭ **AllByRole**<`T`\>: (`container`: `HTMLElement`, `role`: [`ByRoleMatcher`](takaro_lib_components.testing.md#byrolematcher), `options?`: [`ByRoleOptions`](../interfaces/takaro_lib_components.testing.queries.ByRoleOptions.md)) => `T`[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `role`, `options?`): `T`[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `role` | [`ByRoleMatcher`](takaro_lib_components.testing.md#byrolematcher) |
| `options?` | [`ByRoleOptions`](../interfaces/takaro_lib_components.testing.queries.ByRoleOptions.md) |

##### Returns

`T`[]

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:127

___

### AllByText

Ƭ **AllByText**<`T`\>: (`container`: `HTMLElement`, `id`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`SelectorMatcherOptions`](../interfaces/takaro_lib_components.testing.queryHelpers.SelectorMatcherOptions.md)) => `T`[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `id`, `options?`): `T`[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`SelectorMatcherOptions`](../interfaces/takaro_lib_components.testing.queryHelpers.SelectorMatcherOptions.md) |

##### Returns

`T`[]

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:43

___

### FindAllByBoundAttribute

Ƭ **FindAllByBoundAttribute**<`T`\>: (`container`: `HTMLElement`, `id`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md), `waitForElementOptions?`: [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md)) => `Promise`<`T`[]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `id`, `options?`, `waitForElementOptions?`): `Promise`<`T`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md) |
| `waitForElementOptions?` | [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md) |

##### Returns

`Promise`<`T`[]\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:17

___

### FindAllByRole

Ƭ **FindAllByRole**<`T`\>: (`container`: `HTMLElement`, `role`: [`ByRoleMatcher`](takaro_lib_components.testing.md#byrolematcher), `options?`: [`ByRoleOptions`](../interfaces/takaro_lib_components.testing.queries.ByRoleOptions.md), `waitForElementOptions?`: [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md)) => `Promise`<`T`[]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `role`, `options?`, `waitForElementOptions?`): `Promise`<`T`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `role` | [`ByRoleMatcher`](takaro_lib_components.testing.md#byrolematcher) |
| `options?` | [`ByRoleOptions`](../interfaces/takaro_lib_components.testing.queries.ByRoleOptions.md) |
| `waitForElementOptions?` | [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md) |

##### Returns

`Promise`<`T`[]\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:152

___

### FindAllByText

Ƭ **FindAllByText**<`T`\>: (`container`: `HTMLElement`, `id`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`SelectorMatcherOptions`](../interfaces/takaro_lib_components.testing.queryHelpers.SelectorMatcherOptions.md), `waitForElementOptions?`: [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md)) => `Promise`<`T`[]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `id`, `options?`, `waitForElementOptions?`): `Promise`<`T`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`SelectorMatcherOptions`](../interfaces/takaro_lib_components.testing.queryHelpers.SelectorMatcherOptions.md) |
| `waitForElementOptions?` | [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md) |

##### Returns

`Promise`<`T`[]\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:49

___

### FindByBoundAttribute

Ƭ **FindByBoundAttribute**<`T`\>: (`container`: `HTMLElement`, `id`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md), `waitForElementOptions?`: [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md)) => `Promise`<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `id`, `options?`, `waitForElementOptions?`): `Promise`<`T`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md) |
| `waitForElementOptions?` | [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md) |

##### Returns

`Promise`<`T`\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:30

___

### FindByRole

Ƭ **FindByRole**<`T`\>: (`container`: `HTMLElement`, `role`: [`ByRoleMatcher`](takaro_lib_components.testing.md#byrolematcher), `options?`: [`ByRoleOptions`](../interfaces/takaro_lib_components.testing.queries.ByRoleOptions.md), `waitForElementOptions?`: [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md)) => `Promise`<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `role`, `options?`, `waitForElementOptions?`): `Promise`<`T`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `role` | [`ByRoleMatcher`](takaro_lib_components.testing.md#byrolematcher) |
| `options?` | [`ByRoleOptions`](../interfaces/takaro_lib_components.testing.queries.ByRoleOptions.md) |
| `waitForElementOptions?` | [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md) |

##### Returns

`Promise`<`T`\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:145

___

### FindByText

Ƭ **FindByText**<`T`\>: (`container`: `HTMLElement`, `id`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`SelectorMatcherOptions`](../interfaces/takaro_lib_components.testing.queryHelpers.SelectorMatcherOptions.md), `waitForElementOptions?`: [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md)) => `Promise`<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `id`, `options?`, `waitForElementOptions?`): `Promise`<`T`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`SelectorMatcherOptions`](../interfaces/takaro_lib_components.testing.queryHelpers.SelectorMatcherOptions.md) |
| `waitForElementOptions?` | [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md) |

##### Returns

`Promise`<`T`\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:62

___

### GetByBoundAttribute

Ƭ **GetByBoundAttribute**<`T`\>: (`container`: `HTMLElement`, `id`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md)) => `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `id`, `options?`): `T`

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md) |

##### Returns

`T`

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:24

___

### GetByRole

Ƭ **GetByRole**<`T`\>: (`container`: `HTMLElement`, `role`: [`ByRoleMatcher`](takaro_lib_components.testing.md#byrolematcher), `options?`: [`ByRoleOptions`](../interfaces/takaro_lib_components.testing.queries.ByRoleOptions.md)) => `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `role`, `options?`): `T`

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `role` | [`ByRoleMatcher`](takaro_lib_components.testing.md#byrolematcher) |
| `options?` | [`ByRoleOptions`](../interfaces/takaro_lib_components.testing.queries.ByRoleOptions.md) |

##### Returns

`T`

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:133

___

### GetByText

Ƭ **GetByText**<`T`\>: (`container`: `HTMLElement`, `id`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`SelectorMatcherOptions`](../interfaces/takaro_lib_components.testing.queryHelpers.SelectorMatcherOptions.md)) => `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `id`, `options?`): `T`

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`SelectorMatcherOptions`](../interfaces/takaro_lib_components.testing.queryHelpers.SelectorMatcherOptions.md) |

##### Returns

`T`

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:56

___

### QueryByBoundAttribute

Ƭ **QueryByBoundAttribute**<`T`\>: (`container`: `HTMLElement`, `id`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md)) => `T` \| ``null``

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `id`, `options?`): `T` \| ``null``

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md) |

##### Returns

`T` \| ``null``

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:5

___

### QueryByRole

Ƭ **QueryByRole**<`T`\>: (`container`: `HTMLElement`, `role`: [`ByRoleMatcher`](takaro_lib_components.testing.md#byrolematcher), `options?`: [`ByRoleOptions`](../interfaces/takaro_lib_components.testing.queries.ByRoleOptions.md)) => `T` \| ``null``

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `role`, `options?`): `T` \| ``null``

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `role` | [`ByRoleMatcher`](takaro_lib_components.testing.md#byrolematcher) |
| `options?` | [`ByRoleOptions`](../interfaces/takaro_lib_components.testing.queries.ByRoleOptions.md) |

##### Returns

`T` \| ``null``

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:139

___

### QueryByText

Ƭ **QueryByText**<`T`\>: (`container`: `HTMLElement`, `id`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`SelectorMatcherOptions`](../interfaces/takaro_lib_components.testing.queryHelpers.SelectorMatcherOptions.md)) => `T` \| ``null``

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Type declaration

▸ (`container`, `id`, `options?`): `T` \| ``null``

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `id` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`SelectorMatcherOptions`](../interfaces/takaro_lib_components.testing.queryHelpers.SelectorMatcherOptions.md) |

##### Returns

`T` \| ``null``

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:37

## Functions

### findAllByAltText

▸ **findAllByAltText**<`T`\>(...`args`): `ReturnType`<[`FindAllByBoundAttribute`](takaro_lib_components.testing.queries.md#findallbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindAllByBoundAttribute`](takaro_lib_components.testing.queries.md#findallbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:228

___

### findAllByDisplayValue

▸ **findAllByDisplayValue**<`T`\>(...`args`): `ReturnType`<[`FindAllByBoundAttribute`](takaro_lib_components.testing.queries.md#findallbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindAllByBoundAttribute`](takaro_lib_components.testing.queries.md#findallbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:264

___

### findAllByLabelText

▸ **findAllByLabelText**<`T`\>(...`args`): `ReturnType`<[`FindAllByText`](takaro_lib_components.testing.queries.md#findallbytext)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: SelectorMatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindAllByText`](takaro_lib_components.testing.queries.md#findallbytext)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:174

___

### findAllByPlaceholderText

▸ **findAllByPlaceholderText**<`T`\>(...`args`): `ReturnType`<[`FindAllByBoundAttribute`](takaro_lib_components.testing.queries.md#findallbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindAllByBoundAttribute`](takaro_lib_components.testing.queries.md#findallbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:192

___

### findAllByRole

▸ **findAllByRole**<`T`\>(...`args`): `ReturnType`<[`FindAllByRole`](takaro_lib_components.testing.queries.md#findallbyrole)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, role: ByRoleMatcher, options?: ByRoleOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindAllByRole`](takaro_lib_components.testing.queries.md#findallbyrole)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:282

___

### findAllByTestId

▸ **findAllByTestId**<`T`\>(...`args`): `ReturnType`<[`FindAllByBoundAttribute`](takaro_lib_components.testing.queries.md#findallbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindAllByBoundAttribute`](takaro_lib_components.testing.queries.md#findallbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:300

___

### findAllByText

▸ **findAllByText**<`T`\>(...`args`): `ReturnType`<[`FindAllByText`](takaro_lib_components.testing.queries.md#findallbytext)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: SelectorMatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindAllByText`](takaro_lib_components.testing.queries.md#findallbytext)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:210

___

### findAllByTitle

▸ **findAllByTitle**<`T`\>(...`args`): `ReturnType`<[`FindAllByBoundAttribute`](takaro_lib_components.testing.queries.md#findallbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindAllByBoundAttribute`](takaro_lib_components.testing.queries.md#findallbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:246

___

### findByAltText

▸ **findByAltText**<`T`\>(...`args`): `ReturnType`<[`FindByBoundAttribute`](takaro_lib_components.testing.queries.md#findbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindByBoundAttribute`](takaro_lib_components.testing.queries.md#findbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:225

___

### findByDisplayValue

▸ **findByDisplayValue**<`T`\>(...`args`): `ReturnType`<[`FindByBoundAttribute`](takaro_lib_components.testing.queries.md#findbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindByBoundAttribute`](takaro_lib_components.testing.queries.md#findbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:261

___

### findByLabelText

▸ **findByLabelText**<`T`\>(...`args`): `ReturnType`<[`FindByText`](takaro_lib_components.testing.queries.md#findbytext)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: SelectorMatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindByText`](takaro_lib_components.testing.queries.md#findbytext)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:171

___

### findByPlaceholderText

▸ **findByPlaceholderText**<`T`\>(...`args`): `ReturnType`<[`FindByBoundAttribute`](takaro_lib_components.testing.queries.md#findbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindByBoundAttribute`](takaro_lib_components.testing.queries.md#findbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:189

___

### findByRole

▸ **findByRole**<`T`\>(...`args`): `ReturnType`<[`FindByRole`](takaro_lib_components.testing.queries.md#findbyrole)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, role: ByRoleMatcher, options?: ByRoleOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindByRole`](takaro_lib_components.testing.queries.md#findbyrole)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:279

___

### findByTestId

▸ **findByTestId**<`T`\>(...`args`): `ReturnType`<[`FindByBoundAttribute`](takaro_lib_components.testing.queries.md#findbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindByBoundAttribute`](takaro_lib_components.testing.queries.md#findbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:297

___

### findByText

▸ **findByText**<`T`\>(...`args`): `ReturnType`<[`FindByText`](takaro_lib_components.testing.queries.md#findbytext)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: SelectorMatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindByText`](takaro_lib_components.testing.queries.md#findbytext)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:207

___

### findByTitle

▸ **findByTitle**<`T`\>(...`args`): `ReturnType`<[`FindByBoundAttribute`](takaro_lib_components.testing.queries.md#findbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions] |

#### Returns

`ReturnType`<[`FindByBoundAttribute`](takaro_lib_components.testing.queries.md#findbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:243

___

### getAllByAltText

▸ **getAllByAltText**<`T`\>(...`args`): `ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:216

___

### getAllByDisplayValue

▸ **getAllByDisplayValue**<`T`\>(...`args`): `ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:252

___

### getAllByLabelText

▸ **getAllByLabelText**<`T`\>(...`args`): `ReturnType`<[`AllByText`](takaro_lib_components.testing.queries.md#allbytext)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: SelectorMatcherOptions] |

#### Returns

`ReturnType`<[`AllByText`](takaro_lib_components.testing.queries.md#allbytext)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:162

___

### getAllByPlaceholderText

▸ **getAllByPlaceholderText**<`T`\>(...`args`): `ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:180

___

### getAllByRole

▸ **getAllByRole**<`T`\>(...`args`): `ReturnType`<[`AllByRole`](takaro_lib_components.testing.queries.md#allbyrole)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, role: ByRoleMatcher, options?: ByRoleOptions] |

#### Returns

`ReturnType`<[`AllByRole`](takaro_lib_components.testing.queries.md#allbyrole)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:270

___

### getAllByTestId

▸ **getAllByTestId**<`T`\>(...`args`): `ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:288

___

### getAllByText

▸ **getAllByText**<`T`\>(...`args`): `ReturnType`<[`AllByText`](takaro_lib_components.testing.queries.md#allbytext)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: SelectorMatcherOptions] |

#### Returns

`ReturnType`<[`AllByText`](takaro_lib_components.testing.queries.md#allbytext)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:198

___

### getAllByTitle

▸ **getAllByTitle**<`T`\>(...`args`): `ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:234

___

### getByAltText

▸ **getByAltText**<`T`\>(...`args`): `ReturnType`<[`GetByBoundAttribute`](takaro_lib_components.testing.queries.md#getbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`GetByBoundAttribute`](takaro_lib_components.testing.queries.md#getbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:213

___

### getByDisplayValue

▸ **getByDisplayValue**<`T`\>(...`args`): `ReturnType`<[`GetByBoundAttribute`](takaro_lib_components.testing.queries.md#getbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`GetByBoundAttribute`](takaro_lib_components.testing.queries.md#getbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:249

___

### getByLabelText

▸ **getByLabelText**<`T`\>(...`args`): `ReturnType`<[`GetByText`](takaro_lib_components.testing.queries.md#getbytext)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: SelectorMatcherOptions] |

#### Returns

`ReturnType`<[`GetByText`](takaro_lib_components.testing.queries.md#getbytext)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:159

___

### getByPlaceholderText

▸ **getByPlaceholderText**<`T`\>(...`args`): `ReturnType`<[`GetByBoundAttribute`](takaro_lib_components.testing.queries.md#getbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`GetByBoundAttribute`](takaro_lib_components.testing.queries.md#getbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:177

___

### getByRole

▸ **getByRole**<`T`\>(...`args`): `ReturnType`<[`GetByRole`](takaro_lib_components.testing.queries.md#getbyrole)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, role: ByRoleMatcher, options?: ByRoleOptions] |

#### Returns

`ReturnType`<[`GetByRole`](takaro_lib_components.testing.queries.md#getbyrole)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:267

___

### getByTestId

▸ **getByTestId**<`T`\>(...`args`): `ReturnType`<[`GetByBoundAttribute`](takaro_lib_components.testing.queries.md#getbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`GetByBoundAttribute`](takaro_lib_components.testing.queries.md#getbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:285

___

### getByText

▸ **getByText**<`T`\>(...`args`): `ReturnType`<[`GetByText`](takaro_lib_components.testing.queries.md#getbytext)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: SelectorMatcherOptions] |

#### Returns

`ReturnType`<[`GetByText`](takaro_lib_components.testing.queries.md#getbytext)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:195

___

### getByTitle

▸ **getByTitle**<`T`\>(...`args`): `ReturnType`<[`GetByBoundAttribute`](takaro_lib_components.testing.queries.md#getbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`GetByBoundAttribute`](takaro_lib_components.testing.queries.md#getbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:231

___

### queryAllByAltText

▸ **queryAllByAltText**<`T`\>(...`args`): `ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:222

___

### queryAllByDisplayValue

▸ **queryAllByDisplayValue**<`T`\>(...`args`): `ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:258

___

### queryAllByLabelText

▸ **queryAllByLabelText**<`T`\>(...`args`): `ReturnType`<[`AllByText`](takaro_lib_components.testing.queries.md#allbytext)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: SelectorMatcherOptions] |

#### Returns

`ReturnType`<[`AllByText`](takaro_lib_components.testing.queries.md#allbytext)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:168

___

### queryAllByPlaceholderText

▸ **queryAllByPlaceholderText**<`T`\>(...`args`): `ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:186

___

### queryAllByRole

▸ **queryAllByRole**<`T`\>(...`args`): `ReturnType`<[`AllByRole`](takaro_lib_components.testing.queries.md#allbyrole)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, role: ByRoleMatcher, options?: ByRoleOptions] |

#### Returns

`ReturnType`<[`AllByRole`](takaro_lib_components.testing.queries.md#allbyrole)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:276

___

### queryAllByTestId

▸ **queryAllByTestId**<`T`\>(...`args`): `ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:294

___

### queryAllByText

▸ **queryAllByText**<`T`\>(...`args`): `ReturnType`<[`AllByText`](takaro_lib_components.testing.queries.md#allbytext)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: SelectorMatcherOptions] |

#### Returns

`ReturnType`<[`AllByText`](takaro_lib_components.testing.queries.md#allbytext)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:204

___

### queryAllByTitle

▸ **queryAllByTitle**<`T`\>(...`args`): `ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`AllByBoundAttribute`](takaro_lib_components.testing.queries.md#allbyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:240

___

### queryByAltText

▸ **queryByAltText**<`T`\>(...`args`): `ReturnType`<[`QueryByBoundAttribute`](takaro_lib_components.testing.queries.md#querybyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`QueryByBoundAttribute`](takaro_lib_components.testing.queries.md#querybyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:219

___

### queryByDisplayValue

▸ **queryByDisplayValue**<`T`\>(...`args`): `ReturnType`<[`QueryByBoundAttribute`](takaro_lib_components.testing.queries.md#querybyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`QueryByBoundAttribute`](takaro_lib_components.testing.queries.md#querybyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:255

___

### queryByLabelText

▸ **queryByLabelText**<`T`\>(...`args`): `ReturnType`<[`QueryByText`](takaro_lib_components.testing.queries.md#querybytext)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: SelectorMatcherOptions] |

#### Returns

`ReturnType`<[`QueryByText`](takaro_lib_components.testing.queries.md#querybytext)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:165

___

### queryByPlaceholderText

▸ **queryByPlaceholderText**<`T`\>(...`args`): `ReturnType`<[`QueryByBoundAttribute`](takaro_lib_components.testing.queries.md#querybyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`QueryByBoundAttribute`](takaro_lib_components.testing.queries.md#querybyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:183

___

### queryByRole

▸ **queryByRole**<`T`\>(...`args`): `ReturnType`<[`QueryByRole`](takaro_lib_components.testing.queries.md#querybyrole)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, role: ByRoleMatcher, options?: ByRoleOptions] |

#### Returns

`ReturnType`<[`QueryByRole`](takaro_lib_components.testing.queries.md#querybyrole)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:273

___

### queryByTestId

▸ **queryByTestId**<`T`\>(...`args`): `ReturnType`<[`QueryByBoundAttribute`](takaro_lib_components.testing.queries.md#querybyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`QueryByBoundAttribute`](takaro_lib_components.testing.queries.md#querybyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:291

___

### queryByText

▸ **queryByText**<`T`\>(...`args`): `ReturnType`<[`QueryByText`](takaro_lib_components.testing.queries.md#querybytext)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: SelectorMatcherOptions] |

#### Returns

`ReturnType`<[`QueryByText`](takaro_lib_components.testing.queries.md#querybytext)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:201

___

### queryByTitle

▸ **queryByTitle**<`T`\>(...`args`): `ReturnType`<[`QueryByBoundAttribute`](takaro_lib_components.testing.queries.md#querybyboundattribute)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` = `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [container: HTMLElement, id: Matcher, options?: MatcherOptions] |

#### Returns

`ReturnType`<[`QueryByBoundAttribute`](takaro_lib_components.testing.queries.md#querybyboundattribute)<`T`\>\>

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:237
