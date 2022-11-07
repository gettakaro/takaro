---
id: "takaro_lib_components.ConsoleProps"
title: "Interface: ConsoleProps"
sidebar_label: "@takaro/lib-components.ConsoleProps"
custom_edit_url: null
---

[@takaro/lib-components](../modules/takaro_lib_components.md).ConsoleProps

## Properties

### initialMessages

• `Optional` **initialMessages**: [`Message`](takaro_lib_components.Message.md)[]

#### Defined in

[packages/lib-components/src/components/data/Console/index.tsx:30](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-components/src/components/data/Console/index.tsx#L30)

___

### listenerFactory

• **listenerFactory**: (`s`: `Dispatch`<`SetStateAction`<[`Message`](takaro_lib_components.Message.md)[]\>\>) => { `off`: () => `void` ; `on`: () => `void`  }

#### Type declaration

▸ (`s`): `Object`

##### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `Dispatch`<`SetStateAction`<[`Message`](takaro_lib_components.Message.md)[]\>\> |

##### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `off` | () => `void` |
| `on` | () => `void` |

#### Defined in

[packages/lib-components/src/components/data/Console/index.tsx:25](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-components/src/components/data/Console/index.tsx#L25)

___

### onExecuteCommand

• **onExecuteCommand**: (`command`: `string`) => `Promise`<[`Message`](takaro_lib_components.Message.md)\>

#### Type declaration

▸ (`command`): `Promise`<[`Message`](takaro_lib_components.Message.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `command` | `string` |

##### Returns

`Promise`<[`Message`](takaro_lib_components.Message.md)\>

#### Defined in

[packages/lib-components/src/components/data/Console/index.tsx:29](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-components/src/components/data/Console/index.tsx#L29)
