---
id: "takaro_queues.IJobData"
title: "Interface: IJobData"
sidebar_label: "@takaro/queues.IJobData"
custom_edit_url: null
---

[@takaro/queues](../modules/takaro_queues.md).IJobData

## Properties

### data

• `Optional` **data**: `EventLogLine` \| `EventPlayerConnected` \| `EventPlayerDisconnected` \| `EventChatMessage`

Additional data that can be passed to the job
Typically, this depends on what triggered the job

#### Defined in

[packages/lib-queues/src/queues.ts:49](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L49)

___

### domainId

• **domainId**: `string`

#### Defined in

[packages/lib-queues/src/queues.ts:39](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L39)

___

### function

• **function**: `string`

#### Defined in

[packages/lib-queues/src/queues.ts:38](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L38)

___

### itemId

• **itemId**: `string`

The id of the item that triggered this job (cronjobId, commandId or hookId)

#### Defined in

[packages/lib-queues/src/queues.ts:44](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L44)

___

### token

• **token**: `string`

#### Defined in

[packages/lib-queues/src/queues.ts:40](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/queues.ts#L40)
