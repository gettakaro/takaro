---
id: "takaro_gameserver.IGamePlayer"
title: "Class: IGamePlayer"
sidebar_label: "@takaro/gameserver.IGamePlayer"
custom_edit_url: null
---

[@takaro/gameserver](../modules/takaro_gameserver.md).IGamePlayer

## Hierarchy

- `TakaroDTO`<[`IGamePlayer`](takaro_gameserver.IGamePlayer.md)\>

  ↳ **`IGamePlayer`**

## Constructors

### constructor

• **new IGamePlayer**(`data?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data?` | `Partial`<[`IGamePlayer`](takaro_gameserver.IGamePlayer.md)\> |

#### Inherited from

TakaroDTO<IGamePlayer\>.constructor

#### Defined in

node_modules/@takaro/util/dist/dto/TakaroDTO.d.ts:6

## Properties

### device

• `Optional` **device**: `string`

#### Defined in

[packages/lib-gameserver/src/interfaces/GamePlayer.ts:34](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GamePlayer.ts#L34)

___

### epicOnlineServicesId

• `Optional` **epicOnlineServicesId**: `string`

#### Defined in

[packages/lib-gameserver/src/interfaces/GamePlayer.ts:22](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GamePlayer.ts#L22)

___

### gameId

• **gameId**: `string`

Unique identifier for this player, as used by the game

#### Defined in

[packages/lib-gameserver/src/interfaces/GamePlayer.ts:9](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GamePlayer.ts#L9)

___

### ip

• `Optional` **ip**: `string`

#### Defined in

[packages/lib-gameserver/src/interfaces/GamePlayer.ts:38](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GamePlayer.ts#L38)

___

### name

• **name**: `string`

The players username

#### Defined in

[packages/lib-gameserver/src/interfaces/GamePlayer.ts:14](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GamePlayer.ts#L14)

___

### platformId

• `Optional` **platformId**: `string`

#### Defined in

[packages/lib-gameserver/src/interfaces/GamePlayer.ts:30](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GamePlayer.ts#L30)

___

### steamId

• `Optional` **steamId**: `string`

#### Defined in

[packages/lib-gameserver/src/interfaces/GamePlayer.ts:18](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GamePlayer.ts#L18)

___

### xboxLiveId

• `Optional` **xboxLiveId**: `string`

#### Defined in

[packages/lib-gameserver/src/interfaces/GamePlayer.ts:26](https://github.com/niekcandaele/Takaro/blob/91fb19b/packages/lib-gameserver/src/interfaces/GamePlayer.ts#L26)

## Methods

### toJSON

▸ **toJSON**(): `Record`<`string`, `any`\>

#### Returns

`Record`<`string`, `any`\>

#### Inherited from

TakaroDTO.toJSON

#### Defined in

node_modules/@takaro/util/dist/dto/TakaroDTO.d.ts:8

___

### validate

▸ **validate**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Inherited from

TakaroDTO.validate

#### Defined in

node_modules/@takaro/util/dist/dto/TakaroDTO.d.ts:7
