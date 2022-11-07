---
id: "takaro_queues.IQueuesConfig"
title: "Interface: IQueuesConfig"
sidebar_label: "@takaro/queues.IQueuesConfig"
custom_edit_url: null
---

[@takaro/queues](../modules/takaro_queues.md).IQueuesConfig

## Hierarchy

- `IBaseConfig`

  ↳ **`IQueuesConfig`**

## Properties

### app

• **app**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Inherited from

IBaseConfig.app

#### Defined in

node_modules/@takaro/config/dist/main.d.ts:3

___

### mode

• **mode**: ``"development"`` \| ``"production"`` \| ``"test"``

#### Inherited from

IBaseConfig.mode

#### Defined in

node_modules/@takaro/config/dist/main.d.ts:6

___

### queues

• **queues**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `commands` | { `concurrency`: `number` ; `name`: `string`  } |
| `commands.concurrency` | `number` |
| `commands.name` | `string` |
| `cronjobs` | { `concurrency`: `number` ; `name`: `string`  } |
| `cronjobs.concurrency` | `number` |
| `cronjobs.name` | `string` |
| `events` | { `concurrency`: `number` ; `name`: `string`  } |
| `events.concurrency` | `number` |
| `events.name` | `string` |
| `hooks` | { `concurrency`: `number` ; `name`: `string`  } |
| `hooks.concurrency` | `number` |
| `hooks.name` | `string` |

#### Defined in

[packages/lib-queues/src/config.ts:4](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/config.ts#L4)

___

### redis

• **redis**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `host` | `string` |
| `password` | `string` |
| `port` | `number` |
| `tlsCa` | `string` |
| `username` | `string` |

#### Defined in

[packages/lib-queues/src/config.ts:22](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-queues/src/config.ts#L22)
