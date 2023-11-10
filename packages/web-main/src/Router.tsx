import { FC, lazy } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

import Dashboard from 'pages/Dashboard';
import { PATHS } from 'paths';
import { AuthenticatedRoute } from 'components/AuthenticatedRoute';

import GameServers from 'pages/GameServers';
import Players from 'pages/Players';
import { ModuleDefinitions } from 'pages/ModuleDefinitions';
import { withSentryReactRouterV6Routing } from '@sentry/react';
import GameServerCreate from 'pages/CreateUpdateGameServer/GameServerCreate';
import GameServerUpdate from 'pages/CreateUpdateGameServer/GameServerUpdate';

import { SettingsFrame } from './frames/SettingsFrame';
import { GlobalGameServerSettings } from './pages/settings/GlobalGameServerSettings';
import { DiscordSettings } from './pages/settings/DiscordSettings';
import CreateModule from 'pages/ModuleDefinitions/CreateModule';
import EditModule from 'pages/ModuleDefinitions/EditModule';
import InstallModule from 'pages/gameserver/modules/InstallModuleForm';
import GameServerDashboard from 'pages/gameserver/GameServerDashboard';
import GameServerSettings from 'pages/gameserver/GameServerSettings';
import GameServerModules from 'pages/gameserver/GameServerModules';
import { Recovery } from 'pages/auth/recovery';
import { AuthSettings } from 'pages/auth/profile';
import { AuthVerification } from 'pages/auth/verification';
import Users from 'pages/Users';
import Variables from 'pages/Variables';
import { Events } from 'pages/events';

import { Roles } from './pages/roles';
import { RolesCreate } from './pages/roles/RolesCreate';
import { RolesUpdate } from './pages/roles/RolesUpdate';
import { PlayerProfile } from 'pages/player/profile';
import { AssignPlayerRole } from 'pages/roles/assignPlayerRole';
import { UserProfile } from 'pages/users/profile';
import { AssignUserRole } from 'pages/roles/assignUserRole';

const SentryRoutes = withSentryReactRouterV6Routing(Routes);

// Lazy load pages
const LogIn = lazy(() => import('./pages/LogIn'));
const Studio = lazy(() => import('./pages/studio'));
// const GameServerDashboard = lazy(
//   () => import('./pages/gameserver/GameServerDashboard')
// );
// const GameServerSettings = lazy(
//   () => import('./pages/gameserver/GameServerSettings')
// );
//
// const GameServerModules = lazy(
//   () => import('./pages/gameserver/GameServerModules')
// );
const NotFound = lazy(() => import('./pages/NotFound'));

// eventually we probably want to use react query in combination with the new data api
// - source: https://www.youtube.com/watch?v=95B8mnhzoCM
// - source: https://tkdodo.eu/blog/react-query-meets-react-router

export const Router: FC = () => (
  <BrowserRouter>
    <SentryRoutes>
      {/* ======================== Global ======================== */}
      <Route element={<AuthenticatedRoute frame="global" />} path={PATHS.home()}>
        {/* ======================== Game Server ======================== */}
        <Route element={<GameServerDashboard />} path={PATHS.gameServer.dashboard(':serverId')} />
        <Route element={<GameServerSettings />} path={PATHS.gameServer.settings(':serverId')} />
        <Route element={<GameServerModules />} path={PATHS.gameServer.modules(':serverId')}>
          <Route
            element={<InstallModule />}
            path={PATHS.gameServer.moduleInstallations.install(':serverId', ':moduleId')}
          />
        </Route>

        {/* ======================== Domain ======================== */}
        <Route element={<Dashboard />} path={PATHS.home()} />
        <Route element={<AuthSettings />} path={PATHS.auth.profile()} />
        <Route element={<AuthVerification />} path={PATHS.auth.verification()} />

        {/* ======================== Settings ======================== */}
        <Route element={<SettingsFrame />}>
          <Route element={<GlobalGameServerSettings />} path={PATHS.settings.overview()} />
          <Route element={<GlobalGameServerSettings />} path={PATHS.settings.GameServerSettings()} />
          <Route element={<DiscordSettings />} path={PATHS.settings.discordSettings()} />
        </Route>

        <Route element={<PlayerProfile />} path={PATHS.player.profile(':playerId')}>
          <Route element={<AssignPlayerRole />} path={PATHS.player.assignRole(':playerId')} />
        </Route>

        <Route element={<GameServers />} path="/server/" />
        <Route element={<Users />} path={PATHS.users()} />

        <Route element={<UserProfile />} path={PATHS.user.profile(':userId')}>
          <Route element={<AssignUserRole />} path={PATHS.user.assignRole(':userId')} />
        </Route>

        <Route element={<Variables />} path={PATHS.variables()} />

        {/* ======================== CRUD Game Servers ======================== */}
        <Route element={<GameServers />} path={PATHS.gameServers.overview()}>
          <Route element={<GameServerCreate />} path={PATHS.gameServers.create()} />
          <Route element={<GameServerUpdate />} path={PATHS.gameServers.update(':serverId')} />
        </Route>

        <Route element={<Events />} path={PATHS.events()} />
        <Route element={<Players />} path={PATHS.players()} />
        {/* ======================== CRUD Modules ======================== */}
        <Route element={<ModuleDefinitions />} path={PATHS.moduleDefinitions()}>
          <Route element={<EditModule />} path={PATHS.modules.update(':moduleId')} />
          <Route element={<CreateModule />} path={PATHS.modules.create()} />
        </Route>

        {/* ======================== CRUD Roles ======================== */}
        <Route element={<Roles />} path={PATHS.roles.overview()}>
          <Route element={<RolesCreate />} path={PATHS.roles.create()} />
          <Route element={<RolesUpdate />} path={PATHS.roles.update(':roleId')} />
        </Route>
      </Route>

      {/* ======================== Studio ======================== */}
      <Route element={<AuthenticatedRoute frame="studio" />}>
        <Route element={<Studio />} path={PATHS.studio.module(':moduleId')} />
      </Route>
      <Route element={<LogIn />} path={PATHS.login()} />
      <Route element={<Recovery />} path={PATHS.auth.recovery()} />

      <Route element={<NotFound />} path="/404" />

      {/* Page not found matches with everything => should stay at bottom */}
      <Route element={<NotFound />} path="*" />
    </SentryRoutes>
  </BrowserRouter>
);
