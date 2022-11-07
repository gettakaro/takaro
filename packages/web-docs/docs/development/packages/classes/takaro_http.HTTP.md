---
id: "takaro_http.HTTP"
title: "Class: HTTP"
sidebar_label: "@takaro/http.HTTP"
custom_edit_url: null
---

[@takaro/http](../modules/takaro_http.md).HTTP

## Constructors

### constructor

• **new HTTP**(`options?`, `httpOptions?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `RoutingControllersOptions` |
| `httpOptions` | `IHTTPOptions` |

#### Defined in

[packages/lib-http/src/app.ts:26](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/app.ts#L26)

## Properties

### app

• `Private` **app**: `Application`

#### Defined in

[packages/lib-http/src/app.ts:22](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/app.ts#L22)

___

### httpOptions

• `Private` **httpOptions**: `IHTTPOptions` = `{}`

#### Defined in

[packages/lib-http/src/app.ts:28](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/app.ts#L28)

___

### httpServer

• `Private` **httpServer**: `Server`<typeof `IncomingMessage`, typeof `ServerResponse`\>

#### Defined in

[packages/lib-http/src/app.ts:23](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/app.ts#L23)

___

### logger

• `Private` **logger**: `Logger`

#### Defined in

[packages/lib-http/src/app.ts:24](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/app.ts#L24)

## Accessors

### expressInstance

• `get` **expressInstance**(): `Application`

#### Returns

`Application`

#### Defined in

[packages/lib-http/src/app.ts:69](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/app.ts#L69)

___

### server

• `get` **server**(): `Server`<typeof `IncomingMessage`, typeof `ServerResponse`\>

#### Returns

`Server`<typeof `IncomingMessage`, typeof `ServerResponse`\>

#### Defined in

[packages/lib-http/src/app.ts:73](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/app.ts#L73)

## Methods

### start

▸ **start**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/lib-http/src/app.ts:77](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/app.ts#L77)

___

### stop

▸ **stop**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/lib-http/src/app.ts:85](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/app.ts#L85)
