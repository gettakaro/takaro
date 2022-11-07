---
id: "takaro_test.snapshot.ITestWithSnapshot"
title: "Class: ITestWithSnapshot<SetupData>"
sidebar_label: "@takaro/test.snapshot.ITestWithSnapshot"
custom_edit_url: null
---

[@takaro/test](../modules/takaro_test.md).[snapshot](../namespaces/takaro_test.snapshot.md).ITestWithSnapshot

## Type parameters

| Name |
| :------ |
| `SetupData` |

## Hierarchy

- `IIntegrationTest`<`SetupData`\>

  ↳ **`ITestWithSnapshot`**

## Constructors

### constructor

• **new ITestWithSnapshot**<`SetupData`\>()

#### Type parameters

| Name |
| :------ |
| `SetupData` |

#### Inherited from

IIntegrationTest<SetupData\>.constructor

## Properties

### expectedStatus

• `Optional` **expectedStatus**: `number` = `200`

#### Overrides

IIntegrationTest.expectedStatus

#### Defined in

[packages/test/src/snapshots.ts:20](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/snapshots.ts#L20)

___

### filteredFields

• `Optional` **filteredFields**: `string`[]

#### Overrides

IIntegrationTest.filteredFields

#### Defined in

[packages/test/src/snapshots.ts:21](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/snapshots.ts#L21)

___

### group

• **group**: `string`

#### Overrides

IIntegrationTest.group

#### Defined in

[packages/test/src/snapshots.ts:12](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/snapshots.ts#L12)

___

### name

• **name**: `string`

#### Overrides

IIntegrationTest.name

#### Defined in

[packages/test/src/snapshots.ts:13](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/snapshots.ts#L13)

___

### setup

• `Optional` **setup**: (`this`: [`IntegrationTest`](takaro_test.IntegrationTest.md)<`SetupData`\>) => `Promise`<`SetupData`\>

#### Type declaration

▸ (`this`): `Promise`<`SetupData`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | [`IntegrationTest`](takaro_test.IntegrationTest.md)<`SetupData`\> |

##### Returns

`Promise`<`SetupData`\>

#### Overrides

IIntegrationTest.setup

#### Defined in

[packages/test/src/snapshots.ts:15](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/snapshots.ts#L15)

___

### snapshot

• **snapshot**: `boolean` = `true`

#### Overrides

IIntegrationTest.snapshot

#### Defined in

[packages/test/src/snapshots.ts:11](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/snapshots.ts#L11)

___

### standardEnvironment

• `Optional` **standardEnvironment**: `boolean` = `true`

#### Overrides

IIntegrationTest.standardEnvironment

#### Defined in

[packages/test/src/snapshots.ts:14](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/snapshots.ts#L14)

___

### teardown

• `Optional` **teardown**: (`this`: [`IntegrationTest`](takaro_test.IntegrationTest.md)<`SetupData`\>) => `Promise`<`void`\>

#### Type declaration

▸ (`this`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | [`IntegrationTest`](takaro_test.IntegrationTest.md)<`SetupData`\> |

##### Returns

`Promise`<`void`\>

#### Overrides

IIntegrationTest.teardown

#### Defined in

[packages/test/src/snapshots.ts:16](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/snapshots.ts#L16)

___

### test

• **test**: (`this`: [`IntegrationTest`](takaro_test.IntegrationTest.md)<`SetupData`\>) => `Promise`<`ITakaroAPIAxiosResponse`<`unknown`\>\>

#### Type declaration

▸ (`this`): `Promise`<`ITakaroAPIAxiosResponse`<`unknown`\>\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | [`IntegrationTest`](takaro_test.IntegrationTest.md)<`SetupData`\> |

##### Returns

`Promise`<`ITakaroAPIAxiosResponse`<`unknown`\>\>

#### Overrides

IIntegrationTest.test

#### Defined in

[packages/test/src/snapshots.ts:17](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/test/src/snapshots.ts#L17)
