---
id: "takaro_lib_components.testing.RenderHookOptions"
title: "Interface: RenderHookOptions<Props, Q, Container, BaseElement>"
sidebar_label: "@takaro/lib-components.testing.RenderHookOptions"
custom_edit_url: null
---

[@takaro/lib-components](../modules/takaro_lib_components.md).[testing](../namespaces/takaro_lib_components.testing.md).RenderHookOptions

## Type parameters

| Name | Type |
| :------ | :------ |
| `Props` | `Props` |
| `Q` | extends [`Queries`](takaro_lib_components.testing.Queries-1.md) = typeof [`queries`](../namespaces/takaro_lib_components.testing.queries.md) |
| `Container` | extends `Element` \| `DocumentFragment` = `HTMLElement` |
| `BaseElement` | extends `Element` \| `DocumentFragment` = `Container` |

## Hierarchy

- [`RenderOptions`](takaro_lib_components.testing.RenderOptions.md)<`Q`, `Container`, `BaseElement`\>

  ↳ **`RenderHookOptions`**

## Properties

### baseElement

• `Optional` **baseElement**: `BaseElement`

Defaults to the container if the container is specified. Otherwise `document.body` is used for the default. This is used as
 the base element for the queries as well as what is printed when you use `debug()`.

**`See`**

https://testing-library.com/docs/react-testing-library/api/#baseelement

#### Inherited from

[RenderOptions](takaro_lib_components.testing.RenderOptions.md).[baseElement](takaro_lib_components.testing.RenderOptions.md#baseelement)

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:55

___

### container

• `Optional` **container**: `Container`

By default, React Testing Library will create a div and append that div to the document.body. Your React component will be rendered in the created div. If you provide your own HTMLElement container via this option,
 it will not be appended to the document.body automatically.

 For example: If you are unit testing a `<tbody>` element, it cannot be a child of a div. In this case, you can
 specify a table as the render container.

**`See`**

https://testing-library.com/docs/react-testing-library/api/#container

#### Inherited from

[RenderOptions](takaro_lib_components.testing.RenderOptions.md).[container](takaro_lib_components.testing.RenderOptions.md#container)

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:48

___

### hydrate

• `Optional` **hydrate**: `boolean`

If `hydrate` is set to `true`, then it will render with `ReactDOM.hydrate`. This may be useful if you are using server-side
 rendering and use ReactDOM.hydrate to mount your components.

**`See`**

https://testing-library.com/docs/react-testing-library/api/#hydrate)

#### Inherited from

[RenderOptions](takaro_lib_components.testing.RenderOptions.md).[hydrate](takaro_lib_components.testing.RenderOptions.md#hydrate)

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:62

___

### initialProps

• `Optional` **initialProps**: `Props`

The argument passed to the renderHook callback. Can be useful if you plan
to use the rerender utility to change the values passed to your hook.

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:133

___

### legacyRoot

• `Optional` **legacyRoot**: `boolean`

Set to `true` if you want to force synchronous `ReactDOM.render`.
Otherwise `render` will default to concurrent React if available.

#### Inherited from

[RenderOptions](takaro_lib_components.testing.RenderOptions.md).[legacyRoot](takaro_lib_components.testing.RenderOptions.md#legacyroot)

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:67

___

### queries

• `Optional` **queries**: `Q`

Queries to bind. Overrides the default set from DOM Testing Library unless merged.

**`See`**

https://testing-library.com/docs/react-testing-library/api/#queries

#### Inherited from

[RenderOptions](takaro_lib_components.testing.RenderOptions.md).[queries](takaro_lib_components.testing.RenderOptions.md#queries)

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:73

___

### wrapper

• `Optional` **wrapper**: `JSXElementConstructor`<{ `children`: `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>  }\>

Pass a React Component as the wrapper option to have it rendered around the inner element. This is most useful for creating
 reusable custom render functions for common data providers. See setup for examples.

**`See`**

https://testing-library.com/docs/react-testing-library/api/#wrapper

#### Inherited from

[RenderOptions](takaro_lib_components.testing.RenderOptions.md).[wrapper](takaro_lib_components.testing.RenderOptions.md#wrapper)

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:80
