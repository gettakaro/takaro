import { Card, styled, useTheme } from '@takaro/lib-components';
import { gameServerQueryOptions } from 'queries/gameserver';
import { useGameServerDocumentTitle } from 'hooks/useDocumentTitle';
import { OnlinePlayersCard } from './-components/OnlinePlayers';
import { ChatMessagesCard } from './-components/ChatMessages';
import { Scrollable } from './-components/style';
import { EventFeedWidget } from 'components/events/EventFeedWidget';
import { EventOutputDTOEventNameEnum as EventName } from '@takaro/apiclient';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/dashboard/overview')({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId)),
  component: Component,
  pendingComponent: () => {},
});

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

function Component() {
  const loaderData = Route.useLoaderData();
  const { gameServerId } = Route.useParams();
  const theme = useTheme();

  const { data: gameServer } = useQuery({
    ...gameServerQueryOptions(gameServerId),
    initialData: loaderData,
  });
  useGameServerDocumentTitle('dashboard', gameServer);

  const subscribedEvents = [
    // Roles
    EventName.RoleUpdated,
    EventName.RoleDeleted,
    EventName.RoleCreated,
    EventName.RoleRemoved,
    EventName.RoleAssigned,

    // GameServer
    EventName.EntityKilled,
    EventName.PlayerDeath,

    // Economy
    EventName.CurrencyDeducted,
    EventName.CurrencyAdded,

    // Takaro
    EventName.HookExecuted,
    EventName.CronjobExecuted,
    EventName.CommandExecuted,
    EventName.SettingsSet,
    EventName.PlayerNewIpDetected,
    EventName.ServerStatusChanged,
  ];

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
                eventName: subscribedEvents,
              },
            }}
          />
        </Scrollable>
      </Card>
    </GridContainer>
  );
}
