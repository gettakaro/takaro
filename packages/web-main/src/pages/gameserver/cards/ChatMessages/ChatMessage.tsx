import { EventChatMessage, EventOutputDTO, EventOutputDTOEventNameEnum as EventName } from '@takaro/apiclient';
import { Avatar, useTheme } from '@takaro/lib-components';
import { Player } from 'components/Player';
import { DateTime } from 'luxon';
import { FC } from 'react';
import { EventMessage, Message, TimeStamp } from './style';

export const ChatMessage: FC<{ event: EventOutputDTO }> = ({ event }) => {
  const theme = useTheme();

  const friendlyTimeStamp = DateTime.fromISO(event.createdAt).toLocaleString(DateTime.TIME_24_SIMPLE);
  const player = event.player;

  if (player && (event.eventName === EventName.PlayerConnected || event.eventName === EventName.PlayerDisconnected)) {
    return (
      <Message>
        <TimeStamp>{friendlyTimeStamp}</TimeStamp>
        <span>
          <Player playerId={player.id} name={player.name} showAvatar={true} avatarUrl={event.player?.steamAvatar} />
        </span>
        <EventMessage>{event.eventName === EventName.PlayerConnected ? 'joined' : 'left'}</EventMessage>
      </Message>
    );
  }

  const meta = event.meta as EventChatMessage;
  if (!meta || !('msg' in meta)) return null;

  if (!event.playerId) {
    return (
      <Message>
        <TimeStamp>{friendlyTimeStamp}</TimeStamp>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing['0_5'],
          }}
        >
          <Avatar size="tiny">
            <Avatar.Image src={'/favicon.ico'} alt={'takaro icon'} />
          </Avatar>
          Server
        </span>
        <span>{meta.msg as string}</span>
      </Message>
    );
  }

  if (!player) return null;

  return (
    <Message>
      <TimeStamp>{friendlyTimeStamp}</TimeStamp>
      <span>
        <Player playerId={player.id} name={player.name} showAvatar={true} avatarUrl={player.steamAvatar} />
      </span>
      <span>{meta.msg as string}</span>
    </Message>
  );
};
