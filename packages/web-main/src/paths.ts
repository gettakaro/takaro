export const PATHS = {
  home: '/',
  login: '/login',
  settings: '/settings',
  settingsGameserver: '/settings/:serverId',
  gameServers: {
    dashboard: '/gameservers/:serverId',
    overview: '/servers',
    create: '/servers/create',
    update: '/servers/update/:serverId',
  },
  players: '/players',
  modules: '/modules',
  studio: {
    module: '/studio/:moduleId',
  },
  users: '/users',
  profile: '/profile',
};
