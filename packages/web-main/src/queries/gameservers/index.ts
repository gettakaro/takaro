export {
  gameServerKeys,

  // queries
  gameServerOptions,
  gameServersOptions,
  gameServerReachabilityOptions,
  gameServerModuleInstallationOptions,
  gameServerModuleInstallationsOptions,

  // mutations
  useGameServerRemove,
  useGameServerCreate,
  useGameServerCreateFromCSMMImport,
  useGameServerUpdate,
  useGameServerSendMessage,
  // modules
  useGameServerModuleInstall,
  useGameServerModuleUninstall,
  useGameServerReachabilityByConfig,
  useBanPlayerOnGameServer,
  useUnbanPlayerOnGameServer,
  useKickPlayerOnGameServer,
} from './queries';
