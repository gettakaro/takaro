---
id: "takaro_queues.TakaroQueue"
title: "Class: TakaroQueue<T>"
sidebar_label: "@takaro/queues.TakaroQueue"
custom_edit_url: null
---

[@takaro/queues](../modules/takaro_queues.md).TakaroQueue

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- `Queue`<`T`\>

  ↳ **`TakaroQueue`**

## Constructors

### constructor

• **new TakaroQueue**<`T`\>(`name`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Overrides

Queue&lt;T\&gt;.constructor

#### Defined in

[packages/lib-queues/src/queues.ts:17](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L17)

## Properties

### closing

• **closing**: `Promise`<`void`\>

#### Inherited from

Queue.closing

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:21

___

### connection

• `Protected` **connection**: `RedisConnection`

#### Inherited from

Queue.connection

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:23

___

### jobsOpts

• **jobsOpts**: `BaseJobOptions`

#### Inherited from

Queue.jobsOpts

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:72

___

### keys

• **keys**: `KeysMap`

#### Inherited from

Queue.keys

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:20

___

### limiter

• **limiter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `groupKey` | `string` |

#### Inherited from

Queue.limiter

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:73

___

### name

• `Readonly` **name**: `string`

#### Inherited from

Queue.name

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:17

___

### opts

• **opts**: `QueueBaseOptions`

#### Inherited from

Queue.opts

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:18

___

### scripts

• `Protected` **scripts**: `Scripts`

#### Inherited from

Queue.scripts

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:22

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

Queue.toKey

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:19

___

### token

• **token**: `string`

#### Inherited from

Queue.token

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:71

___

### captureRejectionSymbol

▪ `Static` `Readonly` **captureRejectionSymbol**: typeof [`captureRejectionSymbol`](takaro_queues.TakaroQueue.md#capturerejectionsymbol)

#### Inherited from

Queue.captureRejectionSymbol

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:291

___

### captureRejections

▪ `Static` **captureRejections**: `boolean`

Sets or gets the default captureRejection value for all emitters.

#### Inherited from

Queue.captureRejections

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:296

___

### defaultMaxListeners

▪ `Static` **defaultMaxListeners**: `number`

#### Inherited from

Queue.defaultMaxListeners

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

Queue.errorMonitor

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:290

## Accessors

### Job

• `Protected` `get` **Job**(): typeof `Job`

Helper to easily extend Job class calls.

#### Returns

typeof `Job`

#### Inherited from

Queue.Job

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:18

___

### client

• `get` **client**(): `Promise`<`RedisClient`\>

Returns a promise that resolves to a redis client. Normally used only by subclasses.

#### Returns

`Promise`<`RedisClient`\>

#### Inherited from

Queue.client

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:35

___

### defaultJobOptions

• `get` **defaultJobOptions**(): `JobsOptions`

Returns this instance current default job options.

#### Returns

`JobsOptions`

#### Inherited from

Queue.defaultJobOptions

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:85

___

### redisVersion

• `get` **redisVersion**(): `string`

Returns the version of the Redis instance the client is connected to,

#### Returns

`string`

#### Inherited from

Queue.redisVersion

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:39

___

### repeat

• `get` **repeat**(): `Promise`<`Repeat`\>

#### Returns

`Promise`<`Repeat`\>

#### Inherited from

Queue.repeat

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:86

## Methods

### add

▸ **add**(`name`, `data`, `opts?`): `Promise`<`Job`<`T`, `any`, `string`\>\>

Adds a new job to the queue.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Name of the job to be added to the queue,. |
| `data` | `T` | Arbitrary data to append to the job. |
| `opts?` | `JobsOptions` | Job options that affects how the job is going to be processed. |

#### Returns

`Promise`<`Job`<`T`, `any`, `string`\>\>

#### Inherited from

Queue.add

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:94

___

### addBulk

▸ **addBulk**(`jobs`): `Promise`<`Job`<`T`, `any`, `string`\>[]\>

Adds an array of jobs to the queue. This method may be faster than adding
one job at a time in a sequence.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `jobs` | { `data`: `T` ; `name`: `string` ; `opts?`: `BulkJobOptions`  }[] | The array of jobs to add to the queue. Each job is defined by 3 properties, 'name', 'data' and 'opts'. They follow the same signature as 'Queue.add'. |

#### Returns

`Promise`<`Job`<`T`, `any`, `string`\>[]\>

#### Inherited from

Queue.addBulk

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:102

___

### addListener

▸ **addListener**(`eventName`, `listener`): [`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

Alias for `emitter.on(eventName, listener)`.

**`Since`**

v0.1.26

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

[`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

#### Inherited from

Queue.addListener

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:317

___

### base64Name

▸ `Protected` **base64Name**(): `string`

#### Returns

`string`

#### Inherited from

Queue.base64Name

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:53

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

Queue.checkConnectionError

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:65

___

### clean

▸ **clean**(`grace`, `limit`, `type?`): `Promise`<`string`[]\>

Cleans jobs from a queue. Similar to drain but keeps jobs within a certain
grace period.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `grace` | `number` | The grace period |
| `limit` | `number` | Max number of jobs to clean |
| `type?` | ``"active"`` \| ``"completed"`` \| ``"failed"`` \| ``"paused"`` \| ``"delayed"`` \| ``"wait"`` | The type of job to clean Possible values are completed, wait, active, paused, delayed, failed. Defaults to completed. |

#### Returns

`Promise`<`string`[]\>

Id jobs from the deleted records

#### Inherited from

Queue.clean

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:206

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

Queue.clientName

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:54

___

### close

▸ **close**(): `Promise`<`void`\>

Close the queue instance.

#### Returns

`Promise`<`void`\>

#### Inherited from

Queue.close

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:123

___

### count

▸ **count**(): `Promise`<`number`\>

Returns the number of jobs waiting to be processed. This includes jobs that are "waiting" or "delayed".

#### Returns

`Promise`<`number`\>

#### Inherited from

Queue.count

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:23

___

### disconnect

▸ **disconnect**(): `Promise`<`void`\>

Force disconnects a connection.

#### Returns

`Promise`<`void`\>

#### Inherited from

Queue.disconnect

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:64

___

### drain

▸ **drain**(`delayed?`): `Promise`<`void`\>

Drains the queue, i.e., removes all jobs that are waiting
or delayed, but not active, completed or failed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `delayed?` | `boolean` | Pass true if it should also clean the delayed jobs. |

#### Returns

`Promise`<`void`\>

#### Inherited from

Queue.drain

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:195

___

### emit

▸ **emit**<`U`\>(`event`, ...`args`): `boolean`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends keyof `QueueListener`<`DataType`, `ResultType`, `NameType`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `U` |
| `...args` | `Parameters`<`QueueListener`<`T`, `any`, `string`\>[`U`]\> |

#### Returns

`boolean`

#### Inherited from

Queue.emit

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:78

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

Queue.eventNames

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:632

___

### getActive

▸ **getActive**(`start?`, `end?`): `Promise`<`Job`<`T`, `any`, `string`\>[]\>

Returns the jobs that are in the "active" status.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | zero based index from where to start returning jobs. |
| `end?` | `number` | zeroo based index where to stop returning jobs. |

#### Returns

`Promise`<`Job`<`T`, `any`, `string`\>[]\>

#### Inherited from

Queue.getActive

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:83

___

### getActiveCount

▸ **getActiveCount**(): `Promise`<`number`\>

Returns the number of jobs in active status.

#### Returns

`Promise`<`number`\>

#### Inherited from

Queue.getActiveCount

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:56

___

### getCompleted

▸ **getCompleted**(`start?`, `end?`): `Promise`<`Job`<`T`, `any`, `string`\>[]\>

Returns the jobs that are in the "completed" status.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | zero based index from where to start returning jobs. |
| `end?` | `number` | zeroo based index where to stop returning jobs. |

#### Returns

`Promise`<`Job`<`T`, `any`, `string`\>[]\>

#### Inherited from

Queue.getCompleted

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:95

___

### getCompletedCount

▸ **getCompletedCount**(): `Promise`<`number`\>

Returns the number of jobs in completed status.

#### Returns

`Promise`<`number`\>

#### Inherited from

Queue.getCompletedCount

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:44

___

### getDelayed

▸ **getDelayed**(`start?`, `end?`): `Promise`<`Job`<`T`, `any`, `string`\>[]\>

Returns the jobs that are in the "delayed" status.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | zero based index from where to start returning jobs. |
| `end?` | `number` | zeroo based index where to stop returning jobs. |

#### Returns

`Promise`<`Job`<`T`, `any`, `string`\>[]\>

#### Inherited from

Queue.getDelayed

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:89

___

### getDelayedCount

▸ **getDelayedCount**(): `Promise`<`number`\>

Returns the number of jobs in delayed status.

#### Returns

`Promise`<`number`\>

#### Inherited from

Queue.getDelayedCount

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:52

___

### getFailed

▸ **getFailed**(`start?`, `end?`): `Promise`<`Job`<`T`, `any`, `string`\>[]\>

Returns the jobs that are in the "failed" status.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | zero based index from where to start returning jobs. |
| `end?` | `number` | zeroo based index where to stop returning jobs. |

#### Returns

`Promise`<`Job`<`T`, `any`, `string`\>[]\>

#### Inherited from

Queue.getFailed

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:101

___

### getFailedCount

▸ **getFailedCount**(): `Promise`<`number`\>

Returns the number of jobs in failed status.

#### Returns

`Promise`<`number`\>

#### Inherited from

Queue.getFailedCount

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:48

___

### getJob

▸ **getJob**(`jobId`): `Promise`<`undefined` \| `Job`<`T`, `any`, `string`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `jobId` | `string` |

#### Returns

`Promise`<`undefined` \| `Job`<`T`, `any`, `string`\>\>

#### Inherited from

Queue.getJob

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:13

___

### getJobCountByTypes

▸ **getJobCountByTypes**(...`types`): `Promise`<`number`\>

Job counts by type

Queue#getJobCountByTypes('completed') => completed count
Queue#getJobCountByTypes('completed,failed') => completed + failed count
Queue#getJobCountByTypes('completed', 'failed') => completed + failed count
Queue#getJobCountByTypes('completed', 'waiting', 'failed') => completed + waiting + failed count

#### Parameters

| Name | Type |
| :------ | :------ |
| `...types` | `JobType`[] |

#### Returns

`Promise`<`number`\>

#### Inherited from

Queue.getJobCountByTypes

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:32

___

### getJobCounts

▸ **getJobCounts**(...`types`): `Promise`<{ `[index: string]`: `number`;  }\>

Returns the job counts for each type specified or every list/set in the queue by default.

#### Parameters

| Name | Type |
| :------ | :------ |
| `...types` | `JobType`[] |

#### Returns

`Promise`<{ `[index: string]`: `number`;  }\>

An object, key (type) and value (count)

#### Inherited from

Queue.getJobCounts

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:38

___

### getJobLogs

▸ **getJobLogs**(`jobId`, `start?`, `end?`, `asc?`): `Promise`<{ `count`: `number` ; `logs`: [`string`]  }\>

Returns the logs for a given Job.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `jobId` | `string` | the id of the job to get the logs for. |
| `start?` | `number` | zero based index from where to start returning jobs. |
| `end?` | `number` | zeroo based index where to stop returning jobs. |
| `asc?` | `boolean` | if true, the jobs will be returned in ascending order. |

#### Returns

`Promise`<{ `count`: `number` ; `logs`: [`string`]  }\>

#### Inherited from

Queue.getJobLogs

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:118

___

### getJobs

▸ **getJobs**(`types?`, `start?`, `end?`, `asc?`): `Promise`<`Job`<`T`, `any`, `string`\>[]\>

Returns the jobs that are on the given statuses (note that JobType is synonym for job status)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `types?` | `JobType` \| `JobType`[] | the statuses of the jobs to return. |
| `start?` | `number` | zero based index from where to start returning jobs. |
| `end?` | `number` | zeroo based index where to stop returning jobs. |
| `asc?` | `boolean` | if true, the jobs will be returned in ascending order. |

#### Returns

`Promise`<`Job`<`T`, `any`, `string`\>[]\>

#### Inherited from

Queue.getJobs

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:110

___

### getMaxListeners

▸ **getMaxListeners**(): `number`

Returns the current max listener value for the `EventEmitter` which is either
set by `emitter.setMaxListeners(n)` or defaults to [defaultMaxListeners](takaro_queues.TakaroQueue.md#defaultmaxlisteners).

**`Since`**

v1.0.0

#### Returns

`number`

#### Inherited from

Queue.getMaxListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:489

___

### getMetrics

▸ **getMetrics**(`type`, `start?`, `end?`): `Promise`<`Metrics`\>

Get queue metrics related to the queue.

This method returns the gathered metrics for the queue.
The metrics are represented as an array of job counts
per unit of time (1 minute).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | ``"completed"`` \| ``"failed"`` | - |
| `start?` | `number` | Start point of the metrics, where 0 is the newest point to be returned. |
| `end?` | `number` | End point of the metrics, where -1 is the oldest point to be returned. |

#### Returns

`Promise`<`Metrics`\>

- Returns an object with queue metrics.

#### Inherited from

Queue.getMetrics

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:162

___

### getQueueEvents

▸ **getQueueEvents**(): `Promise`<{ `[index: string]`: `string`;  }[]\>

Get queue events list related to the queue.

#### Returns

`Promise`<{ `[index: string]`: `string`;  }[]\>

- Returns an array with queue events info.

#### Inherited from

Queue.getQueueEvents

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:145

___

### getQueueSchedulers

▸ **getQueueSchedulers**(): `Promise`<{ `[index: string]`: `string`;  }[]\>

Get queue schedulers list related to the queue.

#### Returns

`Promise`<{ `[index: string]`: `string`;  }[]\>

- Returns an array with queue schedulers info.

#### Inherited from

Queue.getQueueSchedulers

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:137

___

### getRanges

▸ **getRanges**(`types`, `start?`, `end?`, `asc?`): `Promise`<`string`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `types` | `JobType`[] |
| `start?` | `number` |
| `end?` | `number` |
| `asc?` | `boolean` |

#### Returns

`Promise`<`string`[]\>

#### Inherited from

Queue.getRanges

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:102

___

### getRepeatableJobs

▸ **getRepeatableJobs**(`start?`, `end?`, `asc?`): `Promise`<{ `cron`: `string` ; `endDate`: `number` ; `id`: `string` ; `key`: `string` ; `name`: `string` ; `next`: `number` ; `pattern`: `string` ; `tz`: `string`  }[]\>

Get all repeatable meta jobs.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | Offset of first job to return. |
| `end?` | `number` | Offset of last job to return. |
| `asc?` | `boolean` | Determine the order in which jobs are returned based on their next execution time. |

#### Returns

`Promise`<{ `cron`: `string` ; `endDate`: `number` ; `id`: `string` ; `key`: `string` ; `name`: `string` ; `next`: `number` ; `pattern`: `string` ; `tz`: `string`  }[]\>

#### Inherited from

Queue.getRepeatableJobs

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:143

___

### getWaiting

▸ **getWaiting**(`start?`, `end?`): `Promise`<`Job`<`T`, `any`, `string`\>[]\>

Returns the jobs that are in the "waiting" status.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | zero based index from where to start returning jobs. |
| `end?` | `number` | zeroo based index where to stop returning jobs. |

#### Returns

`Promise`<`Job`<`T`, `any`, `string`\>[]\>

#### Inherited from

Queue.getWaiting

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:71

___

### getWaitingChildren

▸ **getWaitingChildren**(`start?`, `end?`): `Promise`<`Job`<`T`, `any`, `string`\>[]\>

Returns the jobs that are in the "waiting" status.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | zero based index from where to start returning jobs. |
| `end?` | `number` | zeroo based index where to stop returning jobs. |

#### Returns

`Promise`<`Job`<`T`, `any`, `string`\>[]\>

#### Inherited from

Queue.getWaitingChildren

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:77

___

### getWaitingChildrenCount

▸ **getWaitingChildrenCount**(): `Promise`<`number`\>

Returns the number of jobs in waiting-children status.

#### Returns

`Promise`<`number`\>

#### Inherited from

Queue.getWaitingChildrenCount

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:64

___

### getWaitingCount

▸ **getWaitingCount**(): `Promise`<`number`\>

Returns the number of jobs in waiting or paused statuses.

#### Returns

`Promise`<`number`\>

#### Inherited from

Queue.getWaitingCount

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:60

___

### getWorkers

▸ **getWorkers**(): `Promise`<{ `[index: string]`: `string`;  }[]\>

Get the worker list related to the queue. i.e. all the known
workers that are available to process jobs for this queue.

#### Returns

`Promise`<{ `[index: string]`: `string`;  }[]\>

- Returns an array with workers info.

#### Inherited from

Queue.getWorkers

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-getters.d.ts:129

___

### isPaused

▸ **isPaused**(): `Promise`<`boolean`\>

Returns true if the queue is currently paused.

#### Returns

`Promise`<`boolean`\>

#### Inherited from

Queue.isPaused

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:134

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

Queue.listenerCount

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

Queue.listeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:502

___

### obliterate

▸ **obliterate**(`opts?`): `Promise`<`void`\>

Completely destroys the queue and all of its contents irreversibly.
This method will the *pause* the queue and requires that there are no
active jobs. It is possible to bypass this requirement, i.e. not
having active jobs using the "force" option.

Note: This operation requires to iterate on all the jobs stored in the queue
and can be slow for very large queues.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts?` | `ObliterateOpts` | Obliterate options. |

#### Returns

`Promise`<`void`\>

#### Inherited from

Queue.obliterate

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:218

___

### off

▸ **off**<`U`\>(`eventName`, `listener`): [`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends keyof `QueueListener`<`DataType`, `ResultType`, `NameType`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `U` |
| `listener` | `QueueListener`<`T`, `any`, `string`\>[`U`] |

#### Returns

[`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

#### Inherited from

Queue.off

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:79

___

### on

▸ **on**<`U`\>(`event`, `listener`): [`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends keyof `QueueListener`<`DataType`, `ResultType`, `NameType`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `U` |
| `listener` | `QueueListener`<`T`, `any`, `string`\>[`U`] |

#### Returns

[`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

#### Inherited from

Queue.on

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:80

___

### once

▸ **once**<`U`\>(`event`, `listener`): [`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends keyof `QueueListener`<`DataType`, `ResultType`, `NameType`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `U` |
| `listener` | `QueueListener`<`T`, `any`, `string`\>[`U`] |

#### Returns

[`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

#### Inherited from

Queue.once

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:81

___

### pause

▸ **pause**(): `Promise`<`void`\>

Pauses the processing of this queue globally.

We use an atomic RENAME operation on the wait queue. Since
we have blocking calls with BRPOPLPUSH on the wait queue, as long as the queue
is renamed to 'paused', no new jobs will be processed (the current ones
will run until finalized).

Adding jobs requires a LUA script to check first if the paused list exist
and in that case it will add it there instead of the wait list.

#### Returns

`Promise`<`void`\>

#### Inherited from

Queue.pause

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:118

___

### prependListener

▸ **prependListener**(`eventName`, `listener`): [`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

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

[`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

#### Inherited from

Queue.prependListener

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:597

___

### prependOnceListener

▸ **prependOnceListener**(`eventName`, `listener`): [`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

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

[`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

#### Inherited from

Queue.prependOnceListener

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:613

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

Queue.rawListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:532

___

### remove

▸ **remove**(`jobId`): `Promise`<`number`\>

Removes the given job from the queue as well as all its
dependencies.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `jobId` | `string` | The id of the job to remove |

#### Returns

`Promise`<`number`\>

1 if it managed to remove the job or 0 if the job or
any of its dependencies was locked.

#### Inherited from

Queue.remove

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:187

___

### removeAllListeners

▸ **removeAllListeners**(`event?`): [`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

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

[`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

#### Inherited from

Queue.removeAllListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:473

___

### removeListener

▸ **removeListener**(`eventName`, `listener`): [`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

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

[`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

#### Inherited from

Queue.removeListener

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:457

___

### removeRepeatable

▸ **removeRepeatable**(`name`, `repeatOpts`, `jobId?`): `Promise`<`boolean`\>

Removes a repeatable job.

Note: you need to use the exact same repeatOpts when deleting a repeatable job
than when adding it.

**`See`**

removeRepeatableByKey

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `repeatOpts` | `RepeatOptions` |
| `jobId?` | `string` |

#### Returns

`Promise`<`boolean`\>

#### Inherited from

Queue.removeRepeatable

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:166

___

### removeRepeatableByKey

▸ **removeRepeatableByKey**(`key`): `Promise`<`boolean`\>

Removes a repeatable job by its key. Note that the key is the one used
to store the repeatable job metadata and not one of the job iterations
themselves. You can use "getRepeatableJobs" in order to get the keys.

**`See`**

getRepeatableJobs

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | to the repeatable job. |

#### Returns

`Promise`<`boolean`\>

#### Inherited from

Queue.removeRepeatableByKey

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:178

___

### resume

▸ **resume**(): `Promise`<`void`\>

Resumes the processing of this queue globally.

The method reverses the pause operation by resuming the processing of the
queue.

#### Returns

`Promise`<`void`\>

#### Inherited from

Queue.resume

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:130

___

### retryJobs

▸ **retryJobs**(`opts?`): `Promise`<`void`\>

Retry all the failed jobs.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts?` | `Object` | contains number to limit how many jobs will be moved to wait status per iteration, state (failed, completed) failed by default or from which timestamp. |
| `opts.count?` | `number` | - |
| `opts.state?` | `FinishedStatus` | - |
| `opts.timestamp?` | `number` | - |

#### Returns

`Promise`<`void`\>

#### Inherited from

Queue.retryJobs

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:226

___

### setMaxListeners

▸ **setMaxListeners**(`n`): [`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

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

[`TakaroQueue`](takaro_queues.TakaroQueue.md)<`T`\>

#### Inherited from

Queue.setMaxListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:483

___

### trimEvents

▸ **trimEvents**(`maxLength`): `Promise`<`number`\>

Trim the event stream to an approximately maxLength.

#### Parameters

| Name | Type |
| :------ | :------ |
| `maxLength` | `number` |

#### Returns

`Promise`<`number`\>

#### Inherited from

Queue.trimEvents

#### Defined in

node_modules/bullmq/dist/esm/classes/queue.d.ts:236

___

### waitUntilReady

▸ **waitUntilReady**(): `Promise`<`RedisClient`\>

#### Returns

`Promise`<`RedisClient`\>

#### Inherited from

Queue.waitUntilReady

#### Defined in

node_modules/bullmq/dist/esm/classes/queue-base.d.ts:52

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

Queue.getEventListeners

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

Queue.listenerCount

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

Queue.on

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

Queue.once

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

Queue.once

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

Queue.setMaxListeners

#### Defined in

node_modules/@types/node/ts4.8/events.d.ts:280
