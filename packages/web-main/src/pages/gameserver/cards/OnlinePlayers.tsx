import { EventOutputDTO, PlayerOnGameserverOutputDTO, PlayerOutputDTO } from '@takaro/apiclient';
import { Loading, styled } from '@takaro/lib-components';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useSocket } from 'hooks/useSocket';
import { PATHS } from 'paths';
import { usePlayerOnGameServers, usePlayers } from 'queries/players/queries';
import { FC, useEffect } from 'react';

const SteamAvatar = styled.img`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
`;

const PlayerCards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  overflow-y: scroll;
`;

const PlayerCard = styled.div`
  display: grid;
  grid-template-columns: 2rem 1fr;
  align-items: center;
  background-color: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.borderRadius.large};
  padding: ${(props) => props.theme.spacing['0_5']};
  padding-left: ${(props) => props.theme.spacing['2']};
  margin: ${(props) => props.theme.spacing['0_25']};
  height: 3rem;

  :hover {
    background-color: ${(props) => props.theme.colors.primary};
  }
`;

const OnlinePlayer: FC<{ player: PlayerOutputDTO; pog: PlayerOnGameserverOutputDTO }> = ({ player }) => {
  let avatarUrl = '/favicon.ico';

  if (player.steamAvatar) avatarUrl = player.steamAvatar;

  return (
    <a href={PATHS.player.profile(player.id)}>
      <PlayerCard>
        <SteamAvatar src={avatarUrl} />
        <span>{player.name}</span>
      </PlayerCard>
    </a>
  );
};

export const OnlinePlayersCard: FC = () => {
  const { selectedGameServerId } = useSelectedGameServer();
  const { socket } = useSocket();

  const { data, isLoading, refetch } = usePlayerOnGameServers({
    filters: {
      online: [true],
      gameServerId: [selectedGameServerId],
    },
    extend: ['player'],
  });

  const { data: players, isLoading: isLoadingPlayers } = usePlayers({
    filters: {
      id: data?.data.map((playerOnGameServer) => playerOnGameServer.playerId),
    },
  });

  useEffect(() => {
    socket.on('event', (event: EventOutputDTO) => {
      if (event.eventName === 'player-connected') refetch();
      if (event.eventName === 'player-disconnected') refetch();
    });

    return () => {
      socket.off('event');
    };
  }, []);

  if (isLoading || isLoadingPlayers) return <Loading />;

  return (
    <>
      <h1>Online Players</h1>
      <PlayerCards>
        {data?.data.map((playerOnGameServer) => {
          const player = players?.data.find((player) => player.id === playerOnGameServer.playerId);
          if (!player) return null;

          return <OnlinePlayer key={player.id} player={player} pog={playerOnGameServer} />;
        })}
      </PlayerCards>
    </>
  );
};
