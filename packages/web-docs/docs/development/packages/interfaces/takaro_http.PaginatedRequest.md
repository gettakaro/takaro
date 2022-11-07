---
id: "takaro_http.PaginatedRequest"
title: "Interface: PaginatedRequest"
sidebar_label: "@takaro/http.PaginatedRequest"
custom_edit_url: null
---

[@takaro/http](../modules/takaro_http.md).PaginatedRequest

## Hierarchy

- `Request`

  ↳ **`PaginatedRequest`**

## Properties

### aborted

• **aborted**: `boolean`

The `message.aborted` property will be `true` if the request has
been aborted.

**`Since`**

v10.1.0

#### Inherited from

Request.aborted

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:864

___

### accepted

• **accepted**: `MediaType`[]

Return an array of Accepted media types
ordered from highest quality to lowest.

#### Inherited from

Request.accepted

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:497

___

### app

• **app**: `Application`<`Record`<`string`, `any`\>\>

#### Inherited from

Request.app

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:640

___

### baseUrl

• **baseUrl**: `string`

#### Inherited from

Request.baseUrl

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:638

___

### body

• **body**: `any`

#### Inherited from

Request.body

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:619

___

### complete

• **complete**: `boolean`

The `message.complete` property will be `true` if a complete HTTP message has
been received and successfully parsed.

This property is particularly useful as a means of determining if a client or
server fully transmitted a message before a connection was terminated:

```js
const req = http.request({
  host: '127.0.0.1',
  port: 8080,
  method: 'POST'
}, (res) => {
  res.resume();
  res.on('end', () => {
    if (!res.complete)
      console.error(
        'The connection was terminated while the message was still being sent');
  });
});
```

**`Since`**

v0.3.0

#### Inherited from

Request.complete

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:899

___

### connection

• **connection**: `Socket`

Alias for `message.socket`.

**`Since`**

v0.1.90

**`Deprecated`**

Since v16.0.0 - Use `socket`.

#### Inherited from

Request.connection

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:905

___

### cookies

• **cookies**: `any`

#### Inherited from

Request.cookies

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:622

___

### destroyed

• **destroyed**: `boolean`

Is `true` after `readable.destroy()` has been called.

**`Since`**

v8.0.0

#### Inherited from

Request.destroyed

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:116

___

### file

• `Optional` **file**: `File`

`Multer.File` object populated by `single()` middleware.

#### Inherited from

Request.file

#### Defined in

node_modules/@types/multer/index.d.ts:52

___

### files

• `Optional` **files**: { `[fieldname: string]`: `Multer.File`[];  } \| `File`[]

Array or dictionary of `Multer.File` object populated by `array()`,
`fields()`, and `any()` middleware.

#### Inherited from

Request.files

#### Defined in

node_modules/@types/multer/index.d.ts:57

___

### fresh

• **fresh**: `boolean`

Check if the request is fresh, aka
Last-Modified and/or the ETag
still match.

#### Inherited from

Request.fresh

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:604

___

### headers

• **headers**: `IncomingHttpHeaders`

The request/response headers object.

Key-value pairs of header names and values. Header names are lower-cased.

```js
// Prints something like:
//
// { 'user-agent': 'curl/7.22.0',
//   host: '127.0.0.1:8000',
//   accept: '*' }
console.log(request.headers);
```

Duplicates in raw headers are handled in the following ways, depending on the
header name:

* Duplicates of `age`, `authorization`, `content-length`, `content-type`,`etag`, `expires`, `from`, `host`, `if-modified-since`, `if-unmodified-since`,`last-modified`, `location`,
`max-forwards`, `proxy-authorization`, `referer`,`retry-after`, `server`, or `user-agent` are discarded.
* `set-cookie` is always an array. Duplicates are added to the array.
* For duplicate `cookie` headers, the values are joined together with '; '.
* For all other headers, the values are joined together with ', '.

**`Since`**

v0.1.5

#### Inherited from

Request.headers

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:942

___

### host

• **host**: `string`

**`Deprecated`**

Use hostname instead.

#### Inherited from

Request.host

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:597

___

### hostname

• **hostname**: `string`

Parse the "Host" header field hostname.

#### Inherited from

Request.hostname

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:592

___

### httpVersion

• **httpVersion**: `string`

In case of server request, the HTTP version sent by the client. In the case of
client response, the HTTP version of the connected-to server.
Probably either `'1.1'` or `'1.0'`.

Also `message.httpVersionMajor` is the first integer and`message.httpVersionMinor` is the second.

**`Since`**

v0.1.1

#### Inherited from

Request.httpVersion

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:873

___

### httpVersionMajor

• **httpVersionMajor**: `number`

#### Inherited from

Request.httpVersionMajor

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:874

___

### httpVersionMinor

• **httpVersionMinor**: `number`

#### Inherited from

Request.httpVersionMinor

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:875

___

### ip

• **ip**: `string`

Return the remote address, or when
"trust proxy" is `true` return
the upstream addr.

#### Inherited from

Request.ip

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:559

___

### ips

• **ips**: `string`[]

