export const PATHS = {
  home: '/',
  login: '/login',
  settings: '/settings',
  settingsGameserver: '/settings/:serverId',
  gameServers: {
    dashboard: '/servers/:serverId',
    overview: '/servers',
    create: '/servers/create',
    update: '/servers/update/:serverId',
  },
  players: '/players',
  modules: {
    overview: '/modules',
  },
  studio: {
    module: '/studio/:moduleId',
    settings: '/studio/:moduleId/settings',
  },
  users: '/users',
  profile: '/profile',
};
