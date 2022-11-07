---
id: "takaro_http"
title: "Module: @takaro/http"
sidebar_label: "@takaro/http"
sidebar_position: 0
custom_edit_url: null
---

## Classes

- [APIOutput](../classes/takaro_http.APIOutput.md)
- [HTTP](../classes/takaro_http.HTTP.md)
- [PaginationMiddleware](../classes/takaro_http.PaginationMiddleware.md)

## Interfaces

- [PaginatedRequest](../interfaces/takaro_http.PaginatedRequest.md)

## Functions

### apiResponse

▸ **apiResponse**(`data?`, `opts?`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `unknown` |
| `opts?` | `IApiResponseOptions` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `data` | `unknown` |
| `meta` | { `error`: `undefined` \| { `code`: `undefined` \| `string` = opts.error.name; `details`: `any`  } ; `serverTime`: `string`  } |
| `meta.error` | `undefined` \| { `code`: `undefined` \| `string` = opts.error.name; `details`: `any`  } |
| `meta.serverTime` | `string` |

#### Defined in

[packages/lib-http/src/util/apiResponse.ts:11](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/util/apiResponse.ts#L11)

___

### createAdminAuthMiddleware

▸ **createAdminAuthMiddleware**(`adminSecret`): (`request`: `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\>, `response`: `Response`<`any`, `Record`<`string`, `any`\>\>, `next`: `NextFunction`) => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `adminSecret` | `string` |

#### Returns

`fn`

▸ (`request`, `response`, `next`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `request` | `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\> |
| `response` | `Response`<`any`, `Record`<`string`, `any`\>\> |
| `next` | `NextFunction` |

##### Returns

`void`

#### Defined in

[packages/lib-http/src/middleware/adminAuth.ts:7](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/middleware/adminAuth.ts#L7)
