import { EventOutputDTOEventNameEnum as e } from '@takaro/apiclient';

export const categorizedEventNames = [
  {
    category: 'Module',
    events: [
      e.ModuleCreated,
      e.ModuleUpdated,
      e.ModuleDeleted,
      e.ModuleInstalled,
      e.ModuleUninstalled,
      e.CronjobExecuted,
      e.HookExecuted,
      e.CommandExecuted,
    ],
  },
  {
    category: 'Player',
    events: [
      e.PlayerCreated,
      e.PlayerConnected,
      e.PlayerDisconnected,
      e.PlayerNewIpDetected,
      e.PlayerDeath,
      e.PlayerLinked,
    ],
  },
  {
    category: 'Game Server',
    events: [
      e.GameserverCreated,
      e.GameserverUpdated,
      e.GameserverDeleted,
      e.PlayerConnected,
      e.PlayerDisconnected,
      e.ChatMessage,
      e.EntityKilled,
      e.PlayerNewIpDetected,
      e.ServerStatusChanged,
      e.RateLimitExceeded,
    ],
  },
  {
    category: 'Economy',
    events: [
      e.CurrencyAdded,
      e.CurrencyDeducted,
      e.ShopOrderCreated,
      e.ShopOrderStatusChanged,
      e.ShopListingCreated,
      e.ShopListingUpdated,
      e.ShopListingDeleted,
    ],
  },
  {
    category: 'Role',
    events: [e.RoleAssigned, e.RoleRemoved, e.RoleCreated, e.RoleUpdated, e.RoleDeleted],
  },
  {
    Category: 'Other',
    events: [e.SettingsSet],
  },
];
