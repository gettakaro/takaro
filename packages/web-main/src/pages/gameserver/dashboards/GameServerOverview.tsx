import { Card, styled, useTheme } from '@takaro/lib-components';
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

  grid-template-columns: 1fr 0.4fr;
  grid-template-rows: minmax(auto, 40%) 1fr;

  width: 100%;
  height: 100%;
  max-height: calc(100% - 60px);

  gap: ${({ theme }) => theme.spacing[1]};
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

  if (isLoading || gameServer === undefined) {
    return <> </>;
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
