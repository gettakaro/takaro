---
id: "takaro_lib_components.testing.queries.ByRoleOptions"
title: "Interface: ByRoleOptions"
sidebar_label: "@takaro/lib-components.testing.queries.ByRoleOptions"
custom_edit_url: null
---

[testing](../namespaces/takaro_lib_components.testing.md).[queries](../namespaces/takaro_lib_components.testing.queries.md).ByRoleOptions

## Hierarchy

- [`MatcherOptions`](takaro_lib_components.testing.MatcherOptions.md)

  ↳ **`ByRoleOptions`**

## Properties

### checked

• `Optional` **checked**: `boolean`

If true only includes elements in the query set that are marked as
checked in the accessibility tree, i.e., `aria-checked="true"`

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:85

___

### collapseWhitespace

• `Optional` **collapseWhitespace**: `boolean`

Use normalizer with getDefaultNormalizer instead

#### Inherited from

[MatcherOptions](takaro_lib_components.testing.MatcherOptions.md).[collapseWhitespace](takaro_lib_components.testing.MatcherOptions.md#collapsewhitespace)

#### Defined in

node_modules/@testing-library/dom/types/matches.d.ts:24

___

### current

• `Optional` **current**: `string` \| `boolean`

Filters elements by their `aria-current` state. `true` and `false` match `aria-current="true"` and `aria-current="false"` (as well as a missing `aria-current` attribute) respectively.

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:94

___

### description

• `Optional` **description**: `string` \| `RegExp` \| (`accessibleDescription`: `string`, `element`: `Element`) => `boolean`

Only considers elements with the specified accessible description.

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:121

___

### exact

• `Optional` **exact**: `boolean`

#### Inherited from

[MatcherOptions](takaro_lib_components.testing.MatcherOptions.md).[exact](takaro_lib_components.testing.MatcherOptions.md#exact)

#### Defined in

node_modules/@testing-library/dom/types/matches.d.ts:20

___

### expanded

• `Optional` **expanded**: `boolean`

If true only includes elements in the query set that are marked as
expanded in the accessibility tree, i.e., `aria-expanded="true"`

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:99

___

### hidden

• `Optional` **hidden**: `boolean`

If true includes elements in the query set that are usually excluded from
the accessibility tree. `role="none"` or `role="presentation"` are included
in either case.

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:75

___

### level

• `Optional` **level**: `number`

Includes elements with the `"heading"` role matching the indicated level,
either by the semantic HTML heading elements `<h1>-<h6>` or matching
the `aria-level` attribute.

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:105

___

### name

• `Optional` **name**: `string` \| `RegExp` \| (`accessibleName`: `string`, `element`: `Element`) => `boolean`

Only considers elements with the specified accessible name.

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:114

___

### normalizer

• `Optional` **normalizer**: [`NormalizerFn`](../namespaces/takaro_lib_components.testing.md#normalizerfn)

#### Inherited from

[MatcherOptions](takaro_lib_components.testing.MatcherOptions.md).[normalizer](takaro_lib_components.testing.MatcherOptions.md#normalizer)

#### Defined in

node_modules/@testing-library/dom/types/matches.d.ts:25

___

### pressed

• `Optional` **pressed**: `boolean`

If true only includes elements in the query set that are marked as
pressed in the accessibility tree, i.e., `aria-pressed="true"`

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:90

___

### queryFallbacks

• `Optional` **queryFallbacks**: `boolean`

Includes every role used in the `role` attribute
For example *ByRole('progressbar', {queryFallbacks: true})` will find <div role="meter progressbar">`.

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:110

___

### selected

• `Optional` **selected**: `boolean`

If true only includes elements in the query set that are marked as
selected in the accessibility tree, i.e., `aria-selected="true"`

#### Defined in

node_modules/@testing-library/dom/types/queries.d.ts:80

___

### suggest

• `Optional` **suggest**: `boolean`

suppress suggestions for a specific query

#### Inherited from

[MatcherOptions](takaro_lib_components.testing.MatcherOptions.md).[suggest](takaro_lib_components.testing.MatcherOptions.md#suggest)

#### Defined in

node_modules/@testing-library/dom/types/matches.d.ts:27

___

### trim

• `Optional` **trim**: `boolean`

Use normalizer with getDefaultNormalizer instead

#### Inherited from

[MatcherOptions](takaro_lib_components.testing.MatcherOptions.md).[trim](takaro_lib_components.testing.MatcherOptions.md#trim)

#### Defined in

node_modules/@testing-library/dom/types/matches.d.ts:22
