export const PATHS = {
  home: () => '/',
  login: () => '/login',
  users: () => '/users',
  profile: () => '/profile',
  players: () => '/players',
  settings: () => '/settings',
  gameServers: () => '/servers',
  moduleDefinitions: () => '/modules',

  gameServer: {
    dashboard: (serverId: string) => `/server/${serverId}`,
    settings: (serverId: string) => `/server/${serverId}/settings`,
    modules: (serverId: string) => `/server/${serverId}/modules`,
  },

  modules: {
    module: (moduleId: string) => `/modules/${moduleId}`,
  },

  studio: {
    module: (moduleId: string) => `/studio/${moduleId}`,
    settings: (moduleId: string) => `/studio/${moduleId}/settings`,
  },
};
