---
id: "takaro_lib_components.testing.RenderOptions"
title: "Interface: RenderOptions<Q, Container, BaseElement>"
sidebar_label: "@takaro/lib-components.testing.RenderOptions"
custom_edit_url: null
---

[@takaro/lib-components](../modules/takaro_lib_components.md).[testing](../namespaces/takaro_lib_components.testing.md).RenderOptions

## Type parameters

| Name | Type |
| :------ | :------ |
| `Q` | extends [`Queries`](takaro_lib_components.testing.Queries-1.md) = typeof [`queries`](../namespaces/takaro_lib_components.testing.queries.md) |
| `Container` | extends `Element` \| `DocumentFragment` = `HTMLElement` |
| `BaseElement` | extends `Element` \| `DocumentFragment` = `Container` |

## Hierarchy

- **`RenderOptions`**

  ↳ [`RenderHookOptions`](takaro_lib_components.testing.RenderHookOptions.md)

## Properties

### baseElement

• `Optional` **baseElement**: `BaseElement`

Defaults to the container if the container is specified. Otherwise `document.body` is used for the default. This is used as
 the base element for the queries as well as what is printed when you use `debug()`.

**`See`**

https://testing-library.com/docs/react-testing-library/api/#baseelement

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

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:48

___

### hydrate

• `Optional` **hydrate**: `boolean`

If `hydrate` is set to `true`, then it will render with `ReactDOM.hydrate`. This may be useful if you are using server-side
 rendering and use ReactDOM.hydrate to mount your components.

**`See`**

https://testing-library.com/docs/react-testing-library/api/#hydrate)

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:62

___

### legacyRoot

• `Optional` **legacyRoot**: `boolean`

Set to `true` if you want to force synchronous `ReactDOM.render`.
Otherwise `render` will default to concurrent React if available.

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:67

___

### queries

• `Optional` **queries**: `Q`

Queries to bind. Overrides the default set from DOM Testing Library unless merged.

**`See`**

https://testing-library.com/docs/react-testing-library/api/#queries

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:73

___

### wrapper

• `Optional` **wrapper**: `JSXElementConstructor`<{ `children`: `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>  }\>

Pass a React Component as the wrapper option to have it rendered around the inner element. This is most useful for creating
 reusable custom render functions for common data providers. See setup for examples.

**`See`**

https://testing-library.com/docs/react-testing-library/api/#wrapper

#### Defined in

node_modules/@testing-library/react/types/index.d.ts:80
