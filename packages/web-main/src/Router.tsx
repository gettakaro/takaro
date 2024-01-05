import { FC, lazy } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

import Dashboard from 'pages/Dashboard';
import { PATHS } from 'paths';
import { AuthenticationGuard } from 'components/routes/AuthenticationGuard';
import { PermissionsGuard } from 'components/routes/PermissionsGuard';
import { FrameLayoutRoute } from 'components/routes/LayoutRoute';

import GameServers from 'pages/GameServers';
import Players from 'pages/Players';
import { ModuleDefinitions } from 'pages/ModuleDefinitions';
import { withSentryReactRouterV6Routing } from '@sentry/react';
import GameServerCreate from 'pages/CreateUpdateGameServer/GameServerCreate';
import GameServerUpdate from 'pages/CreateUpdateGameServer/GameServerUpdate';

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
import { PERMISSIONS } from '@takaro/apiclient';
import Forbidden from 'pages/Forbidden';
import { LogOut } from 'pages/LogOut';
import { LogoutSuccess } from 'pages/LogoutSuccess';
import { VariablesCreate, VariablesUpdate } from 'pages/variables/VariableCreateAndUpdate';
import { ImportGameServer } from 'pages/gameserver/ImportGameServer';

const SentryRoutes = withSentryReactRouterV6Routing(Routes);

// Lazy load pages
const LogIn = lazy(() => import('./pages/LogIn'));
const Studio = lazy(() => import('./pages/studio'));
const NotFound = lazy(() => import('./pages/NotFound'));

// eventually we probably want to use react query in combination with the new data api
// - source: https://www.youtube.com/watch?v=95B8mnhzoCM
// - source: https://tkdodo.eu/blog/react-query-meets-react-router

export const Router: FC = () => (
  <BrowserRouter>
    <SentryRoutes>
      {/* ======================== Global ======================== */}
      <Route element={<AuthenticationGuard />} path={PATHS.home()}>
        <Route element={<FrameLayoutRoute frame="global" />}>
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadGameservers]} />}>
            <Route element={<Dashboard />} path={PATHS.home()} />
          </Route>

          <Route element={<AuthSettings />} path={PATHS.auth.profile()} />
          <Route element={<AuthVerification />} path={PATHS.auth.verification()} />

          {/* ======================== Game Server ======================== */}

          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadGameservers]} />}>
            <Route element={<GameServerDashboard />} path={PATHS.gameServer.dashboard(':serverId')} />
          </Route>

          <Route
            element={<PermissionsGuard permissions={[PERMISSIONS.ReadGameservers, PERMISSIONS.ManageGameservers]} />}
          >
            <Route element={<GameServerSettings />} path={PATHS.gameServer.settings(':serverId')} />
          </Route>

          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadGameservers, PERMISSIONS.ReadModules]} />}>
            <Route element={<GameServerModules />} path={PATHS.gameServer.modules(':serverId')} />
            <Route
              element={<InstallModule />}
              path={PATHS.gameServer.moduleInstallations.install(':serverId', ':moduleId')}
            />
          </Route>

          {/* ======================== GameServers ======================== */}
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadGameservers]} />}>
            <Route element={<GameServers />} path={PATHS.gameServers.overview()}>
              <Route element={<PermissionsGuard permissions={[PERMISSIONS.ManageGameservers]} />}>
                <Route element={<GameServerCreate />} path={PATHS.gameServers.create()} />
                <Route element={<ImportGameServer />} path={PATHS.gameServers.import()} />
                <Route element={<GameServerUpdate />} path={PATHS.gameServers.update(':serverId')} />
              </Route>
            </Route>
          </Route>

          {/* ======================== PLayer ======================== */}
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadPlayers]} />}>
            <Route element={<Players />} path={PATHS.players()} />
            <Route element={<PlayerProfile />} path={PATHS.player.profile(':playerId')}>
              <Route element={<PermissionsGuard permissions={[PERMISSIONS.ManagePlayers]} />}>
                <Route element={<AssignPlayerRole />} path={PATHS.player.assignRole(':playerId')} />
              </Route>
            </Route>
          </Route>

          {/* ======================== User ======================== */}
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadUsers]} />}>
            <Route element={<Users />} path={PATHS.users()} />
            <Route element={<UserProfile />} path={PATHS.user.profile(':userId')}>
              <Route element={<PermissionsGuard permissions={[PERMISSIONS.ManageUsers]} />}>
                <Route element={<AssignUserRole />} path={PATHS.user.assignRole(':userId')} />
              </Route>
            </Route>
          </Route>

          {/* ======================== Settings ======================== */}
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadSettings]} />}>
            <Route element={<FrameLayoutRoute frame="settings" />}>
              <Route element={<GlobalGameServerSettings />} path={PATHS.settings.overview()} />
              <Route element={<GlobalGameServerSettings />} path={PATHS.settings.GameServerSettings()} />
              <Route element={<DiscordSettings />} path={PATHS.settings.discordSettings()} />
            </Route>
          </Route>

          {/* ======================== Variables ======================== */}
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadVariables]} />}>
            <Route element={<Variables />} path={PATHS.variables.overview()} />
          </Route>
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ManageVariables]} />}>
            <Route element={<VariablesCreate />} path={PATHS.variables.create()} />
            <Route element={<VariablesUpdate />} path={PATHS.variables.update(':variableId')} />
          </Route>

          {/* ======================== Events ======================== */}
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadEvents]} />}>
            <Route element={<Events />} path={PATHS.events()} />
          </Route>

          {/* ======================== Modules ======================== */}
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadModules]} />}>
            <Route element={<ModuleDefinitions />} path={PATHS.moduleDefinitions()}>
              <Route element={<PermissionsGuard permissions={[PERMISSIONS.ManageModules]} />}>
                <Route element={<EditModule />} path={PATHS.modules.update(':moduleId')} />
                <Route element={<CreateModule />} path={PATHS.modules.create()} />
              </Route>
            </Route>
          </Route>

          {/* ======================== Roles ======================== */}
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadRoles]} />}>
            <Route element={<Roles />} path={PATHS.roles.overview()}>
              <Route element={<PermissionsGuard permissions={[PERMISSIONS.ManageRoles]} />}>
                <Route element={<RolesCreate />} path={PATHS.roles.create()} />
                <Route element={<RolesUpdate />} path={PATHS.roles.update(':roleId')} />
              </Route>
            </Route>
          </Route>
        </Route>

        {/* ======================== Studio ======================== */}
        <Route element={<FrameLayoutRoute frame="studio" />}>
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadModules, PERMISSIONS.ManageModules]} />}>
            <Route element={<Studio />} path={PATHS.studio.module(':moduleId')} />
          </Route>
        </Route>
      </Route>

      <Route element={<LogIn />} path={PATHS.login()} />

      {/* Although this is an authenticated route, we cannot add it to the authenticationGuard. 
        because the authentication guard redirects to the login page when no session is found.
        But when logging out via a route, there is race between the session being removed and the actual logout on the backend.
       */}
      <Route element={<LogOut />} path={PATHS.logout()} />
      <Route element={<LogoutSuccess />} path={PATHS.logoutReturn()} />
      <Route element={<Recovery />} path={PATHS.auth.recovery()} />
      <Route element={<NotFound />} path={PATHS.notFound()} />
      <Route element={<Forbidden />} path={PATHS.forbidden()} />

      {/* Page not found matches with everything => should stay at bottom */}
      <Route element={<NotFound />} path="*" />
    </SentryRoutes>
  </BrowserRouter>
);
