import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { GlobalFrame } from '../../frames/GlobalFrame';
import { StudioFrame } from '../../frames/StudioFrame';
import { SettingsFrame } from 'frames/SettingsFrame';
import GameServerDashboardFrame from 'frames/GameServerDashboardFrame';

interface LayoutRouteProps {
  frame: 'global' | 'studio' | 'settings' | 'gameServerDashboard';
}

export const FrameLayoutRoute: FC<LayoutRouteProps> = ({ frame }) => {
  function handleFrame() {
    switch (frame) {
      case 'global':
        return <GlobalFrame />;
      case 'studio':
        return <StudioFrame />;
      case 'settings':
        return <SettingsFrame />;
      case 'gameServerDashboard':
        return <GameServerDashboardFrame />;
      default:
        return <Outlet />;
    }
  }

  return handleFrame();
};
