---
id: "takaro_test"
title: "Module: @takaro/test"
sidebar_label: "@takaro/test"
sidebar_position: 0
custom_edit_url: null
---

## Namespaces

- [snapshot](../namespaces/takaro_test.snapshot.md)

## Classes

- [IntegrationTest](../classes/takaro_test.IntegrationTest.md)

## Variables

### integrationConfig

• `Const` **integrationConfig**: `Config`<`IIntegrationTestConfig`\>

#### Defined in

[packages/test/src/test/integrationConfig.ts:41](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/test/integrationConfig.ts#L41)

___

### sandbox

• `Const` **sandbox**: `SinonSandbox`

#### Defined in

[packages/test/src/test/sandbox.ts:3](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/test/sandbox.ts#L3)

## Functions

### expect

▸ **expect**(`val`, `message?`): `Assertion`

#### Parameters

| Name | Type |
| :------ | :------ |
| `val` | `any` |
| `message?` | `string` |

#### Returns

`Assertion`

#### Defined in

node_modules/@types/chai/index.d.ts:104

___

### logInWithCapabilities

▸ **logInWithCapabilities**(`client`, `capabilities`): `Promise`<`Client`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `Client` |
| `capabilities` | `RoleCreateInputDTOCapabilitiesEnum`[] |

#### Returns

`Promise`<`Client`\>

#### Defined in

[packages/test/src/integrationTest.ts:147](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/integrationTest.ts#L147)
