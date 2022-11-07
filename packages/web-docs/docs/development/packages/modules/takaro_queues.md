---
id: "takaro_queues"
title: "Module: @takaro/queues"
sidebar_label: "@takaro/queues"
sidebar_position: 0
custom_edit_url: null
---

## Classes

- [QueuesService](../classes/takaro_queues.QueuesService.md)
- [TakaroQueue](../classes/takaro_queues.TakaroQueue.md)
- [TakaroWorker](../classes/takaro_queues.TakaroWorker.md)

## Interfaces

- [IEventQueueData](../interfaces/takaro_queues.IEventQueueData.md)
- [IJobData](../interfaces/takaro_queues.IJobData.md)
- [IQueuesConfig](../interfaces/takaro_queues.IQueuesConfig.md)

## Variables

### queuesConfigSchema

• `Const` **queuesConfigSchema**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `queues` | { `commands`: { `concurrency`: { `default`: `number` = 1; `doc`: `string` = 'The number of commands to run at once'; `env`: `string` = 'COMMANDS\_QUEUE\_CONCURRENCY'; `format`: `NumberConstructor` = Number } ; `name`: { `default`: `string` = 'commands'; `doc`: `string` = 'The name of the queue to use for commands'; `env`: `string` = 'COMMANDS\_QUEUE\_NAME'; `format`: `StringConstructor` = String }  } ; `cronjobs`: { `concurrency`: { `default`: `number` = 1; `doc`: `string` = 'The number of cronjobs to run at once'; `env`: `string` = 'CRONJOBS\_QUEUE\_CONCURRENCY'; `format`: `NumberConstructor` = Number } ; `name`: { `default`: `string` = 'cronjobs'; `doc`: `string` = 'The name of the queue to use for cronjobs'; `env`: `string` = 'CRONJOBS\_QUEUE\_NAME'; `format`: `StringConstructor` = String }  } ; `events`: { `concurrency`: { `default`: `number` = 1; `doc`: `string` = 'The number of events to run at once'; `env`: `string` = 'EVENTS\_QUEUE\_CONCURRENCY'; `format`: `NumberConstructor` = Number } ; `name`: { `default`: `string` = 'events'; `doc`: `string` = 'The name of the queue to use for events'; `env`: `string` = 'EVENTS\_QUEUE\_NAME'; `format`: `StringConstructor` = String }  } ; `hooks`: { `concurrency`: { `default`: `number` = 1; `doc`: `string` = 'The number of hooks to run at once'; `env`: `string` = 'HOOKS\_QUEUE\_CONCURRENCY'; `format`: `NumberConstructor` = Number } ; `name`: { `default`: `string` = 'hooks'; `doc`: `string` = 'The name of the queue to use for hooks'; `env`: `string` = 'HOOKS\_QUEUE\_NAME'; `format`: `StringConstructor` = String }  }  } |
| `queues.commands` | { `concurrency`: { `default`: `number` = 1; `doc`: `string` = 'The number of commands to run at once'; `env`: `string` = 'COMMANDS\_QUEUE\_CONCURRENCY'; `format`: `NumberConstructor` = Number } ; `name`: { `default`: `string` = 'commands'; `doc`: `string` = 'The name of the queue to use for commands'; `env`: `string` = 'COMMANDS\_QUEUE\_NAME'; `format`: `StringConstructor` = String }  } |
| `queues.commands.concurrency` | { `default`: `number` = 1; `doc`: `string` = 'The number of commands to run at once'; `env`: `string` = 'COMMANDS\_QUEUE\_CONCURRENCY'; `format`: `NumberConstructor` = Number } |
| `queues.commands.concurrency.default` | `number` |
| `queues.commands.concurrency.doc` | `string` |
| `queues.commands.concurrency.env` | `string` |
| `queues.commands.concurrency.format` | `NumberConstructor` |
| `queues.commands.name` | { `default`: `string` = 'commands'; `doc`: `string` = 'The name of the queue to use for commands'; `env`: `string` = 'COMMANDS\_QUEUE\_NAME'; `format`: `StringConstructor` = String } |
| `queues.commands.name.default` | `string` |
| `queues.commands.name.doc` | `string` |
| `queues.commands.name.env` | `string` |
| `queues.commands.name.format` | `StringConstructor` |
| `queues.cronjobs` | { `concurrency`: { `default`: `number` = 1; `doc`: `string` = 'The number of cronjobs to run at once'; `env`: `string` = 'CRONJOBS\_QUEUE\_CONCURRENCY'; `format`: `NumberConstructor` = Number } ; `name`: { `default`: `string` = 'cronjobs'; `doc`: `string` = 'The name of the queue to use for cronjobs'; `env`: `string` = 'CRONJOBS\_QUEUE\_NAME'; `format`: `StringConstructor` = String }  } |
| `queues.cronjobs.concurrency` | { `default`: `number` = 1; `doc`: `string` = 'The number of cronjobs to run at once'; `env`: `string` = 'CRONJOBS\_QUEUE\_CONCURRENCY'; `format`: `NumberConstructor` = Number } |
| `queues.cronjobs.concurrency.default` | `number` |
| `queues.cronjobs.concurrency.doc` | `string` |
| `queues.cronjobs.concurrency.env` | `string` |
| `queues.cronjobs.concurrency.format` | `NumberConstructor` |
| `queues.cronjobs.name` | { `default`: `string` = 'cronjobs'; `doc`: `string` = 'The name of the queue to use for cronjobs'; `env`: `string` = 'CRONJOBS\_QUEUE\_NAME'; `format`: `StringConstructor` = String } |
| `queues.cronjobs.name.default` | `string` |
| `queues.cronjobs.name.doc` | `string` |
| `queues.cronjobs.name.env` | `string` |
| `queues.cronjobs.name.format` | `StringConstructor` |
| `queues.events` | { `concurrency`: { `default`: `number` = 1; `doc`: `string` = 'The number of events to run at once'; `env`: `string` = 'EVENTS\_QUEUE\_CONCURRENCY'; `format`: `NumberConstructor` = Number } ; `name`: { `default`: `string` = 'events'; `doc`: `string` = 'The name of the queue to use for events'; `env`: `string` = 'EVENTS\_QUEUE\_NAME'; `format`: `StringConstructor` = String }  } |
| `queues.events.concurrency` | { `default`: `number` = 1; `doc`: `string` = 'The number of events to run at once'; `env`: `string` = 'EVENTS\_QUEUE\_CONCURRENCY'; `format`: `NumberConstructor` = Number } |
| `queues.events.concurrency.default` | `number` |
| `queues.events.concurrency.doc` | `string` |
| `queues.events.concurrency.env` | `string` |
| `queues.events.concurrency.format` | `NumberConstructor` |
| `queues.events.name` | { `default`: `string` = 'events'; `doc`: `string` = 'The name of the queue to use for events'; `env`: `string` = 'EVENTS\_QUEUE\_NAME'; `format`: `StringConstructor` = String } |
| `queues.events.name.default` | `string` |
| `queues.events.name.doc` | `string` |
| `queues.events.name.env` | `string` |
| `queues.events.name.format` | `StringConstructor` |
| `queues.hooks` | { `concurrency`: { `default`: `number` = 1; `doc`: `string` = 'The number of hooks to run at once'; `env`: `string` = 'HOOKS\_QUEUE\_CONCURRENCY'; `format`: `NumberConstructor` = Number } ; `name`: { `default`: `string` = 'hooks'; `doc`: `string` = 'The name of the queue to use for hooks'; `env`: `string` = 'HOOKS\_QUEUE\_NAME'; `format`: `StringConstructor` = String }  } |
| `queues.hooks.concurrency` | { `default`: `number` = 1; `doc`: `string` = 'The number of hooks to run at once'; `env`: `string` = 'HOOKS\_QUEUE\_CONCURRENCY'; `format`: `NumberConstructor` = Number } |
| `queues.hooks.concurrency.default` | `number` |
| `queues.hooks.concurrency.doc` | `string` |
| `queues.hooks.concurrency.env` | `string` |
| `queues.hooks.concurrency.format` | `NumberConstructor` |
| `queues.hooks.name` | { `default`: `string` = 'hooks'; `doc`: `string` = 'The name of the queue to use for hooks'; `env`: `string` = 'HOOKS\_QUEUE\_NAME'; `format`: `StringConstructor` = String } |
| `queues.hooks.name.default` | `string` |
| `queues.hooks.name.doc` | `string` |
| `queues.hooks.name.env` | `string` |
| `queues.hooks.name.format` | `StringConstructor` |
| `redis` | { `host`: { `default`: `string` = 'localhost'; `doc`: `string` = 'The host of the redis server'; `env`: `string` = 'REDIS\_HOST'; `format`: `StringConstructor` = String } ; `password`: { `default`: `string` = ''; `doc`: `string` = 'The password of the redis server'; `env`: `string` = 'REDIS\_PASSWORD'; `format`: `StringConstructor` = String } ; `port`: { `default`: `number` = 6379; `doc`: `string` = 'The port of the redis server'; `env`: `string` = 'REDIS\_PORT'; `format`: `NumberConstructor` = Number } ; `tlsCa`: { `default`: `string` = ''; `doc`: `string` = 'Optional TLS certificate, if the redis server is using TLS'; `env`: `string` = 'REDIS\_TLS\_CA'; `format`: `StringConstructor` = String } ; `username`: { `default`: `string` = ''; `doc`: `string` = 'The username of the redis server'; `env`: `string` = 'REDIS\_USERNAME'; `format`: `StringConstructor` = String }  } |
| `redis.host` | { `default`: `string` = 'localhost'; `doc`: `string` = 'The host of the redis server'; `env`: `string` = 'REDIS\_HOST'; `format`: `StringConstructor` = String } |
| `redis.host.default` | `string` |
| `redis.host.doc` | `string` |
| `redis.host.env` | `string` |
| `redis.host.format` | `StringConstructor` |
| `redis.password` | { `default`: `string` = ''; `doc`: `string` = 'The password of the redis server'; `env`: `string` = 'REDIS\_PASSWORD'; `format`: `StringConstructor` = String } |
| `redis.password.default` | `string` |
| `redis.password.doc` | `string` |
| `redis.password.env` | `string` |
| `redis.password.format` | `StringConstructor` |
| `redis.port` | { `default`: `number` = 6379; `doc`: `string` = 'The port of the redis server'; `env`: `string` = 'REDIS\_PORT'; `format`: `NumberConstructor` = Number } |
| `redis.port.default` | `number` |
| `redis.port.doc` | `string` |
| `redis.port.env` | `string` |
| `redis.port.format` | `NumberConstructor` |
| `redis.tlsCa` | { `default`: `string` = ''; `doc`: `string` = 'Optional TLS certificate, if the redis server is using TLS'; `env`: `string` = 'REDIS\_TLS\_CA'; `format`: `StringConstructor` = String } |
| `redis.tlsCa.default` | `string` |
| `redis.tlsCa.doc` | `string` |
| `redis.tlsCa.env` | `string` |
| `redis.tlsCa.format` | `StringConstructor` |
| `redis.username` | { `default`: `string` = ''; `doc`: `string` = 'The username of the redis server'; `env`: `string` = 'REDIS\_USERNAME'; `format`: `StringConstructor` = String } |
| `redis.username.default` | `string` |
| `redis.username.doc` | `string` |
| `redis.username.env` | `string` |
| `redis.username.format` | `StringConstructor` |

#### Defined in

[packages/lib-queues/src/config.ts:31](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/config.ts#L31)
