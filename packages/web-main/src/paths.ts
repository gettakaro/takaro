export const PATHS = {
  home: () => '/',
  login: () => '/login',
  users: () => '/users',
  players: () => '/players',
  moduleDefinitions: () => '/modules',
  variables: {
    overview: () => '/variables',
    create: () => '/variables/create',
    update: (variableId: string) => `/variables/update/${variableId}`,
  },
  notFound: () => '/not-found',
  forbidden: () => '/forbidden',
  logout: () => '/logout',
  logoutReturn: () => '/logout-return',
  events: () => '/events',

  roles: {
    overview: () => '/roles',
    create: () => '/roles/create',
    view: (roleId: string) => `/roles/view/${roleId}`,
    update: (roleId: string) => `/roles/update/${roleId}`,
  },
  auth: {
    recovery: () => '/auth/recovery',
    profile: () => '/auth/profile',
    verification: () => '/auth/verification',
  },

  settings: {
    overview: () => '/settings',
    GameServerSettings: () => '/settings/gameservers',
    discordSettings: () => '/settings/discord',
  },

  gameServers: {
    overview: () => '/servers',
    create: () => '/servers/create',
    import: () => '/servers/import',
    update: (serverId: string) => `/servers/update/${serverId}`,
  },

  gameServer: {
    dashboard: {
      overview: (serverId: string) => `/server/dashboard/${serverId}/overview`,
      console: (serverId: string) => `/server/dashboard/${serverId}/console`,
      statistics: (serverId: string) => `/server/dashboard/${serverId}/statistics`,
    },
    settings: (serverId: string) => `/server/${serverId}/settings`,
    modules: (serverId: string) => `/server/${serverId}/modules`,
    update: (serverId: string) => `/server/${serverId}/update`,
    moduleInstallations: {
      install: (serverId: string, moduleId: string) => `/server/${serverId}/modules/${moduleId}/install`,
      view: (serverId: string, moduleId: string) => `/server/${serverId}/modules/${moduleId}/view`,
    },
  },

  modules: {
    module: (moduleId: string) => `/modules/${moduleId}`,
    create: () => '/modules/create',
    update: (moduleId: string) => `/modules/update/${moduleId}`,
    view: (moduleId: string) => `modules/view/${moduleId}`,
  },

  studio: {
    module: (moduleId: string) => `/studio/${moduleId}`,
    settings: (moduleId: string) => `/studio/${moduleId}/settings`,
  },

  player: {
    global: {
      profile: (playerId: string) => `/players/${playerId}/global`,
      assignRole: (playerId: string) => `/players/${playerId}/global/assign-role`,
    },
    inventory: (playerId: string) => `/players/${playerId}/inventory`,
    events: (playerId: string) => `/players/${playerId}/events`,
    economy: (playerId: string) => `/players/${playerId}/economy`,
  },

  user: {
    profile: (userId: string) => `/users/${userId}`,
    assignRole: (userId: string) => `/users/${userId}/assign-role`,
  },
};
