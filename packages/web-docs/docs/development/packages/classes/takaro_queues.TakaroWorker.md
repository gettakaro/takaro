---
id: "takaro_queues.TakaroWorker"
title: "Class: TakaroWorker<T>"
sidebar_label: "@takaro/queues.TakaroWorker"
custom_edit_url: null
---

[@takaro/queues](../modules/takaro_queues.md).TakaroWorker

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- `Worker`<`T`\>

  ↳ **`TakaroWorker`**

## Constructors

### constructor

• **new TakaroWorker**<`T`\>(`name`, `fn`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `fn` | `Processor`<`T`, `any`, `string`\> |

#### Overrides

Worker&lt;T\&gt;.constructor

#### Defined in

[packages/lib-queues/src/queues.ts:25](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L25)

## Properties

### closing

• **closing**: `Promise`<`void`\>

#### Inherited from

Worker.closing

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:21

___

### connection

• `Protected` **connection**: `RedisConnection`

#### Inherited from

Worker.connection

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:23

___

### keys

• **keys**: `KeysMap`

#### Inherited from

Worker.keys

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:20

___

### log

• **log**: `Logger`

#### Defined in

[packages/lib-queues/src/queues.ts:23](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L23)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

Worker.name

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:17

___

### opts

• `Readonly` **opts**: `WorkerOptions`

#### Inherited from

Worker.opts

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:82

___

### paused

• `Protected` **paused**: `Promise`<`void`\>

#### Inherited from

Worker.paused

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:89

___

### processFn

• `Protected` **processFn**: `Processor`<`T`, `any`, `string`\>

#### Inherited from

Worker.processFn

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:87

___

### scripts

• `Protected` **scripts**: `Scripts`

#### Inherited from

Worker.scripts

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:22

___

### timerManager

• `Protected` **timerManager**: `TimerManager`

#### Inherited from

Worker.timerManager

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:92

___

### toKey

• **toKey**: (`type`: `string`) => `string`

#### Type declaration

▸ (`type`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `string` |

##### Returns

`string`

#### Inherited from

Worker.toKey

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:19

___

### captureRejectionSymbol

▪ `Static` `Readonly` **captureRejectionSymbol**: typeof [`captureRejectionSymbol`](takaro_queues.TakaroQueue.md#capturerejectionsymbol)

#### Inherited from

Worker.captureRejectionSymbol

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:291

___

### captureRejections

▪ `Static` **captureRejections**: `boolean`

Sets or gets the default captureRejection value for all emitters.

#### Inherited from

Worker.captureRejections

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:296

___

### defaultMaxListeners

▪ `Static` **defaultMaxListeners**: `number`

#### Inherited from

Worker.defaultMaxListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:297

___

### errorMonitor

▪ `Static` `Readonly` **errorMonitor**: typeof [`errorMonitor`](takaro_queues.TakaroQueue.md#errormonitor)

This symbol shall be used to install a listener for only monitoring `'error'`
events. Listeners installed using this symbol are called before the regular
`'error'` listeners are called.

Installing a listener using this symbol does not change the behavior once an
`'error'` event is emitted, therefore the process will still crash if no
regular `'error'` listener is installed.

#### Inherited from

Worker.errorMonitor

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:290

## Accessors

### Job

• `Protected` `get` **Job**(): typeof `Job`

Helper to easily extend Job class calls.

#### Returns

typeof `Job`

#### Inherited from

Worker.Job

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:43

___

### client

• `get` **client**(): `Promise`<`RedisClient`\>

Returns a promise that resolves to a redis client. Normally used only by subclasses.

#### Returns

`Promise`<`RedisClient`\>

#### Inherited from

Worker.client

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:35

___

### concurrency

• `set` **concurrency**(`concurrency`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `concurrency` | `number` |

#### Returns

`void`

#### Inherited from

Worker.concurrency

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:109

___

### redisVersion

• `get` **redisVersion**(): `string`

Returns the version of the Redis instance the client is connected to,

#### Returns

`string`

#### Inherited from

Worker.redisVersion

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:39

___

### repeat

• `get` **repeat**(): `Promise`<`Repeat`\>

#### Returns

`Promise`<`Repeat`\>

#### Inherited from

Worker.repeat

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:110

## Methods

### addListener

▸ **addListener**(`eventName`, `listener`): [`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

Alias for `emitter.on(eventName, listener)`.

**`Since`**

v0.1.26

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

[`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

#### Inherited from

Worker.addListener

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:317

___

### base64Name

▸ `Protected` **base64Name**(): `string`

#### Returns

`string`

#### Inherited from

Worker.base64Name

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:53

___

### callProcessJob

▸ `Protected` **callProcessJob**(`job`, `token`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `job` | `Job`<`T`, `any`, `string`\> |
| `token` | `string` |

#### Returns

`Promise`<`any`\>

#### Inherited from

Worker.callProcessJob

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:100

___

### checkConnectionError

▸ `Protected` **checkConnectionError**<`T`\>(`fn`, `delayInMs?`): `Promise`<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `Promise`<`T`\> |
| `delayInMs?` | `number` |

#### Returns

`Promise`<`T`\>

#### Inherited from

Worker.checkConnectionError

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:65

___

### clientName

▸ `Protected` **clientName**(`suffix?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `suffix?` | `string` |

#### Returns

`string`

#### Inherited from

Worker.clientName

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:54

___

### close

▸ **close**(`force?`): `Promise`<`void`\>

Closes the worker and related redis connections.

This method waits for current jobs to finalize before returning.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `force?` | `boolean` | Use force boolean parameter if you do not want to wait for current jobs to be processed. |

#### Returns

`Promise`<`void`\>

Promise that resolves when the worker has been closed.

#### Inherited from

Worker.close

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:162

___

### createJob

▸ `Protected` **createJob**(`data`, `jobId`): `Job`<`T`, `any`, `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `JobJsonRaw` |
| `jobId` | `string` |

#### Returns

`Job`<`T`, `any`, `string`\>

#### Inherited from

Worker.createJob

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:101

___

### delay

▸ **delay**(): `Promise`<`void`\>

This function is exposed only for testing purposes.

#### Returns

`Promise`<`void`\>

#### Inherited from

Worker.delay

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:124

___

### disconnect

▸ **disconnect**(): `Promise`<`void`\>

Force disconnects a connection.

#### Returns

`Promise`<`void`\>

#### Inherited from

Worker.disconnect

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:64

___

### emit

▸ **emit**<`U`\>(`event`, ...`args`): `boolean`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends keyof `WorkerListener`<`DataType`, `ResultType`, `NameType`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `U` |
| `...args` | `Parameters`<`WorkerListener`<`T`, `any`, `string`\>[`U`]\> |

#### Returns

`boolean`

#### Inherited from

Worker.emit

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:96

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

Worker.eventNames

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:632

___

### getMaxListeners

▸ **getMaxListeners**(): `number`

Returns the current max listener value for the `EventEmitter` which is either
set by `emitter.setMaxListeners(n)` or defaults to [defaultMaxListeners](takaro_queues.TakaroWorker.md#defaultmaxlisteners).

**`Since`**

v1.0.0

#### Returns

`number`

#### Inherited from

Worker.getMaxListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:489

___

### getNextJob

▸ **getNextJob**(`token`, `__namedParameters?`): `Promise`<`Job`<`T`, `any`, `string`\>\>

Returns a promise that resolves to the next job in queue.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | `string` | worker token to be assigned to retrieved job |
| `__namedParameters?` | `GetNextJobOptions` | - |

#### Returns

`Promise`<`Job`<`T`, `any`, `string`\>\>

a Job or undefined if no job was available in the queue.

#### Inherited from

Worker.getNextJob

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:117

___

### isPaused

▸ **isPaused**(): `boolean`

Checks if worker is paused.

#### Returns

`boolean`

true if worker is paused, false otherwise.

#### Inherited from

Worker.isPaused

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:143

___

### isRunning

▸ **isRunning**(): `boolean`

Checks if worker is currently running.

#### Returns

`boolean`

true if worker is running, false otherwise.

#### Inherited from

Worker.isRunning

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:150

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

Worker.listenerCount

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

Worker.listeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:502

___

### moveToActive

▸ `Protected` **moveToActive**(`token`, `jobId?`): `Promise`<`Job`<`T`, `any`, `string`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | `string` |
| `jobId?` | `string` |

#### Returns

`Promise`<`Job`<`T`, `any`, `string`\>\>

#### Inherited from

Worker.moveToActive

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:118

___

### nextJobFromJobData

▸ `Protected` **nextJobFromJobData**(`jobData?`, `jobId?`): `Promise`<`Job`<`T`, `any`, `string`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `jobData?` | `number` \| `JobJsonRaw` |
| `jobId?` | `string` |

#### Returns

`Promise`<`Job`<`T`, `any`, `string`\>\>

#### Inherited from

Worker.nextJobFromJobData

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:125

___

### off

▸ **off**<`U`\>(`eventName`, `listener`): [`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends keyof `WorkerListener`<`DataType`, `ResultType`, `NameType`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `U` |
| `listener` | `WorkerListener`<`T`, `any`, `string`\>[`U`] |

#### Returns

[`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

#### Inherited from

Worker.off

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:97

___

### on

▸ **on**<`U`\>(`event`, `listener`): [`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends keyof `WorkerListener`<`DataType`, `ResultType`, `NameType`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `U` |
| `listener` | `WorkerListener`<`T`, `any`, `string`\>[`U`] |

#### Returns

[`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

#### Inherited from

Worker.on

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:98

___

### once

▸ **once**<`U`\>(`event`, `listener`): [`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends keyof `WorkerListener`<`DataType`, `ResultType`, `NameType`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `U` |
| `listener` | `WorkerListener`<`T`, `any`, `string`\>[`U`] |

#### Returns

[`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

#### Inherited from

Worker.once

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:99

___

### pause

▸ **pause**(`doNotWaitActive?`): `Promise`<`void`\>

Pauses the processing of this queue only for this worker.

#### Parameters

| Name | Type |
| :------ | :------ |
| `doNotWaitActive?` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Inherited from

Worker.pause

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:131

___

### prependListener

▸ **prependListener**(`eventName`, `listener`): [`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

Adds the `listener` function to the _beginning_ of the listeners array for the
event named `eventName`. No checks are made to see if the `listener` has
already been added. Multiple calls passing the same combination of `eventName`and `listener` will result in the `listener` being added, and called, multiple
times.

```js
server.prependListener('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

**`Since`**

v6.0.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event. |
| `listener` | (...`args`: `any`[]) => `void` | The callback function |

#### Returns

[`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

#### Inherited from

Worker.prependListener

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:597

___

### prependOnceListener

▸ **prependOnceListener**(`eventName`, `listener`): [`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

Adds a **one-time**`listener` function for the event named `eventName` to the_beginning_ of the listeners array. The next time `eventName` is triggered, this
listener is removed, and then invoked.

```js
server.prependOnceListener('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

**`Since`**

v6.0.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event. |
| `listener` | (...`args`: `any`[]) => `void` | The callback function |

#### Returns

[`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

#### Inherited from

Worker.prependOnceListener

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:613

___

### processJob

▸ **processJob**(`job`, `token`, `fetchNextCallback?`): `Promise`<`void` \| `Job`<`T`, `any`, `string`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `job` | `Job`<`T`, `any`, `string`\> |
| `token` | `string` |
| `fetchNextCallback?` | () => `boolean` |

#### Returns

`Promise`<`void` \| `Job`<`T`, `any`, `string`\>\>

#### Inherited from

Worker.processJob

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:126

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

Worker.rawListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:532

___

### removeAllListeners

▸ **removeAllListeners**(`event?`): [`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

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

[`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

#### Inherited from

Worker.removeAllListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:473

___

### removeListener

▸ **removeListener**(`eventName`, `listener`): [`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

Removes the specified `listener` from the listener array for the event named`eventName`.

```js
const callback = (stream) => {
  console.log('someone connected!');
};
server.on('connection', callback);
// ...
server.removeListener('connection', callback);
```

`removeListener()` will remove, at most, one instance of a listener from the
listener array. If any single listener has been added multiple times to the
listener array for the specified `eventName`, then `removeListener()` must be
called multiple times to remove each instance.

Once an event is emitted, all listeners attached to it at the
time of emitting are called in order. This implies that any`removeListener()` or `removeAllListeners()` calls _after_ emitting and_before_ the last listener finishes execution will
not remove them from`emit()` in progress. Subsequent events behave as expected.

```js
const myEmitter = new MyEmitter();

const callbackA = () => {
  console.log('A');
  myEmitter.removeListener('event', callbackB);
};

const callbackB = () => {
  console.log('B');
};

myEmitter.on('event', callbackA);

myEmitter.on('event', callbackB);

// callbackA removes listener callbackB but it will still be called.
// Internal listener array at time of emit [callbackA, callbackB]
myEmitter.emit('event');
// Prints:
//   A
//   B

// callbackB is now removed.
// Internal listener array [callbackA]
myEmitter.emit('event');
// Prints:
//   A
```

Because listeners are managed using an internal array, calling this will
change the position indices of any listener registered _after_ the listener
being removed. This will not impact the order in which listeners are called,
but it means that any copies of the listener array as returned by
the `emitter.listeners()` method will need to be recreated.

When a single function has been added as a handler multiple times for a single
event (as in the example below), `removeListener()` will remove the most
recently added instance. In the example the `once('ping')`listener is removed:

```js
const ee = new EventEmitter();

function pong() {
  console.log('pong');
}

ee.on('ping', pong);
ee.once('ping', pong);
ee.removeListener('ping', pong);

ee.emit('ping');
ee.emit('ping');
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

**`Since`**

v0.1.26

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

[`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

#### Inherited from

Worker.removeListener

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:457

___

### resume

▸ **resume**(): `void`

Resumes processing of this worker (if paused).

#### Returns

`void`

#### Inherited from

Worker.resume

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:136

___

### run

▸ **run**(): `Promise`<`any`[]\>

#### Returns

`Promise`<`any`[]\>

#### Inherited from

Worker.run

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:111

___

### setMaxListeners

▸ **setMaxListeners**(`n`): [`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

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

[`TakaroWorker`](takaro_queues.TakaroWorker.md)<`T`\>

#### Inherited from

Worker.setMaxListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:483

___

### waitUntilReady

▸ **waitUntilReady**(): `Promise`<`RedisClient`\>

Waits until the worker is ready to start processing jobs.
In general only useful when writing tests.

#### Returns

`Promise`<`RedisClient`\>

#### Inherited from

Worker.waitUntilReady

#### Defined in

node_modules/bullmq/dist/esm/classes/worker.d.ts:108

___

### getEventListeners

▸ `Static` **getEventListeners**(`emitter`, `name`): `Function`[]

Returns a copy of the array of listeners for the event named `eventName`.

For `EventEmitter`s this behaves exactly the same as calling `.listeners` on
the emitter.

For `EventTarget`s this is the only way to get the event listeners for the
event target. This is useful for debugging and diagnostic purposes.

```js
const { getEventListeners, EventEmitter } = require('events');

{
  const ee = new EventEmitter();
  const listener = () => console.log('Events are fun');
  ee.on('foo', listener);
  getEventListeners(ee, 'foo'); // [listener]
}
{
  const et = new EventTarget();
  const listener = () => console.log('Events are fun');
  et.addEventListener('foo', listener);
  getEventListeners(et, 'foo'); // [listener]
}
```

**`Since`**

v15.2.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `emitter` | `EventEmitter` \| `DOMEventTarget` |
| `name` | `string` \| `symbol` |

#### Returns

`Function`[]

#### Inherited from

Worker.getEventListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:262

___

### listenerCount

▸ `Static` **listenerCount**(`emitter`, `eventName`): `number`

A class method that returns the number of listeners for the given `eventName`registered on the given `emitter`.

```js
const { EventEmitter, listenerCount } = require('events');
const myEmitter = new EventEmitter();
myEmitter.on('event', () => {});
myEmitter.on('event', () => {});
console.log(listenerCount(myEmitter, 'event'));
// Prints: 2
```

**`Since`**

v0.9.12

**`Deprecated`**

Since v3.2.0 - Use `listenerCount` instead.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `emitter` | `EventEmitter` | The emitter to query |
| `eventName` | `string` \| `symbol` | The event name |

#### Returns

`number`

#### Inherited from

Worker.listenerCount

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:234

___

### on

▸ `Static` **on**(`emitter`, `eventName`, `options?`): `AsyncIterableIterator`<`any`\>

```js
const { on, EventEmitter } = require('events');

(async () => {
  const ee = new EventEmitter();

  // Emit later on
  process.nextTick(() => {
    ee.emit('foo', 'bar');
    ee.emit('foo', 42);
  });

  for await (const event of on(ee, 'foo')) {
    // The execution of this inner block is synchronous and it
    // processes one event at a time (even with await). Do not use
    // if concurrent execution is required.
    console.log(event); // prints ['bar'] [42]
  }
  // Unreachable here
})();
```

Returns an `AsyncIterator` that iterates `eventName` events. It will throw
if the `EventEmitter` emits `'error'`. It removes all listeners when
exiting the loop. The `value` returned by each iteration is an array
composed of the emitted event arguments.

An `AbortSignal` can be used to cancel waiting on events:

```js
const { on, EventEmitter } = require('events');
const ac = new AbortController();

(async () => {
  const ee = new EventEmitter();

  // Emit later on
  process.nextTick(() => {
    ee.emit('foo', 'bar');
    ee.emit('foo', 42);
  });

  for await (const event of on(ee, 'foo', { signal: ac.signal })) {
    // The execution of this inner block is synchronous and it
    // processes one event at a time (even with await). Do not use
    // if concurrent execution is required.
    console.log(event); // prints ['bar'] [42]
  }
  // Unreachable here
})();

process.nextTick(() => ac.abort());
```

**`Since`**

v13.6.0, v12.16.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `emitter` | `EventEmitter` | - |
| `eventName` | `string` | The name of the event being listened for |
| `options?` | `StaticEventEmitterOptions` | - |

#### Returns

`AsyncIterableIterator`<`any`\>

that iterates `eventName` events emitted by the `emitter`

#### Inherited from

Worker.on

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:217

___

### once

▸ `Static` **once**(`emitter`, `eventName`, `options?`): `Promise`<`any`[]\>

Creates a `Promise` that is fulfilled when the `EventEmitter` emits the given
event or that is rejected if the `EventEmitter` emits `'error'` while waiting.
The `Promise` will resolve with an array of all the arguments emitted to the
given event.

This method is intentionally generic and works with the web platform [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget) interface, which has no special`'error'` event
semantics and does not listen to the `'error'` event.

```js
const { once, EventEmitter } = require('events');

async function run() {
  const ee = new EventEmitter();

  process.nextTick(() => {
    ee.emit('myevent', 42);
  });

  const [value] = await once(ee, 'myevent');
  console.log(value);

  const err = new Error('kaboom');
  process.nextTick(() => {
    ee.emit('error', err);
  });

  try {
    await once(ee, 'myevent');
  } catch (err) {
    console.log('error happened', err);
  }
}

run();
```

The special handling of the `'error'` event is only used when `events.once()`is used to wait for another event. If `events.once()` is used to wait for the
'`error'` event itself, then it is treated as any other kind of event without
special handling:

```js
const { EventEmitter, once } = require('events');

const ee = new EventEmitter();

once(ee, 'error')
  .then(([err]) => console.log('ok', err.message))
  .catch((err) => console.log('error', err.message));

ee.emit('error', new Error('boom'));

// Prints: ok boom
```

An `AbortSignal` can be used to cancel waiting for the event:

```js
const { EventEmitter, once } = require('events');

const ee = new EventEmitter();
const ac = new AbortController();

async function foo(emitter, event, signal) {
  try {
    await once(emitter, event, { signal });
    console.log('event emitted!');
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Waiting for the event was canceled!');
    } else {
      console.error('There was an error', error.message);
    }
  }
}

foo(ee, 'foo', ac.signal);
ac.abort(); // Abort waiting for the event
ee.emit('foo'); // Prints: Waiting for the event was canceled!
```

**`Since`**

v11.13.0, v10.16.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `emitter` | `NodeEventTarget` |
| `eventName` | `string` \| `symbol` |
| `options?` | `StaticEventEmitterOptions` |

#### Returns

`Promise`<`any`[]\>

#### Inherited from

Worker.once

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:157

▸ `Static` **once**(`emitter`, `eventName`, `options?`): `Promise`<`any`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `emitter` | `DOMEventTarget` |
| `eventName` | `string` |
| `options?` | `StaticEventEmitterOptions` |

#### Returns

`Promise`<`any`[]\>

#### Inherited from

Worker.once

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:158

___

### setMaxListeners

▸ `Static` **setMaxListeners**(`n?`, ...`eventTargets`): `void`

```js
const {
  setMaxListeners,
  EventEmitter
} = require('events');

const target = new EventTarget();
const emitter = new EventEmitter();

setMaxListeners(5, target, emitter);
```

**`Since`**

v15.4.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `n?` | `number` | A non-negative number. The maximum number of listeners per `EventTarget` event. |
| `...eventTargets` | (`EventEmitter` \| `DOMEventTarget`)[] | - |

#### Returns

`void`

#### Inherited from

Worker.setMaxListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:280
