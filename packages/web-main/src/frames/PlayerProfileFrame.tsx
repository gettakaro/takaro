import { Stats, styled, Skeleton, useTheme, HorizontalNav, HorizontalNavLink } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayer } from 'queries/players';
import { FC } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { DateTime } from 'luxon';
import { usePlayerOnGameServers } from 'queries/players/queries';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
`;

export const ChipContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
      to: PATHS.player.global.overview(playerId),
    },
    {
      text: 'Gameserver',
      to: PATHS.player.gameServer.overview(playerId),
    },
  ];

  return (
    <Container>
      <Section>
        <div style={{ display: 'flex', gap: theme.spacing[1] }}>
          <img src={player?.steamAvatar} alt="avatar" style={{ width: '120px', height: '120px' }} />
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
                <Stats.Stat description="Joined servers" value={'1'} />
              </Stats>
            </div>
          </div>
        </div>
      </Section>

      <HorizontalNav items={links} variant="underline" />

      <Outlet />
    </Container>
  );
};
