import { FC, lazy, Suspense } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { Error404, LoadingPage } from '@takaro/lib-components';
import { AnimatePresence } from 'framer-motion';
import Dashboard from 'pages/Dashboard';
import { PATHS } from 'paths';
import { AuthenticatedRoute } from 'components/AuthenticatedRoute';
import GameServers from 'pages/GameServers';
import AddGameServer from 'pages/AddGameServer';
import Players from 'pages/Players';
import Modules from 'pages/Modules';
import { ModuleCreate } from 'pages/CreateModule';


// Lazy load pages
const LogIn = lazy(() => import('./pages/LogIn'));
const Settings = lazy(() => import('./pages/Settings'));


export const Router: FC = () => (
  <BrowserRouter>
    <AnimatePresence exitBeforeEnter>
      <Suspense fallback={<LoadingPage />}>

        <Routes>
          
          <Route element={<AuthenticatedRoute frame="dashboard" />} path={PATHS.home}>
            <Route element={<Dashboard />} path={PATHS.home} />
            <Route element={<Settings />} path={PATHS.settings} />
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
          <Route element={<Error404 />} path="*" />
        </Routes>
      </Suspense>
    </AnimatePresence>
  </BrowserRouter>
);
