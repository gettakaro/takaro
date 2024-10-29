import { Card, styled } from '@takaro/lib-components';
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
  pendingComponent: () => { },
});

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.4fr;
  width: 100%;
  height: 100%;
  gap: ${({ theme }) => theme.spacing[2]};
`;

function Component() {
  const loaderData = Route.useLoaderData();
  const { gameServerId } = Route.useParams();

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
      <ChatMessagesCard gameServerId={gameServerId} />
      <OnlinePlayersCard gameServerId={gameServerId} />
      <Card variant="outline">
        <Card.Title label="Module events" />
        <Card.Body>
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
        </Card.Body>
      </Card>
    </GridContainer>
  );
}
