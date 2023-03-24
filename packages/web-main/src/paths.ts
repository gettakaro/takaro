export const PATHS = {
  home: () => '/',
  login: () => '/login',
  users: () => '/users',
  profile: () => '/profile',
  players: () => '/players',
  settings: () => '/settings',
  moduleDefinitions: () => '/modules',

  gameServers: {
    overview: () => '/servers',
    create: () => `/servers/create`,
    update: (serverId: string) => `/servers/update/${serverId}`,
  },

  gameServer: {
    dashboard: (serverId: string) => `/server/${serverId}`,
    settings: (serverId: string) => `/server/${serverId}/settings`,
    modules: (serverId: string) => `/server/${serverId}/modules`,
    update: (serverId: string) => `/server/${serverId}/update`,
  },

  modules: {
    module: (moduleId: string) => `/modules/${moduleId}`,
  },

  studio: {
    module: (moduleId: string) => `/studio/${moduleId}`,
    settings: (moduleId: string) => `/studio/${moduleId}/settings`,
  },
};
