---
id: "takaro_queues.QueuesService"
title: "Class: QueuesService"
sidebar_label: "@takaro/queues.QueuesService"
custom_edit_url: null
---

[@takaro/queues](../modules/takaro_queues.md).QueuesService

## Constructors

### constructor

• **new QueuesService**()

#### Defined in

[packages/lib-queues/src/queues.ts:111](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L111)

## Properties

### queuesMap

• `Private` **queuesMap**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `commands` | { `events`: `QueueEvents` ; `queue`: [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> ; `scheduler`: `QueueScheduler`  } |
| `commands.events` | `QueueEvents` |
| `commands.queue` | [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> |
| `commands.scheduler` | `QueueScheduler` |
| `cronjobs` | { `events`: `QueueEvents` ; `queue`: [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> ; `scheduler`: `QueueScheduler`  } |
| `cronjobs.events` | `QueueEvents` |
| `cronjobs.queue` | [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> |
| `cronjobs.scheduler` | `QueueScheduler` |
| `events` | { `events`: `QueueEvents` ; `queue`: [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IEventQueueData`](../interfaces/takaro_queues.IEventQueueData.md)\> ; `scheduler`: `QueueScheduler`  } |
| `events.events` | `QueueEvents` |
| `events.queue` | [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IEventQueueData`](../interfaces/takaro_queues.IEventQueueData.md)\> |
| `events.scheduler` | `QueueScheduler` |
| `hooks` | { `events`: `QueueEvents` ; `queue`: [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> ; `scheduler`: `QueueScheduler`  } |
| `hooks.events` | `QueueEvents` |
| `hooks.queue` | [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> |
| `hooks.scheduler` | `QueueScheduler` |

#### Defined in

[packages/lib-queues/src/queues.ts:72](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L72)

___

### workers

• `Private` **workers**: ([`TakaroWorker`](takaro_queues.TakaroWorker.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> \| [`TakaroWorker`](takaro_queues.TakaroWorker.md)<[`IEventQueueData`](../interfaces/takaro_queues.IEventQueueData.md)\>)[] = `[]`

#### Defined in

[packages/lib-queues/src/queues.ts:69](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L69)

___

### instance

▪ `Static` `Private` **instance**: [`QueuesService`](takaro_queues.QueuesService.md)

#### Defined in

[packages/lib-queues/src/queues.ts:60](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L60)

## Accessors

### queues

• `get` **queues**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `commands` | { `events`: `QueueEvents` ; `queue`: [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> ; `scheduler`: `QueueScheduler`  } |
| `commands.events` | `QueueEvents` |
| `commands.queue` | [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> |
| `commands.scheduler` | `QueueScheduler` |
| `cronjobs` | { `events`: `QueueEvents` ; `queue`: [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> ; `scheduler`: `QueueScheduler`  } |
| `cronjobs.events` | `QueueEvents` |
| `cronjobs.queue` | [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> |
| `cronjobs.scheduler` | `QueueScheduler` |
| `events` | { `events`: `QueueEvents` ; `queue`: [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IEventQueueData`](../interfaces/takaro_queues.IEventQueueData.md)\> ; `scheduler`: `QueueScheduler`  } |
| `events.events` | `QueueEvents` |
| `events.queue` | [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IEventQueueData`](../interfaces/takaro_queues.IEventQueueData.md)\> |
| `events.scheduler` | `QueueScheduler` |
| `hooks` | { `events`: `QueueEvents` ; `queue`: [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> ; `scheduler`: `QueueScheduler`  } |
| `hooks.events` | `QueueEvents` |
| `hooks.queue` | [`TakaroQueue`](takaro_queues.TakaroQueue.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> |
| `hooks.scheduler` | `QueueScheduler` |

#### Defined in

[packages/lib-queues/src/queues.ts:115](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L115)

## Methods

### initQueues

▸ `Private` **initQueues**(): `void`

#### Returns

`void`

#### Defined in

[packages/lib-queues/src/queues.ts:126](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L126)

___

### registerWorker

▸ **registerWorker**(`worker`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `worker` | [`TakaroWorker`](takaro_queues.TakaroWorker.md)<[`IJobData`](../interfaces/takaro_queues.IJobData.md)\> \| [`TakaroWorker`](takaro_queues.TakaroWorker.md)<[`IEventQueueData`](../interfaces/takaro_queues.IEventQueueData.md)\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/lib-queues/src/queues.ts:119](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L119)

___

### getInstance

▸ `Static` **getInstance**(): [`QueuesService`](takaro_queues.QueuesService.md)

#### Returns

[`QueuesService`](takaro_queues.QueuesService.md)

#### Defined in

[packages/lib-queues/src/queues.ts:62](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L62)
