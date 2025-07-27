import { FC, useState } from 'react';
import { styled, Dropdown, IconButton } from '@takaro/lib-components';
import { DateTime } from 'luxon';
import { EventOutputDTO, EventOutputDTOEventNameEnum } from '@takaro/apiclient';

import { CountryCodeToEmoji } from '../../../components/CountryCodeToEmoji';
import { useCronJobTrigger } from '../../../queries/module';
import { AiOutlineMenu as MenuIcon, AiOutlineEye as ViewIcon, AiOutlineSend as TriggerIcon } from 'react-icons/ai';
import { EventDetailDialog } from '../../../components/dialogs/EventDetailDialog';

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
  const { mutate } = useCronJobTrigger();
  const [openDetailsDialog, setOpenDetailsDialog] = useState<boolean>(false);

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
          <EventProperty name="amount" value={(event.meta as any).amount} />
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

    case EventOutputDTOEventNameEnum.ShopListingCreated:
    case EventOutputDTOEventNameEnum.ShopListingUpdated:
    case EventOutputDTOEventNameEnum.ShopListingDeleted:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty name="user" value={event.actingUserId} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.ShopOrderCreated:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty name="player" value={event.player?.name} />
          <EventProperty name="listing" value={meta?.listingName} />
          <EventProperty name="amount" value={meta?.amount} />
          <EventProperty name="total price" value={meta?.totalPrice} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.ShopOrderStatusChanged:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty name="player" value={event.player?.name} />
          <EventProperty name="status" value={meta?.status} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.ShopOrderDeliveryFailed:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty name="player" value={event.player?.name} />
          <EventProperty name="error" value={meta?.error} />
          {meta?.items && meta.items.length > 0 && (
            <EventProperty name="items" value={`${meta.items.length} items failed`} />
          )}
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.ShopStockEmpty:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty name="listing" value={meta?.listingName} />
          <EventProperty name="listing id" value={meta?.listingId} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.ShopStockUpdated:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty name="listing" value={meta?.listingName} />
          <EventProperty name="old stock" value={meta?.oldStock ?? 'N/A'} />
          <EventProperty name="new stock" value={meta?.newStock} />
          <EventProperty name="stock enabled" value={meta?.stockManagementEnabled ? 'Yes' : 'No'} />
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.PlayerLinked:
      properties = (
        <>
          <EventProperty name="player" value={event.player?.name} />
          <EventProperty name="gameserver" value={event.gameServer?.name} />
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
    case EventOutputDTOEventNameEnum.PlayerBanned:
      properties = (
        <>
          <EventProperty name="player" value={event.player?.name} />
          <EventProperty name="gameserver" value={meta?.isGlobal ? 'All servers' : event.gameServer?.name} />
          {meta?.reason && <EventProperty name="reason" value={meta.reason} />}
          {meta?.until && <EventProperty name="until" value={new Date(meta.until).toLocaleString()} />}
          {event.user && <EventProperty name="banned by" value={event.user?.name} />}
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.PlayerUnbanned:
      properties = (
        <>
          <EventProperty name="player" value={event.player?.name} />
          <EventProperty name="gameserver" value={meta?.isGlobal ? 'All servers' : event.gameServer?.name} />
          {event.user && <EventProperty name="unbanned by" value={event.user?.name} />}
        </>
      );
      break;
    case EventOutputDTOEventNameEnum.GameserverCreated:
    case EventOutputDTOEventNameEnum.GameserverUpdated:
    case EventOutputDTOEventNameEnum.GameserverDeleted:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EventDetailDialog
            open={openDetailsDialog}
            onOpenChange={setOpenDetailsDialog}
            eventType={event.eventName}
            metaData={event}
          />

          <Dropdown placement="left">
            <Dropdown.Trigger asChild>
              <IconButton icon={<MenuIcon />} ariaLabel="click me" />
            </Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Menu.Item
                icon={<ViewIcon />}
                label="View Event details"
                onClick={() => setOpenDetailsDialog(true)}
              />
              {(event.meta as any)?.cronjob && (
                <Dropdown.Menu.Item
                  label="Trigger cronjob"
                  icon={<TriggerIcon />}
                  onClick={() =>
                    mutate({
                      moduleId: event.moduleId!,
                      gameServerId: event.gameServer!.id,
                      cronjobId: (event.meta as any).cronjob.id,
                    })
                  }
                />
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Header>
      <Data>{properties}</Data>
    </ListItem>
  );
};
