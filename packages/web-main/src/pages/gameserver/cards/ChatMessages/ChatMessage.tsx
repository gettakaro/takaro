import { EventChatMessage, EventOutputDTO } from '@takaro/apiclient';
import { Avatar, useTheme } from '@takaro/lib-components';
import { Player } from 'components/Player';
import { DateTime } from 'luxon';
import { FC } from 'react';
import { Message } from './style';

export const ChatMessage: FC<{ chatMessage: EventOutputDTO }> = ({ chatMessage }) => {
  const theme = useTheme();

  const meta = chatMessage.meta as EventChatMessage;
  if (!meta || !('msg' in meta)) return null;

  const friendlyTimeStamp = DateTime.fromISO(chatMessage.createdAt).toLocaleString(DateTime.TIME_24_SIMPLE);
  const player = chatMessage.player;

  if (!chatMessage.playerId) {
    const avatar = (
      <Avatar size="tiny">
        <Avatar.Image src={'/favicon.ico'} alt={'takaro icon'} />
      </Avatar>
    );
    return (
      <Message>
        <span style={{ color: theme.colors.textAlt }}>{friendlyTimeStamp}</span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing['0_5'],
            fontWeight: 'bold',
          }}
        >
          {avatar} Server
        </span>
        <span>{meta.msg as string}</span>
      </Message>
    );
  }

  if (!player) return null;

  return (
    <Message>
      <span style={{ color: theme.colors.textAlt }}>{friendlyTimeStamp}</span>
      <span style={{ fontWeight: 'bold' }}>
        <Player playerId={player.id} name={player.name} showAvatar={true} avatarUrl={player.steamAvatar} />
      </span>
      <span>{meta.msg as string}</span>
    </Message>
  );
};
