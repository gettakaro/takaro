import { Card, Skeleton, styled, useTheme } from '@takaro/lib-components';
import { FC } from 'react';
import { useGameServer } from 'queries/gameservers';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useGameServerDocumentTitle } from 'hooks/useDocumentTitle';
import { OnlinePlayersCard } from '../cards/OnlinePlayers';
import { ChatMessagesCard } from '../cards/ChatMessages';
import { Scrollable } from '../cards/style';
import { EventFeedWidget } from 'components/events/EventFeedWidget';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: minmax(50px, auto) 1fr;
  width: 100%;
  height: 100%;
  gap: ${({ theme }) => theme.spacing[1]};
  max-height: 85vh;
`;

const SpanCell = styled.div`
  height: 100%;
  width: 100%;
  grid-row: 1 / span 2;
`;

const GameServerOverview: FC = () => {
  useGameServerDocumentTitle('dashboard');

  const { selectedGameServerId } = useSelectedGameServer();
  const { data: gameServer, isLoading } = useGameServer(selectedGameServerId);
  const theme = useTheme();

  if (isLoading) {
    return (
      <GridContainer>
        <SpanCell>
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </SpanCell>
        <Skeleton variant="rectangular" width="100%" height="100%" />
        <Skeleton variant="rectangular" width="100%" height="100%" />
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </GridContainer>
    );
  }

  // TODO: handle this
  if (gameServer === undefined) {
    return <>could not load data</>;
  }

  return (
    <GridContainer>
      <SpanCell>
        <ChatMessagesCard />
      </SpanCell>
      <OnlinePlayersCard />
      <Card variant="outline">
        <h2 style={{ marginBottom: theme.spacing[2] }}>Module Events</h2>
        <Scrollable>
          <EventFeedWidget
            query={{
              filters: {
                gameserverId: [gameServer.id],
                eventName: ['hook-executed', 'cronjob-executed', 'command-executed'],
              },
            }}
          />
        </Scrollable>
      </Card>
    </GridContainer>
  );
};

export default GameServerOverview;
