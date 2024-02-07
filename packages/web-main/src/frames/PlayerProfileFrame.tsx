import {
  Stats,
  styled,
  Skeleton,
  useTheme,
  HorizontalNav,
  HorizontalNavLink,
  Avatar,
  getInitials,
} from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayer } from 'queries/players';
import { FC } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { DateTime } from 'luxon';
import { usePlayerOnGameServers } from 'queries/pog/queries';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { ErrorBoundary } from 'components/ErrorBoundary';

const Container = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`;

const Header = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
`;

export const PlayerProfileFrame: FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  if (!playerId) {
    navigate(PATHS.players());
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  const { data: player, isLoading } = usePlayer(playerId);

  const { data: pogs, isLoading: isLoadingPogs } = usePlayerOnGameServers({
    filters: {
      playerId: [playerId],
    },
  });

  useDocumentTitle(player?.name || 'Player Profile');

  if (isLoading || isLoadingPogs || !player || !pogs) {
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  const theme = useTheme();

  const links: HorizontalNavLink[] = [
    {
      text: 'Global',
      // If serverId is not valid it will be directed by the failed requests.
      to: PATHS.player.global.profile(playerId),
    },
    {
      text: 'Events',
      to: PATHS.player.events(playerId),
    },
    {
      text: 'Inventory',
      to: PATHS.player.inventory(playerId),
    },
    {
      text: 'Economy',
      to: PATHS.player.economy(playerId),
    },
  ];

  const pog = pogs.data.find((p) => p.playerId === playerId);

  return (
    <Container>
      <Header>
        <Avatar size="large" variant="rounded">
          <Avatar.Image src={player?.steamAvatar} />
          <Avatar.FallBack>{getInitials(player?.name)}</Avatar.FallBack>
        </Avatar>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
          <h1 style={{ lineHeight: 1 }}>{player?.name}</h1>
          <div style={{ display: 'flex', gap: theme.spacing[2] }}>
            <Stats border={false} direction="horizontal">
              <Stats.Stat
                description="Member since"
                value={DateTime.fromISO(player?.createdAt).toLocaleString({
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
              <Stats.Stat
                description="Last seen"
                value={DateTime.fromISO(player?.updatedAt).toLocaleString({
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
              <Stats.Stat description="Joined servers" value={`${pogs.data.length ?? 0}`} />
            </Stats>
          </div>
        </div>
      </Header>

      <HorizontalNav items={links} variant="underline" />

      <ErrorBoundary>
        <Outlet context={{ pog, player }} />
      </ErrorBoundary>
    </Container>
  );
};
