import { Console, Message, Skeleton, styled, useLocalStorage } from '@takaro/lib-components';
import { getApiClient } from 'util/getApiClient';
import { socket } from 'hooks/useSocket';
import { gameServerQueryOptions } from 'queries/gameserver';
import { useGameServerDocumentTitle } from 'hooks/useDocumentTitle';
import { useSnackbar } from 'notistack';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

const Container = styled.div`
  height: 100%;
  max-height: 82vh;
  width: 100%;
`;

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/dashboard/console')({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId)),
  component: Component,
  pendingComponent: () => {
    return (
      <>
        <Skeleton variant="rectangular" width="100%" height="30px" />
        <br />
        <Skeleton variant="rectangular" width="100%" height="80vh" />
      </>
    );
  },
});

function Component() {
  const loaderData = Route.useLoaderData();
  const { gameServerId } = Route.useParams();

  const { data: gameServer } = useQuery({
    ...gameServerQueryOptions(gameServerId),
    initialData: loaderData,
  });

  useGameServerDocumentTitle('dashboard', gameServer);
  const apiClient = getApiClient();
  const { enqueueSnackbar } = useSnackbar();
  const LOCAL_STORAGE_KEY = `console-${gameServer.id}`;

  const {
    storedValue: messages,
    setValue: setMessages,
    error: localStorageError,
  } = useLocalStorage<Message[]>(LOCAL_STORAGE_KEY, []);

  if (localStorageError) {
    enqueueSnackbar('Exceeded local storage quota, clearing console', { type: 'error' });
    setMessages([]);
  }

  function handleMessageFactory() {
    // TODO: use typings from backend
    const eventHandler = (
      handleGameserverId: string,
      type: 'player-disconnected' | 'player-connected' | 'chat-message' | 'log-line' | 'discord-message',
      data: Record<string, unknown>,
    ) => {
      if (handleGameserverId !== gameServer.id) return;

      let msg = data?.msg as string;

      const player = data?.player as Record<string, string> | undefined;

      if (player !== undefined) {
        if (type === 'player-connected') {
          msg = `${player?.name}: connected`;
        }

        if (type === 'player-disconnected') {
          msg = `${player?.name}: disconnected`;
        }

        if (type === 'chat-message') {
          msg = `${player?.name}: ${data?.msg}`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          type: 'info',
          timestamp: data?.timestamp as string,
          data: msg,
        },
      ]);
    };

    return {
      on: () => {
        socket.on('gameEvent', eventHandler);
      },
      off: () => {
        socket.off('gameEvent', eventHandler);
      },
    };
  }

  return (
    <Container>
      <Console
        messages={messages}
        setMessages={setMessages}
        listenerFactory={handleMessageFactory}
        onExecuteCommand={async (command: string) => {
          const result = await apiClient.gameserver.gameServerControllerExecuteCommand(gameServer.id, { command });
          return {
            type: 'command',
            data: command,
            result: result.data.data.rawResult,
            timestamp: new Date().toISOString(),
          };
        }}
      />
    </Container>
  );
}
