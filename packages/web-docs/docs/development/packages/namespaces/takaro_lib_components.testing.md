---
id: "takaro_lib_components.testing"
title: "Namespace: testing"
sidebar_label: "@takaro/lib-components.testing"
custom_edit_url: null
---

[@takaro/lib-components](../modules/takaro_lib_components.md).testing

## Namespaces

- [prettyFormat](takaro_lib_components.testing.prettyFormat.md)
- [queries](takaro_lib_components.testing.queries.md)
- [queryHelpers](takaro_lib_components.testing.queryHelpers.md)

## Interfaces

- [ByRoleOptions](../interfaces/takaro_lib_components.testing.ByRoleOptions.md)
- [Config](../interfaces/takaro_lib_components.testing.Config.md)
- [ConfigFn](../interfaces/takaro_lib_components.testing.ConfigFn.md)
- [DefaultNormalizerOptions](../interfaces/takaro_lib_components.testing.DefaultNormalizerOptions.md)
- [MatcherOptions](../interfaces/takaro_lib_components.testing.MatcherOptions.md)
- [NormalizerOptions](../interfaces/takaro_lib_components.testing.NormalizerOptions.md)
- [PrettyDOMOptions](../interfaces/takaro_lib_components.testing.PrettyDOMOptions.md)
- [Queries](../interfaces/takaro_lib_components.testing.Queries-1.md)
- [QueryOptions](../interfaces/takaro_lib_components.testing.QueryOptions.md)
- [RenderHookOptions](../interfaces/takaro_lib_components.testing.RenderHookOptions.md)
- [RenderHookResult](../interfaces/takaro_lib_components.testing.RenderHookResult.md)
- [RenderOptions](../interfaces/takaro_lib_components.testing.RenderOptions.md)
- [SelectorMatcherOptions](../interfaces/takaro_lib_components.testing.SelectorMatcherOptions.md)
- [Suggestion](../interfaces/takaro_lib_components.testing.Suggestion.md)
- [waitForOptions](../interfaces/takaro_lib_components.testing.waitForOptions.md)

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

### BoundFunction

Ƭ **BoundFunction**<`T`\>: `T` extends (`container`: `HTMLElement`, ...`args`: infer P) => infer R ? (...`args`: `P`) => `R` : `never`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

node_modules/@testing-library/dom/types/get-queries-for-element.d.ts:3

___

### BoundFunctions

