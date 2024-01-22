import { Skeleton, useTheme } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { FC } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { EventFeedWidget } from 'components/events/EventFeedWidget';
import { Section } from '../style';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { PlayerOnGameserverOutputDTO } from '@takaro/apiclient';

export const PlayerEvents: FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  if (!playerId) {
    navigate(PATHS.players());
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  const { selectedGameServerId } = useSelectedGameServer();

  const { pog } = useOutletContext<{ pog: PlayerOnGameserverOutputDTO }>();

  if (!pog) {
    return null;
  }

  const theme = useTheme();

  return (
    <Section style={{ height: '100%', overflowY: 'auto', paddingRight: theme.spacing[2] }}>
      <EventFeedWidget query={{ filters: { playerId: [playerId], gameserverId: [selectedGameServerId] } }} />
    </Section>
  );
};
