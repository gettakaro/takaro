---
id: "takaro_http.PaginationMiddleware"
title: "Class: PaginationMiddleware"
sidebar_label: "@takaro/http.PaginationMiddleware"
custom_edit_url: null
---

[@takaro/http](../modules/takaro_http.md).PaginationMiddleware

## Implements

- `ExpressMiddlewareInterface`

## Constructors

### constructor

• **new PaginationMiddleware**()

## Methods

### use

▸ **use**(`req`, `res`, `next`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | [`PaginatedRequest`](../interfaces/takaro_http.PaginatedRequest.md) |
| `res` | `Response`<`any`, `Record`<`string`, `any`\>\> |
| `next` | `NextFunction` |

#### Returns

`Promise`<`void`\>

#### Implementation of

ExpressMiddlewareInterface.use

#### Defined in

[packages/lib-http/src/middleware/paginationMiddleware.ts:20](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/middleware/paginationMiddleware.ts#L20)
