import { HorizontalNav, useTheme } from '@takaro/lib-components';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { PATHS } from 'paths';
import { FC } from 'react';
import { Outlet } from 'react-router-dom';

const GameServerDashboardFrame: FC = () => {
  const { selectedGameServerId } = useSelectedGameServer();
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        gap: theme.spacing[2],
      }}
    >
      <HorizontalNav
        variant={'block'}
        items={[
          {
            text: 'Overview',
            to: PATHS.gameServer.dashboard.overview(selectedGameServerId),
          },
          {
            text: 'Console',
            to: PATHS.gameServer.dashboard.console(selectedGameServerId),
          },
          {
            text: 'Statistics',
            to: PATHS.gameServer.dashboard.statistics(selectedGameServerId),
          },
        ]}
      />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  );
};

export default GameServerDashboardFrame;
