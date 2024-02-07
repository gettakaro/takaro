import { lazy } from 'react';
import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';

import { AuthenticationGuard } from 'components/routes/AuthenticationGuard';
import { PermissionsGuard } from 'components/routes/PermissionsGuard';
import { FrameLayoutRoute } from 'components/routes/LayoutRoute';

import Dashboard from 'pages/Dashboard';
import GameServers from 'pages/GameServers';
import Players from 'pages/Players';

import { ModuleDefinitions } from 'pages/ModuleDefinitions';
import { CreateGameServer } from 'pages/gameserverOverview/CreateGameServer';
import { UpdateGameServer } from 'pages/gameserverOverview/UpdateGameServer';

import { GlobalGameServerSettings } from './pages/settings/GlobalGameServerSettings';
import { DiscordSettings } from './pages/settings/DiscordSettings';
import CreateModule from 'pages/ModuleDefinitions/CreateModule';
import EditModule from 'pages/ModuleDefinitions/EditModule';
import ViewModule from 'pages/ModuleDefinitions/ViewModule';
import { InstallModule } from 'pages/gameserver/modules/InstallModule';
import GameServerSettings from 'pages/gameserver/GameServerSettings';
import GameServerModules from 'pages/gameserver/GameServerModules';
import { Recovery } from 'pages/auth/recovery';
import { AuthSettings } from 'pages/auth/profile';
import { AuthVerification } from 'pages/auth/verification';
import Users from 'pages/Users';
import Variables from 'pages/Variables';
import { Events } from 'pages/events';

import { Roles } from './pages/roles';
import { ViewRole } from './pages/roles/ViewRole';
import { CreateRole } from './pages/roles/CreateRole';
import { UpdateRole } from './pages/roles/UpdateRole';

import { PlayerGlobalProfile } from 'pages/player/global';
import { AssignPlayerRole } from 'pages/roles/assignPlayerRole';
import { UserProfile } from 'pages/users/profile';
import { AssignUserRole } from 'pages/roles/assignUserRole';
import { PERMISSIONS } from '@takaro/apiclient';
import Forbidden from 'pages/Forbidden';
import { LogOut } from 'pages/LogOut';
import { LogoutSuccess } from 'pages/LogoutSuccess';
import { VariablesCreate, VariablesUpdate } from 'pages/variables/VariableCreateAndUpdate';
import { ImportGameServer } from 'pages/gameserver/ImportGameServer';
import GameServerOverview from 'pages/gameserver/dashboards/GameServerOverview';
import GameServerConsole from 'pages/gameserver/dashboards/GameServerConsole';
import GameServerStatistics from 'pages/gameserver/dashboards/GameServerStatistics';
import { PlayerInventory } from 'pages/player/gameserver/PlayerInventory';
import { PlayerEvents } from 'pages/player/gameserver/PlayerEvents';
import { PlayerEconomy } from 'pages/player/gameserver/PlayerEconomy';

// Lazy load pages
const LogIn = lazy(() => import('./pages/LogIn'));
const Studio = lazy(() => import('./pages/studio'));
const NotFound = lazy(() => import('./pages/NotFound'));

// eventually we probably want to use react query in combination with the new data api
// - source: https://www.youtube.com/watch?v=95B8mnhzoCM
// - source: https://tkdodo.eu/blog/react-query-meets-react-router

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);

export const router = sentryCreateBrowserRouter(
  createRoutesFromElements(
    <>
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
            <Route element={<FrameLayoutRoute frame="gameServerDashboard" />}>
              <Route element={<GameServerOverview />} path={PATHS.gameServer.dashboard.overview(':serverId')} />
              <Route element={<GameServerConsole />} path={PATHS.gameServer.dashboard.console(':serverId')} />
              <Route element={<GameServerStatistics />} path={PATHS.gameServer.dashboard.statistics(':serverId')} />
            </Route>
          </Route>

          <Route
            element={<PermissionsGuard permissions={[PERMISSIONS.ReadGameservers, PERMISSIONS.ManageGameservers]} />}
          >
            <Route element={<GameServerSettings />} path={PATHS.gameServer.settings(':serverId')} />
          </Route>

          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadGameservers, PERMISSIONS.ReadModules]} />}>
            <Route element={<GameServerModules />} path={PATHS.gameServer.modules(':serverId')} />
            <Route
              element={<InstallModule readOnly />}
              path={PATHS.gameServer.moduleInstallations.view(':serverId', ':moduleId')}
            />
            <Route element={<PermissionsGuard permissions={[PERMISSIONS.ManageModules]} />}>
              <Route
                element={<InstallModule />}
                path={PATHS.gameServer.moduleInstallations.install(':serverId', ':moduleId')}
              />
            </Route>
          </Route>

          {/* ======================== GameServers ======================== */}
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadGameservers]} />}>
            <Route element={<GameServers />} path={PATHS.gameServers.overview()}>
              <Route element={<PermissionsGuard permissions={[PERMISSIONS.ManageGameservers]} />}>
                <Route element={<CreateGameServer />} path={PATHS.gameServers.create()} />
                <Route element={<ImportGameServer />} path={PATHS.gameServers.import()} />
                <Route element={<UpdateGameServer />} path={PATHS.gameServers.update(':serverId')} />
              </Route>
            </Route>
          </Route>

          {/* ======================== PLayer ======================== */}
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadPlayers]} />}>
            <Route element={<Players />} path={PATHS.players()} />
            <Route element={<FrameLayoutRoute frame="playerProfile" />}>
              <Route element={<PlayerGlobalProfile />} path={PATHS.player.global.profile(':playerId')}>
                <Route element={<PermissionsGuard permissions={[PERMISSIONS.ManagePlayers]} />}>
                  <Route element={<AssignPlayerRole />} path={PATHS.player.global.assignRole(':playerId')} />
                </Route>
              </Route>
              <Route element={<PlayerInventory />} path={PATHS.player.inventory(':playerId')} />
              <Route element={<PlayerEvents />} path={PATHS.player.events(':playerId')} />
              <Route element={<PlayerEconomy />} path={PATHS.player.economy(':playerId')} />
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
              <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadModules]} />}>
                <Route element={<ViewModule />} path={PATHS.modules.view(':moduleId')} />
              </Route>
              <Route element={<PermissionsGuard permissions={[PERMISSIONS.ManageModules]} />}>
                <Route element={<EditModule />} path={PATHS.modules.update(':moduleId')} />
                <Route element={<CreateModule />} path={PATHS.modules.create()} />
              </Route>
            </Route>
          </Route>

          {/* ======================== Roles ======================== */}
          <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadRoles]} />}>
            <Route element={<Roles />} path={PATHS.roles.overview()}>
              <Route element={<PermissionsGuard permissions={[PERMISSIONS.ReadRoles]} />}>
                <Route element={<ViewRole />} path={PATHS.roles.view(':roleId')} />
              </Route>
              <Route element={<PermissionsGuard permissions={[PERMISSIONS.ManageRoles]} />}>
                <Route element={<CreateRole />} path={PATHS.roles.create()} />
                <Route element={<UpdateRole />} path={PATHS.roles.update(':roleId')} />
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
    </>
  )
);
