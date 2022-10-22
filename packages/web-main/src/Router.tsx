import { FC, lazy, Suspense } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { Error404, LoadingPage } from '@takaro/lib-components';
import { AnimatePresence } from 'framer-motion';
import Dashboard from 'pages/Dashboard';
import { PATHS } from 'paths';
import { AuthenticatedRoute } from 'components/AuthenticatedRoute';
import { AiOutlineBook, AiOutlineMenu, AiOutlineWifi, AiOutlineShop } from 'react-icons/ai';
import GameServers from 'pages/GameServers';
import AddGameServer from 'pages/AddGameServer';
import Players from 'pages/Players';
import Modules from 'pages/Modules';
import { ModuleCreate } from 'pages/CreateModule';

// Lazy load pages
const LogIn = lazy(() => import('./pages/LogIn'));
const Settings = lazy(() => import('./pages/Settings'));

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
  }
];

export const Router: FC = () => (
  <BrowserRouter>
    <AnimatePresence exitBeforeEnter>
      <Suspense fallback={<LoadingPage />}>

        <Routes>

          <Route element={<AuthenticatedRoute frame="dashboard" />} path={PATHS.home}>
            <Route element={<Dashboard />} path={PATHS.home} />
            <Route element={<Settings />} path={PATHS.settings} />
            <Route element={<Settings />} path={PATHS.settingsGameserver} />
            <Route element={<GameServers />} path={PATHS.gameServers.overview} />
            <Route element={<AddGameServer />} path={PATHS.gameServers.create} />
            <Route element={<AddGameServer />} path={PATHS.gameServers.update} />
            <Route element={<Players />} path={PATHS.players} />
          </Route>

          <Route element={<AuthenticatedRoute frame="workbench" />} path={PATHS.home}>
            <Route element={<Modules />} path={PATHS.modules.main} />
            <Route element={<ModuleCreate />} path={PATHS.modules.create} />
          </Route>

          <Route element={<LogIn />} path={PATHS.login} />

          {/* Page not found matches with everything => should stay at bottom */}
          <Route element={<Error404 pages={error404Pages} homeRoute={PATHS.home} />} path="*" />
        </Routes>
      </Suspense>
    </AnimatePresence>
  </BrowserRouter>
);
