export const PATHS = {
  home: () => '/',
  login: () => '/login',
  users: () => '/users',
  players: () => '/players',
  moduleDefinitions: () => '/modules',
  variables: () => '/variables',
  notFound: () => '/404',

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
    update: (serverId: string) => `/servers/update/${serverId}`,
  },

  gameServer: {
    dashboard: (serverId: string) => `/server/${serverId}`,
    settings: (serverId: string) => `/server/${serverId}/settings`,
    modules: (serverId: string) => `/server/${serverId}/modules`,
    update: (serverId: string) => `/server/${serverId}/update`,
    moduleInstallations: {
      install: (serverId: string, moduleId: string) => `/server/${serverId}/modules/${moduleId}/install`,
    },
  },

  modules: {
    module: (moduleId: string) => `/modules/${moduleId}`,
    create: () => '/modules/create',
    update: (moduleId: string) => `/modules/update/${moduleId}`,
  },

  studio: {
    module: (moduleId: string) => `/studio/${moduleId}`,
    settings: (moduleId: string) => `/studio/${moduleId}/settings`,
  },
};
