import { HorizontalNav, Message, Skeleton, useLocalStorage, useTheme } from '@takaro/lib-components';
import { FC, useEffect } from 'react';
import { useGameServer } from 'queries/gameservers';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useGameServerDocumentTitle } from 'hooks/useDocumentTitle';
import { useSnackbar } from 'notistack';
import { DateTime } from 'luxon';
import { PATHS } from 'paths';
import { Outlet } from 'react-router-dom';

// const GridContainer = styled.div`
//   display: grid;
//   grid-template-columns: 1fr 0.6fr;
//   grid-template-rows: min-max(min-content, 400px) 1fr;
//   width: 100%;
//   gap: 1rem;
//   max-height: 85vh;
// `;
//
// const Card = styled.div<{ firstRow?: boolean }>`
//   background-color: ${({ theme }) => theme.colors.background};
//   border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAccent};
//   padding: ${({ theme }) => theme.spacing[2]};
//   border-radius: ${({ theme }) => theme.borderRadius.large};
//   overflow-y: auto;
// `;

const GameServerDashboardFrame: FC = () => {
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
            to: PATHS.gameServer.dashboard.overview(gameServer.id),
          },
          {
            text: 'Console',
            to: PATHS.gameServer.dashboard.console(gameServer.id),
          },
          {
            text: 'Statistics',
            to: PATHS.gameServer.dashboard.statistics(gameServer.id),
          },
        ]}
      />
      <Outlet context={{ gameServer }} />
    </div>
  );
};

export default GameServerDashboardFrame;

//
// <GridContainer>
//   <Card>
//     <ChatMessagesCard />
//   </Card>
//   <Card>
//     <OnlinePlayersCard />
//   </Card>
//   <Card>
//     <EventFeedWidget query={{ filters: { gameserverId: [gameServer.id] } }} />
//   </Card>
// </GridContainer>
