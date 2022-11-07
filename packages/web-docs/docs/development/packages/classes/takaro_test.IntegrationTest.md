---
id: "takaro_test.IntegrationTest"
title: "Class: IntegrationTest<SetupData>"
sidebar_label: "@takaro/test.IntegrationTest"
custom_edit_url: null
---

[@takaro/test](../modules/takaro_test.md).IntegrationTest

## Type parameters

| Name |
| :------ |
| `SetupData` |

## Constructors

### constructor

• **new IntegrationTest**<`SetupData`\>(`test`)

#### Type parameters

| Name |
| :------ |
| `SetupData` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `test` | `IIntegrationTest`<`SetupData`\> \| [`ITestWithSnapshot`](takaro_test.snapshot.ITestWithSnapshot.md)<`SetupData`\> |

#### Defined in

[packages/test/src/integrationTest.ts:45](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/integrationTest.ts#L45)

## Properties

### adminClient

• `Readonly` **adminClient**: `AdminClient`

#### Defined in

[packages/test/src/integrationTest.ts:35](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/integrationTest.ts#L35)

___

### client

• `Readonly` **client**: `Client`

#### Defined in

[packages/test/src/integrationTest.ts:36](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/integrationTest.ts#L36)

___

### log

• `Protected` **log**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `debug` | () => `void` |
| `error` | () => `void` |
| `info` | () => `void` |
| `warn` | () => `void` |

#### Defined in

[packages/test/src/integrationTest.ts:28](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/integrationTest.ts#L28)

___

### setupData

• **setupData**: `Awaited`<`SetupData`\>

#### Defined in

[packages/test/src/integrationTest.ts:39](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/integrationTest.ts#L39)

___

### standardDomainId

• **standardDomainId**: ``null`` \| `string` = `null`

#### Defined in

[packages/test/src/integrationTest.ts:38](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/integrationTest.ts#L38)

___

### standardLogin

• **standardLogin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `password` | `string` |
| `username` | `string` |

#### Defined in

[packages/test/src/integrationTest.ts:40](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/integrationTest.ts#L40)

___

### test

• **test**: `IIntegrationTest`<`SetupData`\> \| [`ITestWithSnapshot`](takaro_test.snapshot.ITestWithSnapshot.md)<`SetupData`\>

#### Defined in

[packages/test/src/integrationTest.ts:46](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/integrationTest.ts#L46)

## Methods

### run

▸ **run**(): `void`

#### Returns

`void`

#### Defined in

[packages/test/src/integrationTest.ts:86](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/integrationTest.ts#L86)

___

### setupStandardEnvironment

▸ `Private` **setupStandardEnvironment**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/test/src/integrationTest.ts:69](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/integrationTest.ts#L69)
