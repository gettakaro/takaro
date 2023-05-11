import { lazy } from 'react';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import Dashboard from 'pages/Dashboard';
import { PATHS } from 'paths';
import { AuthenticatedRoute } from 'components/AuthenticatedRoute';

import GameServers from 'pages/GameServers';
import Players from 'pages/Players';
import { ModuleDefinitions } from 'pages/ModuleDefinitions';
import { wrapCreateBrowserRouter } from '@sentry/react';
import GameServerCreate from 'pages/CreateUpdateGameServer/GameServerCreate';
import GameServerUpdate from 'pages/CreateUpdateGameServer/GameServerUpdate';

import { SettingsFrame } from './frames/SettingsFrame';
import { GlobalGameServerSettings } from './pages/settings/GlobalGameServerSettings';
import { ConnectionSettings } from './pages/settings/ConnectionSettings';
import CreateModule from 'pages/ModuleDefinitions/CreateModule';

const sentryCreateBrowserRouter = wrapCreateBrowserRouter(createBrowserRouter);

// Lazy load pages
const LogIn = lazy(() => import('./pages/LogIn'));
const Studio = lazy(() => import('./pages/studio'));
const GameServerDashboard = lazy(
  () => import('./pages/gameserver/GameServerDashboard')
);
const GameServerSettings = lazy(
  () => import('./pages/gameserver/GameServerSettings')
);

const GameServerModules = lazy(
  () => import('./pages/gameserver/GameServerModules')
);
const NotFound = lazy(() => import('./pages/NotFound'));

// eventually we probably want to use react query in combination with the new data api
// - source: https://www.youtube.com/watch?v=95B8mnhzoCM
// - source: https://tkdodo.eu/blog/react-query-meets-react-router

export const router = sentryCreateBrowserRouter(
  createRoutesFromElements(
    <>
      {/* ======================== Global ======================== */}
      <Route
        element={<AuthenticatedRoute frame="global" />}
        path={PATHS.home()}
      >
        <Route element={<Dashboard />} path={PATHS.home()} />
        <Route element={<SettingsFrame />}>
          <Route
            element={<GlobalGameServerSettings />}
            path={PATHS.settings.GameServerSettings}
          />
          <Route
            element={<ConnectionSettings />}
            path={PATHS.settings.connections}
          />
        </Route>
        <Route element={<GameServers />} path="/server/" />

        <Route element={<GameServers />} path={PATHS.gameServers.overview()}>
          <Route
            element={<GameServerCreate />}
            path={PATHS.gameServers.create()}
          />
          <Route
            element={<GameServerUpdate />}
            path={PATHS.gameServers.update(':serverId')}
          />
        </Route>
        <Route element={<Players />} path={PATHS.players()} />
        <Route
          element={<ModuleDefinitions />}
          path={PATHS.moduleDefinitions()}
        />
        <Route element={<CreateModule />} path={PATHS.modules.create()} />
      </Route>

      {/* TODO: fix path, frame should be aware of /servers/serverId */}
      {/* ======================== Game Server ======================== */}
      <Route
        element={<AuthenticatedRoute frame="gameserver" />}
        path="/server/:serverId"
      >
        <Route
          element={<GameServerDashboard />}
          path={PATHS.gameServer.dashboard(':serverId')}
        />
        <Route
          element={<GameServerSettings />}
          path={PATHS.gameServer.settings(':serverId')}
        />
        <Route
          element={<GameServerModules />}
          path={PATHS.gameServer.modules(':serverId')}
        />
      </Route>

      {/* ======================== Studio ======================== */}
      <Route element={<AuthenticatedRoute frame="studio" />}>
        <Route element={<Studio />} path={PATHS.studio.module(':moduleId')} />
      </Route>
      <Route element={<LogIn />} path={PATHS.login()} />

      {/* Page not found matches with everything => should stay at bottom */}
      <Route element={<NotFound />} path="*" />
    </>
  )
);
