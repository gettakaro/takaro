import { FC, useState } from 'react';
import { styled, Dropdown, IconButton, Button, Collapsible } from '@takaro/lib-components';
import { DateTime } from 'luxon';
import { EventOutputDTO, EventOutputDTOEventNameEnum } from '@takaro/apiclient';

import { CountryCodeToEmoji } from '../../../components/CountryCodeToEmoji';
import { useCronJobTrigger } from '../../../queries/module';
import { AiOutlineMenu as MenuIcon, AiOutlineEye as ViewIcon, AiOutlineSend as TriggerIcon, AiOutlineCode as CodeIcon } from 'react-icons/ai';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi2';
import { EventDetailDialog } from '../../../components/dialogs/EventDetailDialog';
import { getEventIcon } from '../../../utils/eventIcons';

const TimelineItemContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing['4']};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing['3']};
  box-shadow: ${({ theme }) => theme.elevation[1]};
  
  &::before {
    content: '';
    position: absolute;
    left: -${({ theme }) => theme.spacing['6']};
    top: ${({ theme }) => theme.spacing['3']};
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    border: 3px solid ${({ theme }) => theme.colors.backgroundAlt};
    z-index: 2;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing['2']};
`;

const EventInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['0_5']};
`;

const EventType = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['1']};
  
  .event-icon {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.textAlt};
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Data = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing['2']};
  margin-top: ${({ theme }) => theme.spacing['2']};
`;

const ExpandedContent = styled.div`
  margin-top: ${({ theme }) => theme.spacing['3']};
  padding-top: ${({ theme }) => theme.spacing['3']};
  border-top: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
`;

const JsonView = styled.pre`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing['2']};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  overflow-x: auto;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.text};
`;

const DataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['0_5']};
  
  p:first-child {
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.colors.textAlt};
    text-transform: capitalize;
    margin: 0;
  }
  
  p:last-child {
    font-size: ${({ theme }) => theme.fontSize.medium};
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }
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
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  
  const EventIcon = getEventIcon(event.eventName);

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
    case EventOutputDTOEventNameEnum.ShopOrderStatusChanged:
      properties = (
        <>
          <EventProperty name="gameserver" value={event.gameServer?.name} />
          <EventProperty name="player" value={event.player?.name} />
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
    <TimelineItemContainer>
      <Header>
        <EventInfo>
          <EventType>
            <EventIcon className="event-icon" />
            {event.eventName}
          </EventType>
          <EventMeta>
            <span>{timeAgo}</span>
            {event.gameServer && <span>• {event.gameServer.name}</span>}
            {event.player && <span>• {event.player.name}</span>}
          </EventMeta>
        </EventInfo>
        <ActionsContainer>
          <EventDetailDialog
            open={openDetailsDialog}
            onOpenChange={setOpenDetailsDialog}
            eventType={event.eventName}
            metaData={event}
          />

          <Dropdown placement="left">
            <Dropdown.Trigger asChild>
              <IconButton icon={<MenuIcon />} ariaLabel="Event actions" />
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
        </ActionsContainer>
      </Header>
      <Data>{properties}</Data>
      
      {/* Expand/Collapse button */}
      <Collapsible>
        <Collapsible.Trigger asChild>
          <Button
            size="small"
            color="secondary"
            variant="outline"
            icon={<HiChevronDown />}
          >
            Show More
          </Button>
        </Collapsible.Trigger>
        
        <Collapsible.Content>
          <ExpandedContent>
          {/* Additional metadata */}
          <Data>
            <DataItem>
              <p>Event ID</p>
              <p>{event.id}</p>
            </DataItem>
            <DataItem>
              <p>Created At</p>
              <p>{new Date(event.createdAt).toLocaleString()}</p>
            </DataItem>
            {event.actingUserId && (
              <DataItem>
                <p>Acting User ID</p>
                <p>{event.actingUserId}</p>
              </DataItem>
            )}
          </Data>
          
          {/* Raw JSON toggle */}
          <Button
            size="small"
            color="secondary"
            variant="outline"
            onClick={() => setShowRawJson(!showRawJson)}
            icon={<CodeIcon />}
          >
            {showRawJson ? 'Hide' : 'Show'} Raw JSON
          </Button>
          
          {showRawJson && (
            <JsonView>
              {JSON.stringify(event, null, 2)}
            </JsonView>
          )}
          </ExpandedContent>
        </Collapsible.Content>
      </Collapsible>
    </TimelineItemContainer>
  );
};
