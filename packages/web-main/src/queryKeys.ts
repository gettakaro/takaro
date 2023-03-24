export const QueryKeys = {
  gameserver: {
    list: 'gameserver.list',
    id: (serverId: string) => `gameserver.${serverId}`,
    reachability: (serverId: string) => `gameserver.${serverId}.reachability`,
    modules: {
      list: (serverId: string) => `gameserver.${serverId}.modules.list`,
      id: (serverId: string, moduleId: string) =>
        `gameserver.${serverId}.modules.${moduleId}`,
    },
  },
  modules: {
    list: 'modules.list',
    id: (moduleId: string) => `modules.${moduleId}`,
  },
  users: {
    list: 'users.list',
  },
  players: {
    list: 'players.list',
  },
  settings: 'settings',
};
