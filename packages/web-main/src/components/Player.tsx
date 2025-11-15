import { Avatar, Chip, getInitials } from '@takaro/lib-components';
import { playerQueryOptions } from '../queries/player';
import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlayerActions } from './PlayerActions';

interface PlayerProps {
  playerId: string;
  name?: string;
  avatarUrl?: string;
  showAvatar?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
  gameServerId?: string;
}

type PlayerContainerProps = Pick<PlayerProps, 'showAvatar' | 'playerId'>;

export const PlayerContainer: FC<PlayerContainerProps> = ({ playerId, showAvatar }) => {
  const { data: player, error } = useQuery(playerQueryOptions(playerId));

  return (
    <Player
      playerId={playerId}
      name={player?.name}
      avatarUrl={player?.steamAvatar}
      showAvatar={showAvatar}
      hasError={error !== null}
    />
  );
};

export const Player: FC<PlayerProps> = ({ playerId, name, avatarUrl, showAvatar, hasError, gameServerId }) => {
  if (!name || hasError) {
    return <Chip color="backgroundAccent" label="unknown" />;
  }

  const content = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
      {showAvatar && (
        <Avatar size="tiny">
          <Avatar.Image src={avatarUrl} alt={`steam-avatar-${name}`} />
          <Avatar.FallBack>{getInitials(name)}</Avatar.FallBack>
        </Avatar>
      )}
      <span>{name}</span>
    </div>
  );

  return (
    <div>
      {gameServerId ? (
        <PlayerActions playerId={playerId} gameServerId={gameServerId}>
          {content}
        </PlayerActions>
      ) : (
        content
      )}
    </div>
  );
};
