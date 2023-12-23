import { PlayerOnGameserverOutputDTO, PlayerOutputDTO } from '@takaro/apiclient';
import { Loading, styled } from '@takaro/lib-components';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { PATHS } from 'paths';
import { usePlayerOnGameServers, usePlayers } from 'queries/players/queries';
import { FC } from 'react';

const SteamAvatar = styled.img`
  height: 100%;
  border-radius: 50%;
  margin: auto;
`;

const PlayerCards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  overflow-y: scroll;
`;

const PlayerCard = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  background-color: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.borderRadius.large};
  padding: ${(props) => props.theme.spacing[1]};
  margin: ${(props) => props.theme.spacing[1]};
  height: 50px;
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

  const { data, isLoading } = usePlayerOnGameServers({
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
