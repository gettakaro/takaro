import { Card, Message, Skeleton, styled, useLocalStorage } from '@takaro/lib-components';
import { FC, useEffect } from 'react';
import { useGameServer } from 'queries/gameservers';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useGameServerDocumentTitle } from 'hooks/useDocumentTitle';
import { useSnackbar } from 'notistack';
import { DateTime } from 'luxon';
import { OnlinePlayersCard } from '../cards/OnlinePlayers';
import { ChatMessagesCard } from '../cards/ChatMessages';
import { Scrollable } from '../cards/style';
import { EventFeedWidget } from 'components/events/EventFeedWidget';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  width: 100%;
  gap: ${({ theme }) => theme.spacing[1]};
  max-height: 85vh;
`;

const SpanCell = styled.div`
  height: 100%;
  width: 100%;
  grid-row: 1 / span 2;
`;

const GameServerOverview: FC = () => {
  const { selectedGameServerId } = useSelectedGameServer();
  useGameServerDocumentTitle('dashboard');
  const { enqueueSnackbar } = useSnackbar();
  const { data: gameServer, isLoading } = useGameServer(selectedGameServerId);
  const LOCAL_STORAGE_KEY = `console-${selectedGameServerId}`;

  const {
    storedValue: messages,
    setValue: setMessages,
    error: localStorageError,
  } = useLocalStorage<Message[]>(LOCAL_STORAGE_KEY, []);

  if (localStorageError) {
    enqueueSnackbar('Exceeded local storage quota, clearing console', { type: 'error' });
    setMessages([]);
  }

  useEffect(() => {
    const fiveDaysAgo = DateTime.now().minus({ days: 5 });

    const filteredMessages = messages.filter((message) => {
      const messageTimestamp = DateTime.fromISO(message.timestamp);
      return messageTimestamp > fiveDaysAgo;
    });

    // Update the messages if there are any old ones
    if (filteredMessages.length !== messages.length) {
      setMessages(filteredMessages);
    }
  }, []); // Empty dependency array to run only on mount

  if (isLoading) {
    return (
      <>
        <Skeleton variant="rectangular" width="100%" height="30px" />
        <br />
        <Skeleton variant="rectangular" width="100%" height="80vh" />
      </>
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
        <Scrollable>
          <EventFeedWidget query={{ filters: { gameserverId: [gameServer.id] } }} />
        </Scrollable>
      </Card>
    </GridContainer>
  );
};

export default GameServerOverview;
