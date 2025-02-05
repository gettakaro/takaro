import { Avatar, Chip, getInitials, Tooltip } from '@takaro/lib-components';
import { playerQueryOptions } from 'queries/player';
import { FC } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

interface PlayerProps {
  playerId: string;
  name?: string;
  avatarUrl?: string;
  showAvatar?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
}

type PlayerContainerProps = Pick<PlayerProps, 'showAvatar' | 'playerId'>;

export const PlayerContainer: FC<PlayerContainerProps> = ({ playerId, showAvatar }) => {
  const { data: player, isLoading, error } = useQuery(playerQueryOptions(playerId));

  return (
    <Player
      playerId={playerId}
      name={player?.name}
      isLoading={isLoading}
      showAvatar={showAvatar}
      hasError={error !== null}
    />
  );
};

export const Player: FC<PlayerProps> = ({ playerId, name, avatarUrl, showAvatar, isLoading, hasError }) => {
  if (isLoading) {
    return <Chip color="backgroundAccent" isLoading label="" />;
  }

  if (!name || hasError) {
    return <Chip variant="outline" color="backgroundAccent" label="unknown" />;
  }

  const avatar = (
    <Avatar size="tiny">
      <Avatar.Image src={avatarUrl} alt={`steam-avatar-${name}`} />
      <Avatar.FallBack>{getInitials(name)}</Avatar.FallBack>
    </Avatar>
  );

  return (
    <Tooltip>
      <Tooltip.Trigger>
        <Link
          className="underline"
          to={'/player/$playerId'}
          params={{ playerId }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}
        >
          {showAvatar && avatar}
          <span>{name}</span>
        </Link>
      </Tooltip.Trigger>
      <Tooltip.Content>Open player profile</Tooltip.Content>
    </Tooltip>
  );
};
