export enum PERMISSIONS {
  'ROOT' = 'ROOT',
  'MANAGE_USERS' = 'MANAGE_USERS',
  'READ_USERS' = 'READ_USERS',
  'MANAGE_ROLES' = 'MANAGE_ROLES',
  'READ_ROLES' = 'READ_ROLES',
  'MANAGE_GAMESERVERS' = 'MANAGE_GAMESERVERS',
  'READ_GAMESERVERS' = 'READ_GAMESERVERS',
  'READ_MODULES' = 'READ_MODULES',
  'MANAGE_MODULES' = 'MANAGE_MODULES',
  'READ_PLAYERS' = 'READ_PLAYERS',
  'MANAGE_PLAYERS' = 'MANAGE_PLAYERS',
  'MANAGE_SETTINGS' = 'MANAGE_SETTINGS',
  'READ_SETTINGS' = 'READ_SETTINGS',
  'READ_VARIABLES' = 'READ_VARIABLES',
  'MANAGE_VARIABLES' = 'MANAGE_VARIABLES',
  'READ_EVENTS' = 'READ_EVENTS',
  'MANAGE_EVENTS' = 'MANAGE_EVENTS',
  'READ_ITEMS' = 'READ_ITEMS',
  'MANAGE_ITEMS' = 'MANAGE_ITEMS',
  'MANAGE_SHOP_LISTINGS' = 'MANAGE_SHOP_LISTINGS',
  'MANAGE_SHOP_ORDERS' = 'MANAGE_SHOP_ORDERS',
}

export interface IPermissionDetails {
  permission: string;
  friendlyName: string;
  description: string;
}

export const PERMISSION_DETAILS: Record<PERMISSIONS, IPermissionDetails> = {
  [PERMISSIONS.ROOT]: {
    permission: PERMISSIONS.ROOT,
    friendlyName: 'Root Access',
    description: 'Full access to all systems and resources',
  },
  [PERMISSIONS.MANAGE_USERS]: {
    permission: PERMISSIONS.MANAGE_USERS,
    friendlyName: 'Manage Users',
    description: 'Can create, update, and delete users',
  },
  [PERMISSIONS.READ_USERS]: {
    permission: PERMISSIONS.READ_USERS,
    friendlyName: 'Read Users',
    description: 'Can view user details',
  },
  [PERMISSIONS.MANAGE_ROLES]: {
    permission: PERMISSIONS.MANAGE_ROLES,
    friendlyName: 'Manage Roles',
    description: 'Can create, update, and delete roles',
  },
  [PERMISSIONS.READ_ROLES]: {
    permission: PERMISSIONS.READ_ROLES,
    friendlyName: 'Read Roles',
    description: 'Can view role details',
  },
  [PERMISSIONS.MANAGE_GAMESERVERS]: {
    permission: PERMISSIONS.MANAGE_GAMESERVERS,
    friendlyName: 'Manage Game Servers',
    description: 'Can create, update, and delete game servers',
  },
  [PERMISSIONS.READ_GAMESERVERS]: {
    permission: PERMISSIONS.READ_GAMESERVERS,
    friendlyName: 'Read Game Servers',
    description: 'Can view game server details',
  },
  [PERMISSIONS.READ_MODULES]: {
    permission: PERMISSIONS.READ_MODULES,
    friendlyName: 'Read Modules',
    description: 'Can view module details',
  },
  [PERMISSIONS.MANAGE_MODULES]: {
    permission: PERMISSIONS.MANAGE_MODULES,
    friendlyName: 'Manage Modules',
    description: 'Can create, update, and delete modules',
  },
  [PERMISSIONS.READ_PLAYERS]: {
    permission: PERMISSIONS.READ_PLAYERS,
    friendlyName: 'Read Players',
    description: 'Can view player details',
  },
  [PERMISSIONS.MANAGE_PLAYERS]: {
    permission: PERMISSIONS.MANAGE_PLAYERS,
    friendlyName: 'Manage Players',
    description: 'Can create, update, and delete players',
  },
  [PERMISSIONS.MANAGE_SETTINGS]: {
    permission: PERMISSIONS.MANAGE_SETTINGS,
    friendlyName: 'Manage Settings',
    description: 'Can modify settings',
  },
  [PERMISSIONS.READ_SETTINGS]: {
    permission: PERMISSIONS.READ_SETTINGS,
    friendlyName: 'Read Settings',
    description: 'Can view settings',
  },
  [PERMISSIONS.READ_VARIABLES]: {
    permission: PERMISSIONS.READ_VARIABLES,
    friendlyName: 'Read Variables',
    description: 'Can view variables',
  },
  [PERMISSIONS.MANAGE_VARIABLES]: {
    permission: PERMISSIONS.MANAGE_VARIABLES,
    friendlyName: 'Manage Variables',
    description: 'Can create, update, and delete variables',
  },
  [PERMISSIONS.READ_EVENTS]: {
    permission: PERMISSIONS.READ_EVENTS,
    friendlyName: 'Read Events',
    description: 'Can view event details',
  },
  [PERMISSIONS.MANAGE_EVENTS]: {
    permission: PERMISSIONS.MANAGE_EVENTS,
    friendlyName: 'Manage Events',
    description: 'Can create, update, and delete events',
  },
  [PERMISSIONS.READ_ITEMS]: {
    permission: PERMISSIONS.READ_ITEMS,
    friendlyName: 'Read Items',
    description: 'Can view item details',
  },
  [PERMISSIONS.MANAGE_ITEMS]: {
    permission: PERMISSIONS.MANAGE_ITEMS,
    friendlyName: 'Manage Items',
    description: 'Can create, update, and delete items',
  },
  [PERMISSIONS.MANAGE_SHOP_LISTINGS]: {
    permission: PERMISSIONS.MANAGE_SHOP_LISTINGS,
    friendlyName: 'Manage Shop Listings',
    description: 'Can create, update, and delete shop listings',
  },
  [PERMISSIONS.MANAGE_SHOP_ORDERS]: {
    permission: PERMISSIONS.MANAGE_SHOP_ORDERS,
    friendlyName: 'Manage Shop Orders',
    description: 'Can view orders not belonging to the themself and perform administrative actions on them',
  },
};
