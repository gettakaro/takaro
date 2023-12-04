import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { GlobalFrame } from '../../frames/GlobalFrame';
import { StudioFrame } from '../../frames/StudioFrame';
import { SettingsFrame } from 'frames/SettingsFrame';

interface LayoutRouteProps {
  frame: 'global' | 'studio' | 'settings';
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
      default:
        return <Outlet />;
    }
  }

  return handleFrame();
};
