export enum PERMISSIONS {
  'ROOT' = 'ROOT',
  'MANAGE_USERS' = 'MANAGE_USERS',
  'READ_USERS' = 'READ_USERS',
  'MANAGE_ROLES' = 'MANAGE_ROLES',
  'READ_ROLES' = 'READ_ROLES',
  'MANAGE_GAMESERVERS' = 'MANAGE_GAMESERVERS',
  'READ_GAMESERVERS' = 'READ_GAMESERVERS',
  'READ_FUNCTIONS' = 'READ_FUNCTIONS',
  'MANAGE_FUNCTIONS' = 'MANAGE_FUNCTIONS',
  'READ_CRONJOBS' = 'READ_CRONJOBS',
  'MANAGE_CRONJOBS' = 'MANAGE_CRONJOBS',
  'READ_HOOKS' = 'READ_HOOKS',
  'MANAGE_HOOKS' = 'MANAGE_HOOKS',
  'READ_COMMANDS' = 'READ_COMMANDS',
  'MANAGE_COMMANDS' = 'MANAGE_COMMANDS',
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
  [PERMISSIONS.READ_FUNCTIONS]: {
    permission: PERMISSIONS.READ_FUNCTIONS,
    friendlyName: 'Read Functions',
    description: 'Can view function details',
  },
  [PERMISSIONS.MANAGE_FUNCTIONS]: {
    permission: PERMISSIONS.MANAGE_FUNCTIONS,
    friendlyName: 'Manage Functions',
    description: 'Can create, update, and delete functions',
  },
  [PERMISSIONS.READ_CRONJOBS]: {
    permission: PERMISSIONS.READ_CRONJOBS,
    friendlyName: 'Read Cron Jobs',
    description: 'Can view cron job details',
  },
  [PERMISSIONS.MANAGE_CRONJOBS]: {
    permission: PERMISSIONS.MANAGE_CRONJOBS,
    friendlyName: 'Manage Cron Jobs',
    description: 'Can create, update, and delete cron jobs',
  },
  [PERMISSIONS.READ_HOOKS]: {
    permission: PERMISSIONS.READ_HOOKS,
    friendlyName: 'Read Hooks',
    description: 'Can view hook details',
  },
  [PERMISSIONS.MANAGE_HOOKS]: {
    permission: PERMISSIONS.MANAGE_HOOKS,
    friendlyName: 'Manage Hooks',
    description: 'Can create, update, and delete hooks',
  },
  [PERMISSIONS.READ_COMMANDS]: {
    permission: PERMISSIONS.READ_COMMANDS,
    friendlyName: 'Read Commands',
    description: 'Can view command details',
  },
  [PERMISSIONS.MANAGE_COMMANDS]: {
    permission: PERMISSIONS.MANAGE_COMMANDS,
    friendlyName: 'Manage Commands',
    description: 'Can create, update, and delete commands',
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
};
