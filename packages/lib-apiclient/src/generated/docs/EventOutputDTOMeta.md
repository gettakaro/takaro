# EventOutputDTOMeta

## Properties

| Name                   | Type                                                                                    | Description | Notes                             |
| ---------------------- | --------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **player**             | [**IGamePlayer**](IGamePlayer.md)                                                       |             | [default to undefined]            |
| **timestamp**          | [**NOTDOMAINSCOPEDTakaroModelDTOCreatedAt**](NOTDOMAINSCOPEDTakaroModelDTOCreatedAt.md) |             | [default to undefined]            |
| **msg**                | **string**                                                                              |             | [default to undefined]            |
| **channel**            | [**EventDiscordChannel**](EventDiscordChannel.md)                                       |             | [default to undefined]            |
| **recipient**          | [**IGamePlayer**](IGamePlayer.md)                                                       |             | [optional] [default to undefined] |
| **attacker**           | [**IGamePlayer**](IGamePlayer.md)                                                       |             | [optional] [default to undefined] |
| **position**           | [**IPosition**](IPosition.md)                                                           |             | [optional] [default to undefined] |
| **entity**             | **string**                                                                              |             | [default to undefined]            |
| **weapon**             | **string**                                                                              |             | [default to undefined]            |
| **author**             | [**EventDiscordUser**](EventDiscordUser.md)                                             |             | [default to undefined]            |
| **role**               | [**TakaroEventRoleMeta**](TakaroEventRoleMeta.md)                                       |             | [default to undefined]            |
| **country**            | **string**                                                                              |             | [default to undefined]            |
| **city**               | **string**                                                                              |             | [default to undefined]            |
| **longitude**          | **string**                                                                              |             | [default to undefined]            |
| **latitude**           | **string**                                                                              |             | [default to undefined]            |
| **ip**                 | **string**                                                                              |             | [default to undefined]            |
| **amount**             | **number**                                                                              |             | [default to undefined]            |
| **result**             | [**TakaroEventFunctionResult**](TakaroEventFunctionResult.md)                           |             | [default to undefined]            |
| **command**            | [**TakaroEventCommandDetails**](TakaroEventCommandDetails.md)                           |             | [default to undefined]            |
| **missingPermissions** | **Array&lt;string&gt;**                                                                 |             | [default to undefined]            |
| **key**                | **string**                                                                              |             | [default to undefined]            |
| **value**              | **string**                                                                              |             | [optional] [default to undefined] |
| **hook**               | [**TakaroEventHookDetails**](TakaroEventHookDetails.md)                                 |             | [optional] [default to undefined] |
| **cronjob**            | [**TakaroEventCronjobDetails**](TakaroEventCronjobDetails.md)                           |             | [optional] [default to undefined] |
| **status**             | **string**                                                                              |             | [default to undefined]            |
| **details**            | **any**                                                                                 |             | [optional] [default to undefined] |
| **userConfig**         | **string**                                                                              |             | [default to undefined]            |
| **systemConfig**       | **string**                                                                              |             | [default to undefined]            |
| **id**                 | **string**                                                                              |             | [default to undefined]            |
| **listingName**        | **string**                                                                              |             | [default to undefined]            |
| **price**              | **number**                                                                              |             | [default to undefined]            |
| **totalPrice**         | **number**                                                                              |             | [default to undefined]            |
| **items**              | [**Array&lt;TakaroEventShopItem&gt;**](TakaroEventShopItem.md)                          |             | [default to undefined]            |
| **error**              | **string**                                                                              |             | [default to undefined]            |
| **reason**             | **string**                                                                              |             | [optional] [default to undefined] |
| **until**              | **string**                                                                              |             | [optional] [default to undefined] |
| **isGlobal**           | **boolean**                                                                             |             | [default to undefined]            |
| **takaroManaged**      | **boolean**                                                                             |             | [default to undefined]            |

## Example

```typescript
import { EventOutputDTOMeta } from './api';

const instance: EventOutputDTOMeta = {
  player,
  timestamp,
  msg,
  channel,
  recipient,
  attacker,
  position,
  entity,
  weapon,
  author,
  role,
  country,
  city,
  longitude,
  latitude,
  ip,
  amount,
  result,
  command,
  missingPermissions,
  key,
  value,
  hook,
  cronjob,
  status,
  details,
  userConfig,
  systemConfig,
  id,
  listingName,
  price,
  totalPrice,
  items,
  error,
  reason,
  until,
  isGlobal,
  takaroManaged,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
