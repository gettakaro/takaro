import { FC, lazy, Suspense } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { Error404, LoadingPage } from '@takaro/lib-components';
import { AnimatePresence } from 'framer-motion';
import Dashboard from 'pages/Dashboard';
import { PATHS } from 'paths';
import { AuthenticatedRoute } from 'components/AuthenticatedRoute';
import {
  AiOutlineBook,
  AiOutlineMenu,
  AiOutlineWifi,
  AiOutlineShop,
} from 'react-icons/ai';
import GameServers from 'pages/GameServers';
import Players from 'pages/Players';
import { ModuleDefinitions } from 'pages/ModuleDefinitions';

// Lazy load pages
const LogIn = lazy(() => import('./pages/LogIn'));
const Settings = lazy(() => import('./pages/Settings'));
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

// TODO: Eventually set this to the correct pages.
const error404Pages = [
  {
    icon: <AiOutlineBook />,
    title: 'Documentation',
    description: 'Learn how to integrate our tools with your app',
    to: '',
  },
  {
    icon: <AiOutlineMenu />,
    title: 'Api reference',
    description: 'A complete API reference for our libraries',
    to: '',
  },
  {
    icon: <AiOutlineWifi />,
    title: 'Guides',
    description: 'Installation guides that cover popular setups',
    to: '',
  },
  {
    icon: <AiOutlineShop />,
    title: 'Blog',
    description: 'Read our latest news and articles',
    to: '',
  },
];

export const Router: FC = () => (
  <BrowserRouter>
    <AnimatePresence exitBeforeEnter>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          {/* ======================== Global ======================== */}
          <Route
            element={<AuthenticatedRoute frame="global" />}
            path={PATHS.home()}
          >
            <Route element={<Dashboard />} path={PATHS.home()} />
            <Route element={<Settings />} path={PATHS.settings()} />
            <Route element={<GameServers />} path={PATHS.gameServers()} />
            <Route element={<Players />} path={PATHS.players()} />
            <Route
              element={<ModuleDefinitions />}
              path={PATHS.moduleDefinitions()}
            />
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
            <Route
              element={<Studio />}
              path={PATHS.studio.module(':moduleId')}
            />
          </Route>
          <Route element={<LogIn />} path={PATHS.login()} />

          {/* Page not found matches with everything => should stay at bottom */}
          <Route
            element={
              <Error404 pages={error404Pages} homeRoute={PATHS.home()} />
            }
            path="*"
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  </BrowserRouter>
);
