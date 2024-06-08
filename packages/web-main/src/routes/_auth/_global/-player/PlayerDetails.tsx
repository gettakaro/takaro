import { Stats, styled, useTheme, Avatar, getInitials, HorizontalNav } from '@takaro/lib-components';
import { DateTime } from 'luxon';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { PlayerOnGameserverOutputArrayDTOAPI, PlayerOutputDTO } from '@takaro/apiclient';
import { FC } from 'react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
  margin-bottom: ${({ theme }) => theme.spacing['2']};
`;

const Header = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
`;

export const PlayerDetails: FC<{ player: PlayerOutputDTO; pogs: PlayerOnGameserverOutputArrayDTOAPI }> = ({
  player,
  pogs,
}) => {
  const theme = useTheme();
  useDocumentTitle(player.name || 'Player Profile');

  return (
    <Container>
      <Header>
        <Avatar size="large" variant="rounded">
          <Avatar.Image src={player.steamAvatar} />
          <Avatar.FallBack>{getInitials(player.name)}</Avatar.FallBack>
        </Avatar>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
          <h1 style={{ lineHeight: 1 }}>{player.name}</h1>
          <div style={{ display: 'flex', gap: theme.spacing[2] }}>
            <Stats border={false} direction="horizontal">
              <Stats.Stat
                description="Member since"
                value={DateTime.fromISO(player.createdAt).toLocaleString({
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
              <Stats.Stat
                description="Last seen"
                value={DateTime.fromISO(player.updatedAt).toLocaleString({
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
      <HorizontalNav
        links={[
          {
            text: 'Info',
            to: '/player/$playerId/info',
            params: { playerId: player.id },
          },
          {
            text: 'Events',
            to: '/player/$playerId/events',
            params: { playerId: player.id },
          },

          {
            text: 'Economy',
            to: '/player/$playerId/economy',
            params: { playerId: player.id },
          },
        ]}
        variant="underline"
      />
    </Container>
  );
};
