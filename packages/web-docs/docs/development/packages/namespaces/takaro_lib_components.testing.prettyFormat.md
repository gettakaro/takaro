---
id: "takaro_lib_components.testing.prettyFormat"
title: "Namespace: prettyFormat"
sidebar_label: "@takaro/lib-components.testing.prettyFormat"
custom_edit_url: null
---

[@takaro/lib-components](../modules/takaro_lib_components.md).[testing](takaro_lib_components.testing.md).prettyFormat

## Interfaces

- [PrettyFormatOptions](../interfaces/takaro_lib_components.testing.prettyFormat.PrettyFormatOptions.md)

## References

### default

Renames and re-exports [format](takaro_lib_components.testing.prettyFormat.md#format)

## Type Aliases

### Colors

Ƭ **Colors**: `Object`

Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `comment` | { `close`: `string` ; `open`: `string`  } |
| `comment.close` | `string` |
| `comment.open` | `string` |
| `content` | { `close`: `string` ; `open`: `string`  } |
| `content.close` | `string` |
| `content.open` | `string` |
| `prop` | { `close`: `string` ; `open`: `string`  } |
| `prop.close` | `string` |
| `prop.open` | `string` |
| `tag` | { `close`: `string` ; `open`: `string`  } |
| `tag.close` | `string` |
| `tag.open` | `string` |
| `value` | { `close`: `string` ; `open`: `string`  } |
| `value.close` | `string` |
| `value.open` | `string` |

#### Defined in

node_modules/pretty-format/build/types.d.ts:7

___

### CompareKeys

Ƭ **CompareKeys**: (`a`: `string`, `b`: `string`) => `number` \| `undefined`

#### Defined in

node_modules/pretty-format/build/types.d.ts:46

___

### Config

Ƭ **Config**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `callToJSON` | `boolean` |
| `colors` | [`Colors`](takaro_lib_components.testing.prettyFormat.md#colors) |
| `compareKeys` | [`CompareKeys`](takaro_lib_components.testing.prettyFormat.md#comparekeys) |
| `escapeRegex` | `boolean` |
| `escapeString` | `boolean` |
| `indent` | `string` |
| `maxDepth` | `number` |
| `min` | `boolean` |
| `plugins` | [`Plugins`](takaro_lib_components.testing.prettyFormat.md#plugins) |
| `printBasicPrototype` | `boolean` |
| `printFunctionName` | `boolean` |
| `spacingInner` | `string` |
| `spacingOuter` | `string` |

#### Defined in

node_modules/pretty-format/build/types.d.ts:76

___

### NewPlugin

Ƭ **NewPlugin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `serialize` | (`val`: `any`, `config`: [`Config`](takaro_lib_components.testing.prettyFormat.md#config), `indentation`: `string`, `depth`: `number`, `refs`: [`Refs`](takaro_lib_components.testing.prettyFormat.md#refs), `printer`: [`Printer`](takaro_lib_components.testing.prettyFormat.md#printer)) => `string` |
| `test` | `Test` |

#### Defined in

node_modules/pretty-format/build/types.d.ts:93

___

### OldPlugin

Ƭ **OldPlugin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `print` | (`val`: `unknown`, `print`: `Print`, `indent`: `Indent`, `options`: `PluginOptions`, `colors`: [`Colors`](takaro_lib_components.testing.prettyFormat.md#colors)) => `string` |
| `test` | `Test` |

#### Defined in

node_modules/pretty-format/build/types.d.ts:102

___

### Options

Ƭ **Options**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `callToJSON` | `boolean` |
| `compareKeys` | [`CompareKeys`](takaro_lib_components.testing.prettyFormat.md#comparekeys) |
| `escapeRegex` | `boolean` |
| `escapeString` | `boolean` |
| `highlight` | `boolean` |
| `indent` | `number` |
| `maxDepth` | `number` |
| `min` | `boolean` |
| `plugins` | [`Plugins`](takaro_lib_components.testing.prettyFormat.md#plugins) |
| `printBasicPrototype` | `boolean` |
| `printFunctionName` | `boolean` |
| `theme` | [`Theme`](takaro_lib_components.testing.prettyFormat.md#theme) |

#### Defined in

node_modules/pretty-format/build/types.d.ts:47

___

### OptionsReceived

Ƭ **OptionsReceived**: [`PrettyFormatOptions`](../interfaces/takaro_lib_components.testing.prettyFormat.PrettyFormatOptions.md)

#### Defined in

node_modules/pretty-format/build/types.d.ts:75

___

### Plugin

Ƭ **Plugin**: [`NewPlugin`](takaro_lib_components.testing.prettyFormat.md#newplugin) \| [`OldPlugin`](takaro_lib_components.testing.prettyFormat.md#oldplugin)

#### Defined in

node_modules/pretty-format/build/types.d.ts:106

___

### Plugins

Ƭ **Plugins**: [`Plugin`](takaro_lib_components.testing.prettyFormat.md#plugin)[]

#### Defined in

node_modules/pretty-format/build/types.d.ts:107

___

### Printer

Ƭ **Printer**: (`val`: `unknown`, `config`: [`Config`](takaro_lib_components.testing.prettyFormat.md#config), `indentation`: `string`, `depth`: `number`, `refs`: [`Refs`](takaro_lib_components.testing.prettyFormat.md#refs), `hasCalledToJSON?`: `boolean`) => `string`

#### Type declaration

▸ (`val`, `config`, `indentation`, `depth`, `refs`, `hasCalledToJSON?`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `val` | `unknown` |
| `config` | [`Config`](takaro_lib_components.testing.prettyFormat.md#config) |
| `indentation` | `string` |
| `depth` | `number` |
| `refs` | [`Refs`](takaro_lib_components.testing.prettyFormat.md#refs) |
| `hasCalledToJSON?` | `boolean` |

##### Returns

`string`

#### Defined in

node_modules/pretty-format/build/types.d.ts:91

___

### Refs

Ƭ **Refs**: `unknown`[]

#### Defined in

node_modules/pretty-format/build/types.d.ts:30

___

### Theme

Ƭ **Theme**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `comment` | `string` |
| `content` | `string` |
| `prop` | `string` |
| `tag` | `string` |
| `value` | `string` |

#### Defined in

node_modules/pretty-format/build/types.d.ts:32

## Variables

### DEFAULT\_OPTIONS

• `Const` **DEFAULT\_OPTIONS**: [`Options`](takaro_lib_components.testing.prettyFormat.md#options)

#### Defined in

node_modules/pretty-format/build/index.d.ts:9

___

### plugins

• `Const` **plugins**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `AsymmetricMatcher` | [`NewPlugin`](takaro_lib_components.testing.prettyFormat.md#newplugin) |
| `ConvertAnsi` | [`NewPlugin`](takaro_lib_components.testing.prettyFormat.md#newplugin) |
| `DOMCollection` | [`NewPlugin`](takaro_lib_components.testing.prettyFormat.md#newplugin) |
| `DOMElement` | [`NewPlugin`](takaro_lib_components.testing.prettyFormat.md#newplugin) |
| `Immutable` | [`NewPlugin`](takaro_lib_components.testing.prettyFormat.md#newplugin) |
| `ReactElement` | [`NewPlugin`](takaro_lib_components.testing.prettyFormat.md#newplugin) |
| `ReactTestComponent` | [`NewPlugin`](takaro_lib_components.testing.prettyFormat.md#newplugin) |

#### Defined in

node_modules/pretty-format/build/index.d.ts:16

## Functions

### format

▸ **format**(`val`, `options?`): `string`

Returns a presentation string of your `val` object

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `val` | `unknown` | any potential JavaScript object |
| `options?` | [`PrettyFormatOptions`](../interfaces/takaro_lib_components.testing.prettyFormat.PrettyFormatOptions.md) | Custom settings |

#### Returns

`string`

#### Defined in

node_modules/pretty-format/build/index.d.ts:15