When "trust proxy" is `true`, parse
the "X-Forwarded-For" ip address list.

For example if the value were "client, proxy1, proxy2"
you would receive the array `["client", "proxy1", "proxy2"]`
where "proxy2" is the furthest down-stream.

#### Inherited from

Request.ips

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:569

___

### limit

• **limit**: `number`

#### Defined in

[packages/lib-http/src/middleware/paginationMiddleware.ts:15](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/middleware/paginationMiddleware.ts#L15)

___

### method

• **method**: `string`

#### Inherited from

Request.method

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:624

___

### next

• `Optional` **next**: `NextFunction`

#### Inherited from

Request.next

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:647

___

### originalUrl

• **originalUrl**: `string`

#### Inherited from

Request.originalUrl

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:634

___

### page

• **page**: `number`

#### Defined in

[packages/lib-http/src/middleware/paginationMiddleware.ts:14](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-http/src/middleware/paginationMiddleware.ts#L14)

___

### params

• **params**: `ParamsDictionary`

#### Inherited from

Request.params

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:626

___

### path

• **path**: `string`

Short-hand for `url.parse(req.url).pathname`.

#### Inherited from

Request.path

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:587

___

### protocol

• **protocol**: `string`

Return the protocol string "http" or "https"
when requested with TLS. When the "trust proxy"
setting is enabled the "X-Forwarded-Proto" header
field will be trusted. If you're running behind
a reverse proxy that supplies https for you this
may be enabled.

#### Inherited from

Request.protocol

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:545

___

### query

• **query**: `ParsedQs`

#### Inherited from

Request.query

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:628

___

### rawHeaders

• **rawHeaders**: `string`[]

The raw request/response headers list exactly as they were received.

The keys and values are in the same list. It is _not_ a
list of tuples. So, the even-numbered offsets are key values, and the
odd-numbered offsets are the associated values.

Header names are not lowercased, and duplicates are not merged.

```js
// Prints something like:
//
// [ 'user-agent',
//   'this is invalid because there can be only one',
//   'User-Agent',
//   'curl/7.22.0',
//   'Host',
//   '127.0.0.1:8000',
//   'ACCEPT',
//   '*' ]
console.log(request.rawHeaders);
```

**`Since`**

v0.11.6

#### Inherited from

Request.rawHeaders

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:967

___

### rawTrailers

• **rawTrailers**: `string`[]

The raw request/response trailer keys and values exactly as they were
received. Only populated at the `'end'` event.

**`Since`**

v0.11.6

#### Inherited from

Request.rawTrailers

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:978

___

### readable

• **readable**: `boolean`

Is `true` if it is safe to call `readable.read()`, which means
the stream has not been destroyed or emitted `'error'` or `'end'`.

**`Since`**

v11.4.0

#### Inherited from

Request.readable

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:72

___

### readableAborted

• `Readonly` **readableAborted**: `boolean`

Returns whether the stream was destroyed or errored before emitting `'end'`.

**`Since`**

v16.8.0

#### Inherited from

Request.readableAborted

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:66

___

### readableDidRead

• `Readonly` **readableDidRead**: `boolean`

Returns whether `'data'` has been emitted.

**`Since`**

v16.7.0

#### Inherited from

Request.readableDidRead

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:78

___

### readableEncoding

• `Readonly` **readableEncoding**: ``null`` \| `BufferEncoding`

Getter for the property `encoding` of a given `Readable` stream. The `encoding`property can be set using the `readable.setEncoding()` method.

**`Since`**

v12.7.0

#### Inherited from

Request.readableEncoding

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:83

___

### readableEnded

• `Readonly` **readableEnded**: `boolean`

Becomes `true` when `'end'` event is emitted.

**`Since`**

v12.9.0

#### Inherited from

Request.readableEnded

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:88

___

### readableFlowing

• `Readonly` **readableFlowing**: ``null`` \| `boolean`

This property reflects the current state of a `Readable` stream as described
in the `Three states` section.

**`Since`**

v9.4.0

#### Inherited from

Request.readableFlowing

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:94

___

### readableHighWaterMark

• `Readonly` **readableHighWaterMark**: `number`

Returns the value of `highWaterMark` passed when creating this `Readable`.

**`Since`**

v9.3.0

#### Inherited from

Request.readableHighWaterMark

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:99

___

### readableLength

• `Readonly` **readableLength**: `number`

This property contains the number of bytes (or objects) in the queue
ready to be read. The value provides introspection data regarding
the status of the `highWaterMark`.

**`Since`**

v9.4.0

#### Inherited from

Request.readableLength

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:106

___

### readableObjectMode

• `Readonly` **readableObjectMode**: `boolean`

Getter for the property `objectMode` of a given `Readable` stream.

**`Since`**

v12.3.0

#### Inherited from

Request.readableObjectMode

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:111

___

### res

• `Optional` **res**: `Response`<`any`, `Record`<`string`, `any`\>, `number`\>

After middleware.init executed, Request will contain res and next properties
See: express/lib/middleware/init.js

#### Inherited from

Request.res

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:646

___

### route

• **route**: `any`

#### Inherited from

Request.route

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:630

___

### secret

• `Optional` **secret**: `string`

This request's secret.
Optionally set by cookie-parser if secret(s) are provided.  Can be used by other middleware.
[Declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) can be used to add your own properties.

#### Inherited from

Request.secret

#### Defined in

node_modules/@types/cookie-parser/index.d.ts:19

___

### secure

• **secure**: `boolean`

Short-hand for:

   req.protocol == 'https'

#### Inherited from

Request.secure

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:552

___

### signedCookies

• **signedCookies**: `any`

#### Inherited from

Request.signedCookies

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:632

___

### socket

• **socket**: `Socket`

The `net.Socket` object associated with the connection.

With HTTPS support, use `request.socket.getPeerCertificate()` to obtain the
client's authentication details.

This property is guaranteed to be an instance of the `net.Socket` class,
a subclass of `stream.Duplex`, unless the user specified a socket
type other than `net.Socket`.

**`Since`**

v0.3.0

#### Inherited from

Request.socket

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:917

___

### stale

• **stale**: `boolean`

Check if the request is stale, aka
"Last-Modified" and / or the "ETag" for the
resource has changed.

#### Inherited from

Request.stale

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:611

___

### statusCode

• `Optional` **statusCode**: `number`

**Only valid for response obtained from ClientRequest.**

The 3-digit HTTP response status code. E.G. `404`.

**`Since`**

v0.1.1

#### Inherited from

Request.statusCode

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:1037

___

### statusMessage

• `Optional` **statusMessage**: `string`

**Only valid for response obtained from ClientRequest.**

The HTTP response status message (reason phrase). E.G. `OK` or `Internal Server Error`.

**`Since`**

v0.11.10

#### Inherited from

Request.statusMessage

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:1044

___

### subdomains

• **subdomains**: `string`[]

Return subdomains as an array.

Subdomains are the dot-separated parts of the host before the main domain of
the app. By default, the domain of the app is assumed to be the last two
parts of the host. This can be changed by setting "subdomain offset".

For example, if the domain is "tobi.ferrets.example.com":
If "subdomain offset" is not set, req.subdomains is `["ferrets", "tobi"]`.
If "subdomain offset" is 3, req.subdomains is `["tobi"]`.

#### Inherited from

Request.subdomains

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:582

___

### trailers

• **trailers**: `Dict`<`string`\>

The request/response trailers object. Only populated at the `'end'` event.

**`Since`**

v0.3.0

#### Inherited from

Request.trailers

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:972

___

### url

• **url**: `string`

#### Inherited from

Request.url

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:636

___

### xhr

• **xhr**: `boolean`

Check if the request was an _XMLHttpRequest_.

#### Inherited from

Request.xhr

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:616

## Methods

### [asyncIterator]

▸ **[asyncIterator]**(): `AsyncIterableIterator`<`any`\>

#### Returns

`AsyncIterableIterator`<`any`\>

#### Inherited from

Request.\_\_@asyncIterator@108263

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:480

___

### \_construct

▸ `Optional` **_construct**(`callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | (`error?`: ``null`` \| `Error`) => `void` |

#### Returns

`void`

#### Inherited from

Request.\_construct

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:118

___

### \_destroy

▸ **_destroy**(`error`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | ``null`` \| `Error` |
| `callback` | (`error?`: ``null`` \| `Error`) => `void` |

#### Returns

`void`

#### Inherited from

Request.\_destroy

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:400

___

### \_read

▸ **_read**(`size`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `size` | `number` |

#### Returns

`void`

#### Inherited from

Request.\_read

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:119

___

### accepts

▸ **accepts**(): `string`[]

Check if the given `type(s)` is acceptable, returning
the best match when true, otherwise `undefined`, in which
case you should respond with 406 "Not Acceptable".

The `type` value may be a single mime type string
such as "application/json", the extension name
such as "json", a comma-delimted list such as "json, html, text/plain",
or an array `["json", "html", "text/plain"]`. When a list
or array is given the _best_ match, if any is returned.

Examples:

    // Accept: text/html
    req.accepts('html');
    // => "html"

    // Accept: text/*, application/json
    req.accepts('html');
    // => "html"
    req.accepts('text/html');
    // => "text/html"
    req.accepts('json, text');
    // => "json"
    req.accepts('application/json');
    // => "application/json"

    // Accept: text/*, application/json
    req.accepts('image/png');
    req.accepts('png');
    // => undefined

    // Accept: text/*;q=.5, application/json
    req.accepts(['html', 'json']);
    req.accepts('html, json');
    // => "json"

#### Returns

`string`[]

#### Inherited from

Request.accepts

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:437

▸ **accepts**(`type`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `string` |

#### Returns

`string` \| ``false``

#### Inherited from

Request.accepts

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:438

▸ **accepts**(`type`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `string`[] |

#### Returns

`string` \| ``false``

#### Inherited from

Request.accepts

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:439

▸ **accepts**(...`type`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `...type` | `string`[] |

#### Returns

`string` \| ``false``

#### Inherited from

Request.accepts

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:440

___

### acceptsCharsets

▸ **acceptsCharsets**(): `string`[]

Returns the first accepted charset of the specified character sets,
based on the request's Accept-Charset HTTP header field.
If none of the specified charsets is accepted, returns false.

For more information, or if you have issues or concerns, see accepts.

#### Returns

`string`[]

#### Inherited from

Request.acceptsCharsets

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:449

▸ **acceptsCharsets**(`charset`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `charset` | `string` |

#### Returns

`string` \| ``false``

#### Inherited from

Request.acceptsCharsets

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:450

▸ **acceptsCharsets**(`charset`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `charset` | `string`[] |

#### Returns

`string` \| ``false``

#### Inherited from

Request.acceptsCharsets

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:451

▸ **acceptsCharsets**(...`charset`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `...charset` | `string`[] |

#### Returns

`string` \| ``false``

#### Inherited from

Request.acceptsCharsets

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:452

___

### acceptsEncodings

▸ **acceptsEncodings**(): `string`[]

Returns the first accepted encoding of the specified encodings,
based on the request's Accept-Encoding HTTP header field.
If none of the specified encodings is accepted, returns false.

For more information, or if you have issues or concerns, see accepts.

#### Returns

`string`[]

#### Inherited from

Request.acceptsEncodings

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:461

▸ **acceptsEncodings**(`encoding`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `encoding` | `string` |

#### Returns

`string` \| ``false``

#### Inherited from

Request.acceptsEncodings

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:462

▸ **acceptsEncodings**(`encoding`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `encoding` | `string`[] |

#### Returns

`string` \| ``false``

#### Inherited from

Request.acceptsEncodings

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:463

▸ **acceptsEncodings**(...`encoding`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `...encoding` | `string`[] |

#### Returns

`string` \| ``false``

#### Inherited from

Request.acceptsEncodings

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:464

___

### acceptsLanguages

▸ **acceptsLanguages**(): `string`[]

Returns the first accepted language of the specified languages,
based on the request's Accept-Language HTTP header field.
If none of the specified languages is accepted, returns false.

For more information, or if you have issues or concerns, see accepts.

#### Returns

`string`[]

#### Inherited from

Request.acceptsLanguages

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:473

▸ **acceptsLanguages**(`lang`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `lang` | `string` |

#### Returns

`string` \| ``false``

#### Inherited from

Request.acceptsLanguages

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:474

▸ **acceptsLanguages**(`lang`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `lang` | `string`[] |

#### Returns

`string` \| ``false``

#### Inherited from

Request.acceptsLanguages

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:475

▸ **acceptsLanguages**(...`lang`): `string` \| ``false``

#### Parameters

| Name | Type |
| :------ | :------ |
| `...lang` | `string`[] |

#### Returns

`string` \| ``false``

#### Inherited from

Request.acceptsLanguages

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:476

___

### addListener

▸ **addListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

Event emitter
The defined events on documents including:
1. close
2. data
3. end
4. error
5. pause
6. readable
7. resume

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"close"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.addListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:424

▸ **addListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"data"`` |
| `listener` | (`chunk`: `any`) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.addListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:425

▸ **addListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"end"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.addListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:426

▸ **addListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"error"`` |
| `listener` | (`err`: `Error`) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.addListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:427

▸ **addListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"pause"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.addListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:428

▸ **addListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"readable"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.addListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:429

▸ **addListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"resume"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.addListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:430

▸ **addListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.addListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:431

___

### destroy

▸ **destroy**(`error?`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

Calls `destroy()` on the socket that received the `IncomingMessage`. If `error`is provided, an `'error'` event is emitted on the socket and `error` is passed
as an argument to any listeners on the event.

**`Since`**

v0.3.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `error?` | `Error` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.destroy

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:1050

___

### emit

▸ **emit**(`event`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"close"`` |

#### Returns

`boolean`

#### Inherited from

Request.emit

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:432

▸ **emit**(`event`, `chunk`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"data"`` |
| `chunk` | `any` |

#### Returns

`boolean`

#### Inherited from

Request.emit

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:433

▸ **emit**(`event`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"end"`` |

#### Returns

`boolean`

#### Inherited from

Request.emit

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:434

▸ **emit**(`event`, `err`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"error"`` |
| `err` | `Error` |

#### Returns

`boolean`

#### Inherited from

Request.emit

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:435

▸ **emit**(`event`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"pause"`` |

#### Returns

`boolean`

#### Inherited from

Request.emit

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:436

▸ **emit**(`event`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"readable"`` |

#### Returns

`boolean`

#### Inherited from

Request.emit

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:437

▸ **emit**(`event`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"resume"`` |

#### Returns

`boolean`

#### Inherited from

Request.emit

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:438

▸ **emit**(`event`, ...`args`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `string` \| `symbol` |
| `...args` | `any`[] |

#### Returns

`boolean`

#### Inherited from

Request.emit

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:439

___

### eventNames

▸ **eventNames**(): (`string` \| `symbol`)[]

Returns an array listing the events for which the emitter has registered
listeners. The values in the array are strings or `Symbol`s.

```js
const EventEmitter = require('events');
const myEE = new EventEmitter();
myEE.on('foo', () => {});
myEE.on('bar', () => {});

const sym = Symbol('symbol');
myEE.on(sym, () => {});

console.log(myEE.eventNames());
// Prints: [ 'foo', 'bar', Symbol(symbol) ]
```

**`Since`**

v6.0.0

#### Returns

(`string` \| `symbol`)[]

#### Inherited from

Request.eventNames

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:632

___

### get

▸ **get**(`name`): `undefined` \| `string`[]

Return request header.

The `Referrer` header field is special-cased,
both `Referrer` and `Referer` are interchangeable.

Examples:

    req.get('Content-Type');
    // => "text/plain"

    req.get('content-type');
    // => "text/plain"

    req.get('Something');
    // => undefined

Aliased as `req.header()`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"set-cookie"`` |

#### Returns

`undefined` \| `string`[]

#### Inherited from

Request.get

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:394

▸ **get**(`name`): `undefined` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

`undefined` \| `string`

#### Inherited from

Request.get

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:395

___

### getMaxListeners

▸ **getMaxListeners**(): `number`

Returns the current max listener value for the `EventEmitter` which is either
set by `emitter.setMaxListeners(n)` or defaults to defaultMaxListeners.

**`Since`**

v1.0.0

#### Returns

`number`

#### Inherited from

Request.getMaxListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:489

___

### header

▸ **header**(`name`): `undefined` \| `string`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"set-cookie"`` |

#### Returns

`undefined` \| `string`[]

#### Inherited from

Request.header

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:397

▸ **header**(`name`): `undefined` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

`undefined` \| `string`

#### Inherited from

Request.header

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:398

___

### is

▸ **is**(`type`): ``null`` \| `string` \| ``false``

Check if the incoming request contains the "Content-Type"
header field, and it contains the give mime `type`.

Examples:

     // With Content-Type: text/html; charset=utf-8
     req.is('html');
     req.is('text/html');
     req.is('text/*');
     // => true

     // When Content-Type is application/json
     req.is('json');
     req.is('application/json');
     req.is('application/*');
     // => true

     req.is('html');
     // => false

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `string` \| `string`[] |

#### Returns

``null`` \| `string` \| ``false``

#### Inherited from

Request.is

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:535

___

### isPaused

▸ **isPaused**(): `boolean`

The `readable.isPaused()` method returns the current operating state of the`Readable`. This is used primarily by the mechanism that underlies the`readable.pipe()` method. In most
typical cases, there will be no reason to
use this method directly.

```js
const readable = new stream.Readable();

readable.isPaused(); // === false
readable.pause();
readable.isPaused(); // === true
readable.resume();
readable.isPaused(); // === false
```

**`Since`**

v0.11.14

#### Returns

`boolean`

#### Inherited from

Request.isPaused

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:279

___

### listenerCount

▸ **listenerCount**(`eventName`): `number`

Returns the number of listeners listening to the event named `eventName`.

**`Since`**

v3.2.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event being listened for |

#### Returns

`number`

#### Inherited from

Request.listenerCount

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:579

___

### listeners

▸ **listeners**(`eventName`): `Function`[]

Returns a copy of the array of listeners for the event named `eventName`.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
console.log(util.inspect(server.listeners('connection')));
// Prints: [ [Function] ]
```

**`Since`**

v0.1.26

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |

#### Returns

`Function`[]

#### Inherited from

Request.listeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:502

___

### off

▸ **off**(`eventName`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

Alias for `emitter.removeListener()`.

**`Since`**

v10.0.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.off

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:462

___

### on

▸ **on**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"close"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.on

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:440

▸ **on**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"data"`` |
| `listener` | (`chunk`: `any`) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.on

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:441

▸ **on**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"end"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.on

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:442

▸ **on**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"error"`` |
| `listener` | (`err`: `Error`) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.on

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:443

▸ **on**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"pause"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.on

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:444

▸ **on**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"readable"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.on

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:445

▸ **on**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"resume"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.on

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:446

▸ **on**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.on

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:447

___

### once

▸ **once**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"close"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.once

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:448

▸ **once**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"data"`` |
| `listener` | (`chunk`: `any`) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.once

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:449

▸ **once**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"end"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.once

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:450

▸ **once**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"error"`` |
| `listener` | (`err`: `Error`) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.once

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:451

▸ **once**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"pause"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.once

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:452

▸ **once**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"readable"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.once

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:453

▸ **once**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"resume"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.once

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:454

▸ **once**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.once

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:455

___

### param

▸ **param**(`name`, `defaultValue?`): `string`

**`Deprecated`**

since 4.11 Use either req.params, req.body or req.query, as applicable.

Return the value of param `name` when present or `defaultValue`.

 - Checks route placeholders, ex: _/user/:id_
 - Checks body params, ex: id=12, {"id":12}
 - Checks query string params, ex: ?id=12

To utilize request bodies, `req.body`
should be an object. This can be done by using
the `connect.bodyParser()` middleware.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `defaultValue?` | `any` |

#### Returns

`string`

#### Inherited from

Request.param

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:512

___

### pause

▸ **pause**(): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

The `readable.pause()` method will cause a stream in flowing mode to stop
emitting `'data'` events, switching out of flowing mode. Any data that
becomes available will remain in the internal buffer.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
  readable.pause();
  console.log('There will be no additional data for 1 second.');
  setTimeout(() => {
    console.log('Now data will start flowing again.');
    readable.resume();
  }, 1000);
});
```

The `readable.pause()` method has no effect if there is a `'readable'`event listener.

**`Since`**

v0.9.4

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.pause

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:243

___

### pipe

▸ **pipe**<`T`\>(`destination`, `options?`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `WritableStream`<`T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `destination` | `T` |
| `options?` | `Object` |
| `options.end?` | `boolean` |

#### Returns

`T`

#### Inherited from

Request.pipe

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:25

___

### prependListener

▸ **prependListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"close"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:456

▸ **prependListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"data"`` |
| `listener` | (`chunk`: `any`) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:457

▸ **prependListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"end"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:458

▸ **prependListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"error"`` |
| `listener` | (`err`: `Error`) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:459

▸ **prependListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"pause"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:460

▸ **prependListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"readable"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:461

▸ **prependListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"resume"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:462

▸ **prependListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:463

___

### prependOnceListener

▸ **prependOnceListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"close"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependOnceListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:464

▸ **prependOnceListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"data"`` |
| `listener` | (`chunk`: `any`) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependOnceListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:465

▸ **prependOnceListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"end"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependOnceListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:466

▸ **prependOnceListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"error"`` |
| `listener` | (`err`: `Error`) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependOnceListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:467

▸ **prependOnceListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"pause"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependOnceListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:468

▸ **prependOnceListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"readable"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependOnceListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:469

▸ **prependOnceListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"resume"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependOnceListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:470

▸ **prependOnceListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.prependOnceListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:471

___

### push

▸ **push**(`chunk`, `encoding?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `chunk` | `any` |
| `encoding?` | `BufferEncoding` |

#### Returns

`boolean`

#### Inherited from

Request.push

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:399

___

### range

▸ **range**(`size`, `options?`): `undefined` \| `Ranges` \| `Result`

Parse Range header field, capping to the given `size`.

Unspecified ranges such as "0-" require knowledge of your resource length. In
the case of a byte range this is of course the total number of bytes.
If the Range header field is not given `undefined` is returned.
If the Range header field is given, return value is a result of range-parser.
See more ./types/range-parser/index.d.ts

NOTE: remember that ranges are inclusive, so for example "Range: users=0-3"
should respond with 4 users when available, not 3.

#### Parameters

| Name | Type |
| :------ | :------ |
| `size` | `number` |
| `options?` | `Options` |

#### Returns

`undefined` \| `Ranges` \| `Result`

#### Inherited from

Request.range

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:491

___

### rawListeners

▸ **rawListeners**(`eventName`): `Function`[]

Returns a copy of the array of listeners for the event named `eventName`,
including any wrappers (such as those created by `.once()`).

```js
const emitter = new EventEmitter();
emitter.once('log', () => console.log('log once'));

// Returns a new Array with a function `onceWrapper` which has a property
// `listener` which contains the original listener bound above
const listeners = emitter.rawListeners('log');
const logFnWrapper = listeners[0];

// Logs "log once" to the console and does not unbind the `once` event
logFnWrapper.listener();

// Logs "log once" to the console and removes the listener
logFnWrapper();

emitter.on('log', () => console.log('log persistently'));
// Will return a new Array with a single function bound by `.on()` above
const newListeners = emitter.rawListeners('log');

// Logs "log persistently" twice
newListeners[0]();
emitter.emit('log');
```

**`Since`**

v9.4.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |

#### Returns

`Function`[]

#### Inherited from

Request.rawListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:532

___

### read

▸ **read**(`size?`): `any`

The `readable.read()` method pulls some data out of the internal buffer and
returns it. If no data available to be read, `null` is returned. By default,
the data will be returned as a `Buffer` object unless an encoding has been
specified using the `readable.setEncoding()` method or the stream is operating
in object mode.

The optional `size` argument specifies a specific number of bytes to read. If`size` bytes are not available to be read, `null` will be returned _unless_the stream has ended, in which
case all of the data remaining in the internal
buffer will be returned.

If the `size` argument is not specified, all of the data contained in the
internal buffer will be returned.

The `size` argument must be less than or equal to 1 GiB.

The `readable.read()` method should only be called on `Readable` streams
operating in paused mode. In flowing mode, `readable.read()` is called
automatically until the internal buffer is fully drained.

```js
const readable = getReadableStreamSomehow();

// 'readable' may be triggered multiple times as data is buffered in
readable.on('readable', () => {
  let chunk;
  console.log('Stream is readable (new data received in buffer)');
  // Use a loop to make sure we read all currently available data
  while (null !== (chunk = readable.read())) {
    console.log(`Read ${chunk.length} bytes of data...`);
  }
});

// 'end' will be triggered once when there is no more data available
readable.on('end', () => {
  console.log('Reached end of stream.');
});
```

Each call to `readable.read()` returns a chunk of data, or `null`. The chunks
are not concatenated. A `while` loop is necessary to consume all data
currently in the buffer. When reading a large file `.read()` may return `null`,
having consumed all buffered content so far, but there is still more data to
come not yet buffered. In this case a new `'readable'` event will be emitted
when there is more data in the buffer. Finally the `'end'` event will be
emitted when there is no more data to come.

Therefore to read a file's whole contents from a `readable`, it is necessary
to collect chunks across multiple `'readable'` events:

```js
const chunks = [];

readable.on('readable', () => {
  let chunk;
  while (null !== (chunk = readable.read())) {
    chunks.push(chunk);
  }
});

readable.on('end', () => {
  const content = chunks.join('');
});
```

A `Readable` stream in object mode will always return a single item from
a call to `readable.read(size)`, regardless of the value of the`size` argument.

If the `readable.read()` method returns a chunk of data, a `'data'` event will
also be emitted.

Calling [read](takaro_http.PaginatedRequest.md#read) after the `'end'` event has
been emitted will return `null`. No runtime error will be raised.

**`Since`**

v0.9.4

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `size?` | `number` | Optional argument to specify how much data to read. |

#### Returns

`any`

#### Inherited from

Request.read

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:196

___

### removeAllListeners

▸ **removeAllListeners**(`event?`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

Removes all listeners, or those of the specified `eventName`.

It is bad practice to remove listeners added elsewhere in the code,
particularly when the `EventEmitter` instance was created by some other
component or module (e.g. sockets or file streams).

Returns a reference to the `EventEmitter`, so that calls can be chained.

**`Since`**

v0.1.26

#### Parameters

| Name | Type |
| :------ | :------ |
| `event?` | `string` \| `symbol` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.removeAllListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:473

___

### removeListener

▸ **removeListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"close"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.removeListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:472

▸ **removeListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"data"`` |
| `listener` | (`chunk`: `any`) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.removeListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:473

▸ **removeListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"end"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.removeListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:474

▸ **removeListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"error"`` |
| `listener` | (`err`: `Error`) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.removeListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:475

▸ **removeListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"pause"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.removeListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:476

▸ **removeListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"readable"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.removeListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:477

▸ **removeListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"resume"`` |
| `listener` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.removeListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:478

▸ **removeListener**(`event`, `listener`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.removeListener

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:479

___

### resume

▸ **resume**(): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

The `readable.resume()` method causes an explicitly paused `Readable` stream to
resume emitting `'data'` events, switching the stream into flowing mode.

The `readable.resume()` method can be used to fully consume the data from a
stream without actually processing any of that data:

```js
getReadableStreamSomehow()
  .resume()
  .on('end', () => {
    console.log('Reached the end, but did not read anything.');
  });
```

The `readable.resume()` method has no effect if there is a `'readable'`event listener.

**`Since`**

v0.9.4

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.resume

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:262

___

### setEncoding

▸ **setEncoding**(`encoding`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

The `readable.setEncoding()` method sets the character encoding for
data read from the `Readable` stream.

By default, no encoding is assigned and stream data will be returned as`Buffer` objects. Setting an encoding causes the stream data
to be returned as strings of the specified encoding rather than as `Buffer`objects. For instance, calling `readable.setEncoding('utf8')` will cause the
output data to be interpreted as UTF-8 data, and passed as strings. Calling`readable.setEncoding('hex')` will cause the data to be encoded in hexadecimal
string format.

The `Readable` stream will properly handle multi-byte characters delivered
through the stream that would otherwise become improperly decoded if simply
pulled from the stream as `Buffer` objects.

```js
const readable = getReadableStreamSomehow();
readable.setEncoding('utf8');
readable.on('data', (chunk) => {
  assert.equal(typeof chunk, 'string');
  console.log('Got %d characters of string data:', chunk.length);
});
```

**`Since`**

v0.9.4

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `encoding` | `BufferEncoding` | The encoding to use. |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.setEncoding

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:221

___

### setMaxListeners

▸ **setMaxListeners**(`n`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

By default `EventEmitter`s will print a warning if more than `10` listeners are
added for a particular event. This is a useful default that helps finding
memory leaks. The `emitter.setMaxListeners()` method allows the limit to be
modified for this specific `EventEmitter` instance. The value can be set to`Infinity` (or `0`) to indicate an unlimited number of listeners.

Returns a reference to the `EventEmitter`, so that calls can be chained.

**`Since`**

v0.3.5

#### Parameters

| Name | Type |
| :------ | :------ |
| `n` | `number` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.setMaxListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:483

___

### setTimeout

▸ **setTimeout**(`msecs`, `callback?`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

Calls `message.socket.setTimeout(msecs, callback)`.

**`Since`**

v0.5.9

#### Parameters

| Name | Type |
| :------ | :------ |
| `msecs` | `number` |
| `callback?` | () => `void` |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.setTimeout

#### Defined in

node_modules/@types/node/ts4.8/http.d.ts:983

___

### unpipe

▸ **unpipe**(`destination?`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

The `readable.unpipe()` method detaches a `Writable` stream previously attached
using the [pipe](takaro_http.PaginatedRequest.md#pipe) method.

If the `destination` is not specified, then _all_ pipes are detached.

If the `destination` is specified, but no pipe is set up for it, then
the method does nothing.

```js
const fs = require('fs');
const readable = getReadableStreamSomehow();
const writable = fs.createWriteStream('file.txt');
// All the data from readable goes into 'file.txt',
// but only for the first second.
readable.pipe(writable);
setTimeout(() => {
  console.log('Stop writing to file.txt.');
  readable.unpipe(writable);
  console.log('Manually close the file stream.');
  writable.end();
}, 1000);
```

**`Since`**

v0.9.4

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `destination?` | `WritableStream` | Optional specific stream to unpipe |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.unpipe

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:306

___

### unshift

▸ **unshift**(`chunk`, `encoding?`): `void`

Passing `chunk` as `null` signals the end of the stream (EOF) and behaves the
same as `readable.push(null)`, after which no more data can be written. The EOF
signal is put at the end of the buffer and any buffered data will still be
flushed.

The `readable.unshift()` method pushes a chunk of data back into the internal
buffer. This is useful in certain situations where a stream is being consumed by
code that needs to "un-consume" some amount of data that it has optimistically
pulled out of the source, so that the data can be passed on to some other party.

The `stream.unshift(chunk)` method cannot be called after the `'end'` event
has been emitted or a runtime error will be thrown.

Developers using `stream.unshift()` often should consider switching to
use of a `Transform` stream instead. See the `API for stream implementers` section for more information.

```js
// Pull off a header delimited by \n\n.
// Use unshift() if we get too much.
// Call the callback with (error, header, stream).
const { StringDecoder } = require('string_decoder');
function parseHeader(stream, callback) {
  stream.on('error', callback);
  stream.on('readable', onReadable);
  const decoder = new StringDecoder('utf8');
  let header = '';
  function onReadable() {
    let chunk;
    while (null !== (chunk = stream.read())) {
      const str = decoder.write(chunk);
      if (str.match(/\n\n/)) {
        // Found the header boundary.
        const split = str.split(/\n\n/);
        header += split.shift();
        const remaining = split.join('\n\n');
        const buf = Buffer.from(remaining, 'utf8');
        stream.removeListener('error', callback);
        // Remove the 'readable' listener before unshifting.
        stream.removeListener('readable', onReadable);
        if (buf.length)
          stream.unshift(buf);
        // Now the body of the message can be read from the stream.
        callback(null, header, stream);
      } else {
        // Still reading the header.
        header += str;
      }
    }
  }
}
```

Unlike [push](takaro_http.PaginatedRequest.md#push), `stream.unshift(chunk)` will not
end the reading process by resetting the internal reading state of the stream.
This can cause unexpected results if `readable.unshift()` is called during a
read (i.e. from within a [_read](takaro_http.PaginatedRequest.md#_read) implementation on a
custom stream). Following the call to `readable.unshift()` with an immediate [push](takaro_http.PaginatedRequest.md#push) will reset the reading state appropriately,
however it is best to simply avoid calling `readable.unshift()` while in the
process of performing a read.

**`Since`**

v0.9.11

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `chunk` | `any` | Chunk of data to unshift onto the read queue. For streams not operating in object mode, `chunk` must be a string, `Buffer`, `Uint8Array` or `null`. For object mode streams, `chunk` may be any JavaScript value. |
| `encoding?` | `BufferEncoding` | Encoding of string chunks. Must be a valid `Buffer` encoding, such as `'utf8'` or `'ascii'`. |

#### Returns

`void`

#### Inherited from

Request.unshift

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:372

___

### wrap

▸ **wrap**(`stream`): [`PaginatedRequest`](takaro_http.PaginatedRequest.md)

Prior to Node.js 0.10, streams did not implement the entire `stream` module API
as it is currently defined. (See `Compatibility` for more information.)

When using an older Node.js library that emits `'data'` events and has a [pause](takaro_http.PaginatedRequest.md#pause) method that is advisory only, the`readable.wrap()` method can be used to create a `Readable`
stream that uses
the old stream as its data source.

It will rarely be necessary to use `readable.wrap()` but the method has been
provided as a convenience for interacting with older Node.js applications and
libraries.

```js
const { OldReader } = require('./old-api-module.js');
const { Readable } = require('stream');
const oreader = new OldReader();
const myReader = new Readable().wrap(oreader);

myReader.on('readable', () => {
  myReader.read(); // etc.
});
```

**`Since`**

v0.9.4

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `stream` | `ReadableStream` | An "old style" readable stream |

#### Returns

[`PaginatedRequest`](takaro_http.PaginatedRequest.md)

#### Inherited from

Request.wrap

#### Defined in

node_modules/@types/node/ts4.8/stream.d.ts:398
