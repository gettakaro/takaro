import { FC } from 'react';
import { styled } from '@takaro/lib-components';
import { EventDetail } from './EventDetail';
import { DateTime } from 'luxon';
import { EventOutputDTO, EventOutputDTOEventNameEnum } from '@takaro/apiclient';
import { CountryCodeToEmoji } from 'components/CountryCodeToEmoji';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: top;
`;

const EventType = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};

  p:first-child {
    font-weight: bold;
  }

  p:last-child {
    color: ${({ theme }) => theme.colors.textAlt};
  }
`;

const ListItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing['7']};
  margin-left: ${({ theme }) => theme.spacing['2']};
`;

const Data = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[2]};
  grid-template-columns: 0.5fr 0.5fr 2fr;
`;

const DataItem = styled.div`
  p:first-child {
    text-transform: capitalize;
    color: ${({ theme }) => theme.colors.textAlt};
  }
`;

const Circle = styled.div`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  margin-top: 5px;
  left: -5px;

  position: absolute;

  background-color: ${({ theme }) => theme.colors.backgroundAccent};
`;
const EventProperty: FC<{ name: string; value: unknown }> = ({ name, value }) => {
  const val = (value as string) === '' ? '-' : value;
  return (
    <DataItem>
      <p>{name}</p>
      <p>{val as string}</p>
    </DataItem>
  );
};

export type EventItemProps = {
  event: EventOutputDTO;
  onDetailClick: () => void;
};

export const EventItem: FC<EventItemProps> = ({ event }) => {
  const timestamp = Date.parse(event.createdAt);
  const timeAgo = DateTime.fromMillis(timestamp).toRelative();

  const meta = event.meta as any;

  let properties = <></>;

  switch (event.eventName) {
    case EventOutputDTOEventNameEnum.ServerStatusChanged:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty name="status" value={meta?.status} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.ChatMessage:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty name="player" value={event.player?.name} />
          <EventProperty name="message" value={meta?.msg} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.CommandExecuted:
      properties = (
        <>
          <EventProperty name="module" value={event.module?.name} />
          <EventProperty name="command" value={meta.command?.name} />
          <EventProperty name="player" value={event.player?.name} />
          {Object.values(meta.command?.arguments).length ? (
            <EventProperty name="args" value={JSON.stringify(meta.command?.arguments)} />
          ) : null}
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.HookExecuted:
      properties = (
        <>
          <EventProperty name="module" value={event?.module?.name} />
          <EventProperty name="success" value={`${meta.result?.success}`} />
          <EventProperty name="hook" value={meta.hook?.name} />
          <EventProperty name="player" value={event.player?.name} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.CronjobExecuted:
      properties = (
        <>
          <EventProperty name="module" value={event?.module?.name} />
          <EventProperty name="success" value={`${meta.result?.success}`} />
          <EventProperty name="cronjob" value={meta.cronjob?.name} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.PlayerNewIpDetected:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty
            name="country"
            value={
              <>
                <CountryCodeToEmoji countryCode={(event.meta as any).country} />
                {(event.meta as any).country}
              </>
            }
          />

          <EventProperty name="player" value={event.player?.name} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.PlayerConnected:
    case EventOutputDTOEventNameEnum.PlayerDisconnected:
    case EventOutputDTOEventNameEnum.PlayerDeath:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty name="game" value={event.gameServer?.type} />
          <EventProperty name="player" value={event.player?.name} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.EntityKilled:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty name="game" value={event.gameServer?.type} />
          <EventProperty name="player" value={event.player?.name} />
          {event.meta && 'weapon' in event.meta ? (
            <EventProperty name="weapon" value={(event.meta as any).weapon} />
          ) : null}
          {event.meta && 'entity' in event.meta ? (
            <EventProperty name="entity" value={(event.meta as any).entity} />
          ) : null}
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.CurrencyAdded:
    case EventOutputDTOEventNameEnum.CurrencyDeducted:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty name="game" value={event.gameServer?.type} />
          <EventProperty name="player" value={event.player?.name} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.SettingsSet:
      properties = (
        <>
          <EventProperty name="user" value={event.user?.name} />
          {event.gameServer ? <EventProperty name="gameserver" value={event.gameServer?.name} /> : null}
          <EventProperty name="key" value={(event.meta as any).key} />
          <EventProperty name="value" value={(event.meta as any).value} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.RoleCreated:
    case EventOutputDTOEventNameEnum.RoleDeleted:
    case EventOutputDTOEventNameEnum.RoleUpdated:
    case EventOutputDTOEventNameEnum.RoleAssigned:
    case EventOutputDTOEventNameEnum.RoleRemoved:
      properties = (
        <>
          {event.player ? <EventProperty name="player" value={event.player?.name} /> : null}
          {event.user ? <EventProperty name="user" value={event.user?.name} /> : null}
          {event.meta && 'role' in event.meta && 'name' in (event.meta as any).role ? (
            <EventProperty name="role" value={(event.meta as any).role.name} />
          ) : null}
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.ModuleCreated:
    case EventOutputDTOEventNameEnum.ModuleUpdated:
    case EventOutputDTOEventNameEnum.ModuleDeleted:
      properties = (
        <>
          {event.module ? (
            <EventProperty name="module" value={event?.module?.name} />
          ) : (
            <EventProperty name="module" value={event?.moduleId} />
          )}
          {event.user ? (
            <EventProperty name="user" value={event.user?.name} />
          ) : (
            <EventProperty name="user" value={event?.userId} />
          )}
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.ModuleInstalled:
    case EventOutputDTOEventNameEnum.ModuleUninstalled:
      properties = (
        <>
          {event.module ? (
            <EventProperty name="module" value={event?.module?.name} />
          ) : (
            <EventProperty name="module" value={event?.moduleId} />
          )}
          {event.user ? (
            <EventProperty name="user" value={event.user?.name} />
          ) : (
            <EventProperty name="user" value={event?.userId} />
          )}
          {event.gameServer ? (
            <EventProperty name="gameserver" value={event.gameServer?.name} />
          ) : (
            <EventProperty name="gameserver" value={event.gameserverId} />
          )}
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.PlayerCreated:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name || 'Global'} />
          <EventProperty name="player" value={event.player?.name} />
        </>
      );
      break;
  }

  return (
    <ListItem>
      <Circle />
      <Header>
        <EventType>
          <p>{event.eventName}</p>
          <p>{timeAgo}</p>
        </EventType>
        <EventDetail eventType={event.eventName} metaData={event} />
      </Header>
      <Data>{properties}</Data>
    </ListItem>
  );
};
