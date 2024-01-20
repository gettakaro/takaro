import { Skeleton } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayer } from 'queries/players';
import { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerInventoryTable } from '../PlayerInventoryTable';
import { usePlayerOnGameServers } from 'queries/players/queries';
import { EventFeedWidget } from 'components/events/EventFeedWidget';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { Container, Section } from '../style';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';

export const PlayerProfileGameServer: FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  if (!playerId) {
    navigate(PATHS.players());
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  const { data: player, isLoading } = usePlayer(playerId);

  const { data: pogs, isLoading: isLoadingPogs } = usePlayerOnGameServers({
    filters: {
      playerId: [playerId],
    },
  });

  useDocumentTitle(player?.name || 'Player Profile');

  const { selectedGameServerId } = useSelectedGameServer();

  if (isLoading || isLoadingPogs || !player || !pogs) {
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  return (
    <Container>
      <Section style={{ minHeight: '250px' }}>
        <h2>Inventory</h2>
        <PlayerInventoryTable pogs={pogs.data} />
      </Section>

      <Section>
        <h2>Events</h2>
        <EventFeedWidget query={{ filters: { playerId: [playerId], gameserverId: [selectedGameServerId] } }} />
      </Section>
    </Container>
  );
};