Ƭ **BoundFunctions**<`Q`\>: `Q` extends typeof [`queries`](takaro_lib_components.testing.queries.md) ? { `findAllByAltText`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`[]\> ; `findAllByDisplayValue`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`[]\> ; `findAllByLabelText`: <T\>(...`args`: [id: Matcher, options?: SelectorMatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`[]\> ; `findAllByPlaceholderText`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`[]\> ; `findAllByRole`: <T\>(...`args`: [role: ByRoleMatcher, options?: ByRoleOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`[]\> ; `findAllByTestId`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`[]\> ; `findAllByText`: <T\>(...`args`: [id: Matcher, options?: SelectorMatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`[]\> ; `findAllByTitle`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`[]\> ; `findByAltText`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`\> ; `findByDisplayValue`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`\> ; `findByLabelText`: <T\>(...`args`: [id: Matcher, options?: SelectorMatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`\> ; `findByPlaceholderText`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`\> ; `findByRole`: <T\>(...`args`: [role: ByRoleMatcher, options?: ByRoleOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`\> ; `findByTestId`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`\> ; `findByText`: <T\>(...`args`: [id: Matcher, options?: SelectorMatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`\> ; `findByTitle`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions, waitForElementOptions?: waitForOptions]) => `Promise`<`T`\> ; `getAllByAltText`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T`[] ; `getAllByDisplayValue`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T`[] ; `getAllByLabelText`: <T\>(...`args`: [id: Matcher, options?: SelectorMatcherOptions]) => `T`[] ; `getAllByPlaceholderText`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T`[] ; `getAllByRole`: <T\>(...`args`: [role: ByRoleMatcher, options?: ByRoleOptions]) => `T`[] ; `getAllByTestId`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T`[] ; `getAllByText`: <T\>(...`args`: [id: Matcher, options?: SelectorMatcherOptions]) => `T`[] ; `getAllByTitle`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T`[] ; `getByAltText`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T` ; `getByDisplayValue`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T` ; `getByLabelText`: <T\>(...`args`: [id: Matcher, options?: SelectorMatcherOptions]) => `T` ; `getByPlaceholderText`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T` ; `getByRole`: <T\>(...`args`: [role: ByRoleMatcher, options?: ByRoleOptions]) => `T` ; `getByTestId`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T` ; `getByText`: <T\>(...`args`: [id: Matcher, options?: SelectorMatcherOptions]) => `T` ; `getByTitle`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T` ; `queryAllByAltText`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T`[] ; `queryAllByDisplayValue`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T`[] ; `queryAllByLabelText`: <T\>(...`args`: [id: Matcher, options?: SelectorMatcherOptions]) => `T`[] ; `queryAllByPlaceholderText`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T`[] ; `queryAllByRole`: <T\>(...`args`: [role: ByRoleMatcher, options?: ByRoleOptions]) => `T`[] ; `queryAllByTestId`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T`[] ; `queryAllByText`: <T\>(...`args`: [id: Matcher, options?: SelectorMatcherOptions]) => `T`[] ; `queryAllByTitle`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => `T`[] ; `queryByAltText`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => ``null`` \| `T` ; `queryByDisplayValue`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => ``null`` \| `T` ; `queryByLabelText`: <T\>(...`args`: [id: Matcher, options?: SelectorMatcherOptions]) => ``null`` \| `T` ; `queryByPlaceholderText`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => ``null`` \| `T` ; `queryByRole`: <T\>(...`args`: [role: ByRoleMatcher, options?: ByRoleOptions]) => ``null`` \| `T` ; `queryByTestId`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => ``null`` \| `T` ; `queryByText`: <T\>(...`args`: [id: Matcher, options?: SelectorMatcherOptions]) => ``null`` \| `T` ; `queryByTitle`: <T\>(...`args`: [id: Matcher, options?: MatcherOptions]) => ``null`` \| `T`  } & { [P in keyof Q]: BoundFunction<Q[P]\> } : { [P in keyof Q]: BoundFunction<Q[P]\> }

#### Type parameters

| Name |
| :------ |
| `Q` |

#### Defined in

node_modules/@testing-library/dom/types/get-queries-for-element.d.ts:10

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

### ByRoleMatcher

Ƭ **ByRoleMatcher**: `ARIARole` \| [`MatcherFunction`](takaro_lib_components.testing.md#matcherfunction) \| {}

#### Defined in

node_modules/@testing-library/dom/types/matches.d.ts:11

___

### CreateFunction

Ƭ **CreateFunction**: (`eventName`: `string`, `node`: `Document` \| `Element` \| `Window` \| `Node`, `init?`: {}, `options?`: { `EventType?`: `string` ; `defaultInit?`: {}  }) => `Event`

#### Type declaration

▸ (`eventName`, `node`, `init?`, `options?`): `Event`

##### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` |
| `node` | `Document` \| `Element` \| `Window` \| `Node` |
| `init?` | `Object` |
| `options?` | `Object` |
| `options.EventType?` | `string` |
| `options.defaultInit?` | `Object` |

##### Returns

`Event`

#### Defined in

node_modules/@testing-library/dom/types/events.d.ts:100

___

### CreateObject

Ƭ **CreateObject**: { [K in EventType]: Function }

#### Defined in

node_modules/@testing-library/dom/types/events.d.ts:106

___

### EventType

Ƭ **EventType**: ``"copy"`` \| ``"cut"`` \| ``"paste"`` \| ``"compositionEnd"`` \| ``"compositionStart"`` \| ``"compositionUpdate"`` \| ``"keyDown"`` \| ``"keyPress"`` \| ``"keyUp"`` \| ``"focus"`` \| ``"blur"`` \| ``"focusIn"`` \| ``"focusOut"`` \| ``"change"`` \| ``"input"`` \| ``"invalid"`` \| ``"submit"`` \| ``"reset"`` \| ``"click"`` \| ``"contextMenu"`` \| ``"dblClick"`` \| ``"drag"`` \| ``"dragEnd"`` \| ``"dragEnter"`` \| ``"dragExit"`` \| ``"dragLeave"`` \| ``"dragOver"`` \| ``"dragStart"`` \| ``"drop"`` \| ``"mouseDown"`` \| ``"mouseEnter"`` \| ``"mouseLeave"`` \| ``"mouseMove"`` \| ``"mouseOut"`` \| ``"mouseOver"`` \| ``"mouseUp"`` \| ``"popState"`` \| ``"select"`` \| ``"touchCancel"`` \| ``"touchEnd"`` \| ``"touchMove"`` \| ``"touchStart"`` \| ``"resize"`` \| ``"scroll"`` \| ``"wheel"`` \| ``"abort"`` \| ``"canPlay"`` \| ``"canPlayThrough"`` \| ``"durationChange"`` \| ``"emptied"`` \| ``"encrypted"`` \| ``"ended"`` \| ``"loadedData"`` \| ``"loadedMetadata"`` \| ``"loadStart"`` \| ``"pause"`` \| ``"play"`` \| ``"playing"`` \| ``"progress"`` \| ``"rateChange"`` \| ``"seeked"`` \| ``"seeking"`` \| ``"stalled"`` \| ``"suspend"`` \| ``"timeUpdate"`` \| ``"volumeChange"`` \| ``"waiting"`` \| ``"load"`` \| ``"error"`` \| ``"animationStart"`` \| ``"animationEnd"`` \| ``"animationIteration"`` \| ``"transitionCancel"`` \| ``"transitionEnd"`` \| ``"transitionRun"`` \| ``"transitionStart"`` \| ``"doubleClick"`` \| ``"pointerOver"`` \| ``"pointerEnter"`` \| ``"pointerDown"`` \| ``"pointerMove"`` \| ``"pointerUp"`` \| ``"pointerCancel"`` \| ``"pointerOut"`` \| ``"pointerLeave"`` \| ``"gotPointerCapture"`` \| ``"lostPointerCapture"``

#### Defined in

node_modules/@testing-library/dom/types/events.d.ts:1

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

### FindBy

Ƭ **FindBy**<`Arguments`\>: [`QueryMethod`](takaro_lib_components.testing.queryHelpers.md#querymethod)<[`Arguments`[``0``], Arguments[1]?, waitForOptions?], `Promise`<`HTMLElement`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Arguments` | extends `any`[] |

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:57

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

### FireFunction

Ƭ **FireFunction**: (`element`: `Document` \| `Element` \| `Window` \| `Node`, `event`: `Event`) => `boolean`

#### Type declaration

▸ (`element`, `event`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `element` | `Document` \| `Element` \| `Window` \| `Node` |
| `event` | `Event` |

##### Returns

`boolean`

#### Defined in

node_modules/@testing-library/dom/types/events.d.ts:90

___

### FireObject

Ƭ **FireObject**: { [K in EventType]: Function }

#### Defined in

node_modules/@testing-library/dom/types/events.d.ts:94

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

### Match

Ƭ **Match**: (`textToMatch`: `string`, `node`: `HTMLElement` \| ``null``, `matcher`: [`Matcher`](takaro_lib_components.testing.md#matcher), `options?`: [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md)) => `boolean`

#### Type declaration

▸ (`textToMatch`, `node`, `matcher`, `options?`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `textToMatch` | `string` |
| `node` | `HTMLElement` \| ``null`` |
| `matcher` | [`Matcher`](takaro_lib_components.testing.md#matcher) |
| `options?` | [`MatcherOptions`](../interfaces/takaro_lib_components.testing.MatcherOptions.md) |

##### Returns

`boolean`

#### Defined in

node_modules/@testing-library/dom/types/matches.d.ts:30

___

### Matcher

Ƭ **Matcher**: [`MatcherFunction`](takaro_lib_components.testing.md#matcherfunction) \| `RegExp` \| `number` \| `string`

#### Defined in

node_modules/@testing-library/dom/types/matches.d.ts:7

___

### MatcherFunction

Ƭ **MatcherFunction**: (`content`: `string`, `element`: `Element` \| ``null``) => `boolean`

#### Type declaration

▸ (`content`, `element`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `content` | `string` |
| `element` | `Element` \| ``null`` |

##### Returns

`boolean`

#### Defined in

node_modules/@testing-library/dom/types/matches.d.ts:3

___

### Method

Ƭ **Method**: ``"AltText"`` \| ``"alttext"`` \| ``"DisplayValue"`` \| ``"displayvalue"`` \| ``"LabelText"`` \| ``"labeltext"`` \| ``"PlaceholderText"`` \| ``"placeholdertext"`` \| ``"Role"`` \| ``"role"`` \| ``"TestId"`` \| ``"testid"`` \| ``"Text"`` \| ``"text"`` \| ``"Title"`` \| ``"title"``

#### Defined in

node_modules/@testing-library/dom/types/suggestions.d.ts:24

___

### NormalizerFn

Ƭ **NormalizerFn**: (`text`: `string`) => `string`

#### Type declaration

▸ (`text`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

##### Returns

`string`

#### Defined in

node_modules/@testing-library/dom/types/matches.d.ts:13

___

### Query

Ƭ **Query**: (`container`: `HTMLElement`, ...`args`: `any`[]) => `Error` \| `HTMLElement` \| `HTMLElement`[] \| `Promise`<`HTMLElement`[]\> \| `Promise`<`HTMLElement`\> \| ``null``

#### Type declaration

▸ (`container`, ...`args`): `Error` \| `HTMLElement` \| `HTMLElement`[] \| `Promise`<`HTMLElement`[]\> \| `Promise`<`HTMLElement`\> \| ``null``

##### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `...args` | `any`[] |

##### Returns

`Error` \| `HTMLElement` \| `HTMLElement`[] \| `Promise`<`HTMLElement`[]\> \| `Promise`<`HTMLElement`\> \| ``null``

#### Defined in

node_modules/@testing-library/dom/types/get-queries-for-element.d.ts:163

___

### QueryArgs

Ƭ **QueryArgs**: [`string`, QueryOptions?]

#### Defined in

node_modules/@testing-library/dom/types/suggestions.d.ts:5

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

### RenderResult

Ƭ **RenderResult**<`Q`, `Container`, `BaseElement`\>: { `asFragment`: () => `DocumentFragment` ; `baseElement`: `BaseElement` ; `container`: `Container` ; `debug`: (`baseElement?`: `Element` \| `DocumentFragment` \| (`Element` \| `DocumentFragment`)[], `maxLength?`: `number`, `options?`: [`OptionsReceived`](takaro_lib_components.testing.prettyFormat.md#optionsreceived)) => `void` ; `rerender`: (`ui`: `React.ReactElement`) => `void` ; `unmount`: () => `void`  } & { [P in keyof Q]: BoundFunction<Q[P]\> }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Q` | extends [`Queries`](../interfaces/takaro_lib_components.testing.Queries-1.md) = typeof [`queries`](takaro_lib_components.testing.queries.md) |
| `Container` | extends `Element` \| `DocumentFragment` = `HTMLElement` |
| `BaseElement` | extends `Element` \| `DocumentFragment` = `Container` |

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:14

___

### Screen

Ƭ **Screen**<`Q`\>: [`BoundFunctions`](takaro_lib_components.testing.md#boundfunctions)<`Q`\> & { `debug`: (`element?`: (`Element` \| `HTMLDocument`)[] \| `Element` \| `HTMLDocument`, `maxLength?`: `number`, `options?`: [`OptionsReceived`](takaro_lib_components.testing.prettyFormat.md#optionsreceived)) => `void` ; `logTestingPlaygroundURL`: (`element?`: `Element` \| `HTMLDocument`) => `string`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Q` | extends [`Queries`](../interfaces/takaro_lib_components.testing.Queries-1.md) = typeof [`queries`](takaro_lib_components.testing.queries.md) |

#### Defined in

node_modules/@testing-library/dom/types/screen.d.ts:5

___

### Variant

Ƭ **Variant**: ``"find"`` \| ``"findAll"`` \| ``"get"`` \| ``"getAll"`` \| ``"query"`` \| ``"queryAll"``

#### Defined in

node_modules/@testing-library/dom/types/suggestions.d.ts:16

___

### WithSuggest

Ƭ **WithSuggest**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `suggest?` | `boolean` |

#### Defined in

node_modules/@testing-library/dom/types/query-helpers.d.ts:4

## Variables

### screen

• `Const` **screen**: [`Screen`](takaro_lib_components.testing.md#screen)

#### Defined in

node_modules/@testing-library/dom/types/screen.d.ts:22

## Functions

### act

▸ **act**(`callback`): `Promise`<`undefined`\>

Simply calls ReactDOMTestUtils.act(cb)
If that's not available (older version of react) then it
simply calls the given callback immediately

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | () => `Promise`<`void`\> |

#### Returns

`Promise`<`undefined`\>

#### Defined in

node_modules/@types/react-dom/test-utils/index.d.ts:301

▸ **act**(`callback`): `void`

Simply calls ReactDOMTestUtils.act(cb)
If that's not available (older version of react) then it
simply calls the given callback immediately

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | () => `VoidOrUndefinedOnly` |

#### Returns

`void`

#### Defined in

node_modules/@types/react-dom/test-utils/index.d.ts:302

___

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

### cleanup

▸ **cleanup**(): `void`

Unmounts React trees that were mounted with render.

#### Returns

`void`

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:154

___

### computeHeadingLevel

▸ **computeHeadingLevel**(`element`): `number` \| `undefined`

#### Parameters

| Name | Type |
| :------ | :------ |
| `element` | `Element` |

#### Returns

`number` \| `undefined`

#### Defined in

node_modules/@testing-library/dom/types/role-helpers.d.ts:9

___

### configure

▸ **configure**(`configDelta`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configDelta` | [`ConfigFn`](../interfaces/takaro_lib_components.testing.ConfigFn.md) \| `Partial`<[`Config`](../interfaces/takaro_lib_components.testing.Config.md)\> |

#### Returns

`void`

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:26

___

### createEvent

▸ **createEvent**(`eventName`, `node`, `init?`, `options?`): `Event`

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` |
| `node` | `Element` \| `Node` \| `Window` \| `Document` |
| `init?` | `Object` |
| `options?` | `Object` |
| `options.EventType?` | `string` |
| `options.defaultInit?` | `Object` |

#### Returns

`Event`

#### Defined in

node_modules/@testing-library/dom/types/events.d.ts:100

___

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

### fireEvent

▸ **fireEvent**(`element`, `event`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `element` | `Element` \| `Node` \| `Window` \| `Document` |
| `event` | `Event` |

#### Returns

`boolean`

#### Defined in

node_modules/@testing-library/dom/types/events.d.ts:90

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

### getConfig

▸ **getConfig**(): [`Config`](../interfaces/takaro_lib_components.testing.Config.md)

#### Returns

[`Config`](../interfaces/takaro_lib_components.testing.Config.md)

#### Defined in

node_modules/@testing-library/dom/types/config.d.ts:27

___

### getDefaultNormalizer

▸ **getDefaultNormalizer**(`options?`): [`NormalizerFn`](takaro_lib_components.testing.md#normalizerfn)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | [`DefaultNormalizerOptions`](../interfaces/takaro_lib_components.testing.DefaultNormalizerOptions.md) |

#### Returns

[`NormalizerFn`](takaro_lib_components.testing.md#normalizerfn)

#### Defined in

node_modules/@testing-library/dom/types/matches.d.ts:42

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

### getNodeText

▸ **getNodeText**(`node`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | `HTMLElement` |

#### Returns

`string`

#### Defined in

node_modules/@testing-library/dom/types/get-node-text.d.ts:1

___

### getQueriesForElement

▸ **getQueriesForElement**<`QueriesToBind`, `T`\>(`element`, `queriesToBind?`): [`BoundFunctions`](takaro_lib_components.testing.md#boundfunctions)<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `QueriesToBind` | extends [`Queries`](../interfaces/takaro_lib_components.testing.Queries-1.md) = [`queries`](takaro_lib_components.testing.queries.md) |
| `T` | extends [`Queries`](../interfaces/takaro_lib_components.testing.Queries-1.md) = `QueriesToBind` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `element` | `HTMLElement` |
| `queriesToBind?` | `T` |

#### Returns

[`BoundFunctions`](takaro_lib_components.testing.md#boundfunctions)<`T`\>

#### Defined in

node_modules/@testing-library/dom/types/get-queries-for-element.d.ts:178

___

### getRoles

▸ **getRoles**(`container`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |

#### Returns

`Object`

#### Defined in

node_modules/@testing-library/dom/types/role-helpers.d.ts:2

___

### getSuggestedQuery

▸ **getSuggestedQuery**(`element`, `variant?`, `method?`): [`Suggestion`](../interfaces/takaro_lib_components.testing.Suggestion.md) \| `undefined`

#### Parameters

| Name | Type |
| :------ | :------ |
| `element` | `HTMLElement` |
| `variant?` | [`Variant`](takaro_lib_components.testing.md#variant) |
| `method?` | [`Method`](takaro_lib_components.testing.md#method) |

#### Returns

[`Suggestion`](../interfaces/takaro_lib_components.testing.Suggestion.md) \| `undefined`

#### Defined in

node_modules/@testing-library/dom/types/suggestions.d.ts:42

___

### isInaccessible

▸ **isInaccessible**(`element`): `boolean`

https://testing-library.com/docs/dom-testing-library/api-helpers#isinaccessible

#### Parameters

| Name | Type |
| :------ | :------ |
| `element` | `Element` |

#### Returns

`boolean`

#### Defined in

node_modules/@testing-library/dom/types/role-helpers.d.ts:8

___

### logDOM

▸ **logDOM**(`dom?`, `maxLength?`, `options?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `dom?` | `Element` \| `HTMLDocument` |
| `maxLength?` | `number` |
| `options?` | [`PrettyDOMOptions`](../interfaces/takaro_lib_components.testing.PrettyDOMOptions.md) |

#### Returns

`void`

#### Defined in

node_modules/@testing-library/dom/types/pretty-dom.d.ts:16

___

### logRoles

▸ **logRoles**(`container`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |

#### Returns

`string`

#### Defined in

node_modules/@testing-library/dom/types/role-helpers.d.ts:1

___

### prettyDOM

▸ **prettyDOM**(`dom?`, `maxLength?`, `options?`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `dom?` | `Element` \| `HTMLDocument` |
| `maxLength?` | `number` |
| `options?` | [`PrettyDOMOptions`](../interfaces/takaro_lib_components.testing.PrettyDOMOptions.md) |

#### Returns

`string` \| ``false``

#### Defined in

node_modules/@testing-library/dom/types/pretty-dom.d.ts:11

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

___

### render

▸ **render**(`ui`, `options?`): [`RenderResult`](takaro_lib_components.testing.md#renderresult)<[`queries`](takaro_lib_components.testing.queries.md), `HTMLElement`, `HTMLElement`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ui` | `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\> |
| `options?` | `Omit`<[`RenderOptions`](../interfaces/takaro_lib_components.testing.RenderOptions.md)<[`queries`](takaro_lib_components.testing.queries.md), `HTMLElement`, `HTMLElement`\>, ``"wrapper"``\> |

#### Returns

[`RenderResult`](takaro_lib_components.testing.md#renderresult)<[`queries`](takaro_lib_components.testing.queries.md), `HTMLElement`, `HTMLElement`\>

#### Defined in

[packages/lib-components/src/test/testUtils.tsx:21](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-components/src/test/testUtils.tsx#L21)

___

### renderHook

▸ **renderHook**<`Result`, `Props`, `Q`, `Container`, `BaseElement`\>(`render`, `options?`): [`RenderHookResult`](../interfaces/takaro_lib_components.testing.RenderHookResult.md)<`Result`, `Props`\>

Allows you to render a hook within a test React component without having to
create that component yourself.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Result` | `Result` |
| `Props` | `Props` |
| `Q` | extends [`Queries`](../interfaces/takaro_lib_components.testing.Queries-1.md) = [`queries`](takaro_lib_components.testing.queries.md) |
| `Container` | extends `Element` \| `DocumentFragment` = `HTMLElement` |
| `BaseElement` | extends `Element` \| `DocumentFragment` = `Container` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `render` | (`initialProps`: `Props`) => `Result` |
| `options?` | [`RenderHookOptions`](../interfaces/takaro_lib_components.testing.RenderHookOptions.md)<`Props`, `Q`, `Container`, `BaseElement`\> |

#### Returns

[`RenderHookResult`](../interfaces/takaro_lib_components.testing.RenderHookResult.md)<`Result`, `Props`\>

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:140

___

### waitFor

▸ **waitFor**<`T`\>(`callback`, `options?`): `Promise`<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | () => `T` \| `Promise`<`T`\> |
| `options?` | [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md) |

#### Returns

`Promise`<`T`\>

#### Defined in

node_modules/@testing-library/dom/types/wait-for.d.ts:9

___

### waitForElementToBeRemoved

▸ **waitForElementToBeRemoved**<`T`\>(`callback`, `options?`): `Promise`<`void`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | `T` \| () => `T` |
| `options?` | [`waitForOptions`](../interfaces/takaro_lib_components.testing.waitForOptions.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

node_modules/@testing-library/dom/types/wait-for-element-to-be-removed.d.ts:3

___

### within

▸ **within**<`QueriesToBind`, `T`\>(`element`, `queriesToBind?`): [`BoundFunctions`](takaro_lib_components.testing.md#boundfunctions)<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `QueriesToBind` | extends [`Queries`](../interfaces/takaro_lib_components.testing.Queries-1.md) = [`queries`](takaro_lib_components.testing.queries.md) |
| `T` | extends [`Queries`](../interfaces/takaro_lib_components.testing.Queries-1.md) = `QueriesToBind` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `element` | `HTMLElement` |
| `queriesToBind?` | `T` |

#### Returns

[`BoundFunctions`](takaro_lib_components.testing.md#boundfunctions)<`T`\>

#### Defined in

node_modules/@testing-library/dom/types/get-queries-for-element.d.ts:178
