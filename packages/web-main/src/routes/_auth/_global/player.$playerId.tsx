import {
  Stats,
  styled,
  Skeleton,
  useTheme,
  Avatar,
  getInitials,
  HorizontalNav,
  CopyId,
  Tooltip,
} from '@takaro/lib-components';
import { Outlet, redirect, createFileRoute, Link } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import { playerQueryOptions } from 'queries/player';
import { playersOnGameServersQueryOptions } from 'queries/pog';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { hasPermission } from 'hooks/useHasPermission';
import { userMeQueryOptions } from 'queries/user';
import { GameServerSelectQueryField } from 'components/selects';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const searchSchema = z.object({
  gameServerId: z.string().optional().catch(''),
});

export const Route = createFileRoute('/_auth/_global/player/$playerId')({
  validateSearch: searchSchema,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_PLAYERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => {
    const [player, pogs] = await Promise.all([
      context.queryClient.ensureQueryData(playerQueryOptions(params.playerId)),
      context.queryClient.ensureQueryData(
        playersOnGameServersQueryOptions({ filters: { playerId: [params.playerId] } }),
      ),
    ]);
    return { player, pogs };
  },
  component: Component,
  pendingComponent: () => <Skeleton variant="rectangular" width="100%" height="100%" />,
});

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
`;

function Component() {
  const { playerId } = Route.useParams();
  const { player, pogs } = Route.useLoaderData();
  useDocumentTitle(player.name || 'Player Profile');
  const theme = useTheme();
  const search = Route.useSearch();

  const { control, watch } = useForm<{ gameServerId: string | undefined }>({
    mode: 'onChange',
    defaultValues: {
      gameServerId: search.gameServerId,
    },
  });
  const gameServerId = watch('gameServerId');

  return (
    <Container>
      <header style={{ display: 'flex', gap: theme.spacing['1'] }}>
        <Avatar size="large" variant="rounded">
          <Avatar.Image src={player.steamAvatar} />
          <Avatar.FallBack>{getInitials(player.name)}</Avatar.FallBack>
        </Avatar>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
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
      </header>

      <div style={{ display: 'flex', gap: theme.spacing[1] }}>
        {player.epicOnlineServicesId && (
          <CopyId id={player.epicOnlineServicesId} placeholder={`EOS ID: ${player.epicOnlineServicesId}`} />
        )}
        {player.steamId && <CopyId id={player.steamId} placeholder={`Steam ID: ${player.steamId}`} />}
        {player.xboxLiveId && <CopyId id={player.xboxLiveId} placeholder={`Steam ID: ${player.xboxLiveId}`} />}
      </div>
      <GameServerSelectQueryField
        name="gameServerId"
        control={control}
        filter={(gameServer) => pogs.data.map((pog) => pog.gameServerId).includes(gameServer.id)}
      />

      <HorizontalNav variant="underline">
        <Link to="/player/$playerId/statistics" params={{ playerId }}>
          Statistics
        </Link>
        {gameServerId ? (
          <Link to="/player/$playerId/$gameServerId" params={{ playerId, gameServerId: gameServerId }}>
            player on gameserver
          </Link>
        ) : (
          <Tooltip>
            <Tooltip.Trigger asChild>
              <div style={{ color: theme.colors.textAlt }}>player on gameserver</div>
            </Tooltip.Trigger>
            <Tooltip.Content>Select gameserver to view page</Tooltip.Content>
          </Tooltip>
        )}
      </HorizontalNav>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </Container>
  );
}

//const InfoCard = styled(Card)`
//  h3 {
//    color: ${({ theme }) => theme.colors.textAlt};
//    font-weight: 400;
//
//    margin-bottom: ${({ theme }) => theme.spacing['1']};
//  }
//`;
//
//const InfoCardBody = styled.div`
//  display: grid;
//  grid-template-columns: max-content 1fr;
//  gap: ${({ theme }) => theme.spacing['8']};
//  grid-row-gap: ${({ theme }) => theme.spacing['0_75']};
//
//  span {
//    text-transform: capitalize;
//  }
//`;

//const SteamInfoCard: FC<{ player: PlayerOutputWithRolesDTO }> = ({ player }) => {
//  return (
//    <InfoCard variant="outline" onClick={() => window.open(`https://steamcommunity.com/profiles/${player.steamId}`)}>
//      <h3>Steam</h3>
//      <InfoCardBody>
//        <span>VAC banned</span> {player.steamVacBanned ? 'Yes' : 'No'}
//        <span>VAC bans</span> {player.steamNumberOfVACBans ?? 0}
//        <span>Days since last ban</span> {player.steamsDaysSinceLastBan ?? 0}
//        <span>Community banned</span> {player.steamCommunityBanned ? 'Yes' : 'No'}
//        <span>Economy Banned</span> {player.steamEconomyBan ? 'Yes' : 'No'}
//      </InfoCardBody>
//    </InfoCard>
//  );
//};

//const IpInfo: FC<{ ipInfo: IpHistoryOutputDTO[] }> = ({ ipInfo }) => {
//  if (ipInfo.length === 0) {
//    return <p>No records</p>;
//  }
//
//  return (
//    <IpInfoContainer>
//      {ipInfo.map((ip) => {
//        return (
//          <IpInfoLine key={ip + '-info-line'}>
//            <Tooltip>
//              <Tooltip.Trigger asChild>
//                <CountryCodeToEmoji countryCode={ip.country} />
//              </Tooltip.Trigger>
//              <Tooltip.Content>{ip.country}</Tooltip.Content>
//            </Tooltip>
//            <span>{DateTime.fromISO(ip.createdAt).toLocaleString(DateTime.DATETIME_MED)}</span>
//            <span>{ip.city}</span>
//          </IpInfoLine>
//        );
//      })}
//    </IpInfoContainer>
//  );
//};
