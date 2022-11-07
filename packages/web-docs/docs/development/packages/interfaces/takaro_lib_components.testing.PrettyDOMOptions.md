---
id: "takaro_lib_components.testing.PrettyDOMOptions"
title: "Interface: PrettyDOMOptions"
sidebar_label: "@takaro/lib-components.testing.PrettyDOMOptions"
custom_edit_url: null
---

[@takaro/lib-components](../modules/takaro_lib_components.md).[testing](../namespaces/takaro_lib_components.testing.md).PrettyDOMOptions

## Hierarchy

- [`OptionsReceived`](../namespaces/takaro_lib_components.testing.prettyFormat.md#optionsreceived)

  ↳ **`PrettyDOMOptions`**

## Properties

### callToJSON

• `Optional` **callToJSON**: `boolean`

#### Inherited from

prettyFormat.OptionsReceived.callToJSON

#### Defined in

node_modules/pretty-format/build/types.d.ts:62

___

### compareKeys

• `Optional` **compareKeys**: [`CompareKeys`](../namespaces/takaro_lib_components.testing.prettyFormat.md#comparekeys)

#### Inherited from

prettyFormat.OptionsReceived.compareKeys

#### Defined in

node_modules/pretty-format/build/types.d.ts:63

___

### escapeRegex

• `Optional` **escapeRegex**: `boolean`

#### Inherited from

prettyFormat.OptionsReceived.escapeRegex

#### Defined in

node_modules/pretty-format/build/types.d.ts:64

___

### escapeString

• `Optional` **escapeString**: `boolean`

#### Inherited from

prettyFormat.OptionsReceived.escapeString

#### Defined in

node_modules/pretty-format/build/types.d.ts:65

___

### filterNode

• `Optional` **filterNode**: (`node`: `Node`) => `boolean`

#### Type declaration

▸ (`node`): `boolean`

Given a `Node` return `false` if you wish to ignore that node in the output.
By default, ignores `<style />`, `<script />` and comment nodes.

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | `Node` |

##### Returns

`boolean`

#### Defined in

node_modules/@testing-library/dom/types/pretty-dom.d.ts:8

___

### highlight

• `Optional` **highlight**: `boolean`

#### Inherited from

prettyFormat.OptionsReceived.highlight

#### Defined in

node_modules/pretty-format/build/types.d.ts:66

___

### indent

• `Optional` **indent**: `number`

#### Inherited from

prettyFormat.OptionsReceived.indent

#### Defined in

node_modules/pretty-format/build/types.d.ts:67

___

### maxDepth

• `Optional` **maxDepth**: `number`

#### Inherited from

prettyFormat.OptionsReceived.maxDepth

#### Defined in

node_modules/pretty-format/build/types.d.ts:68

___

### min

• `Optional` **min**: `boolean`

#### Inherited from

prettyFormat.OptionsReceived.min

#### Defined in

node_modules/pretty-format/build/types.d.ts:69

___

### plugins

• `Optional` **plugins**: [`Plugins`](../namespaces/takaro_lib_components.testing.prettyFormat.md#plugins)

#### Inherited from

prettyFormat.OptionsReceived.plugins

#### Defined in

node_modules/pretty-format/build/types.d.ts:70

___

### printBasicPrototype

• `Optional` **printBasicPrototype**: `boolean`

#### Inherited from

prettyFormat.OptionsReceived.printBasicPrototype

#### Defined in

node_modules/pretty-format/build/types.d.ts:71

___

### printFunctionName

• `Optional` **printFunctionName**: `boolean`

#### Inherited from

prettyFormat.OptionsReceived.printFunctionName

#### Defined in

node_modules/pretty-format/build/types.d.ts:72

___

### theme

• `Optional` **theme**: `ThemeReceived`

#### Inherited from

prettyFormat.OptionsReceived.theme

#### Defined in

node_modules/pretty-format/build/types.d.ts:73
