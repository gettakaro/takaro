import { Stats, styled, Divider, Chip, Tooltip, Skeleton } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayer } from 'queries/players';
import { FC } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { DateTime } from 'luxon';
// import { SiEpicgames as EpicGamesIcon } from 'react-icons/si';
// import { FaSteam as SteamIcon, FaXbox as XboxIcon, FaLeaf as TakaroIcon } from 'react-icons/fa';
import { PlayerRolesTable } from './PlayerRolesTable';
import { PlayerInventoryTable } from './PlayerInventoryTable';
import { usePlayerOnGameServers } from 'queries/players/queries';
import { IpHistoryOutputDTO } from '@takaro/apiclient';
import { CountryCodeToEmoji } from 'components/CountryCodeToEmoji';
import { EventFeedWidget } from 'components/events/EventFeedWidget';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

export const ChipContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing['1']};
`;

const IpInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
  margin-bottom: ${({ theme }) => theme.spacing['2']};
`;

const IpInfoLine = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing['0_5']};
`;

const IpWhoisLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
`;

const EventWidgetContainer = styled.div`
  height: 100px;
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const IpInfo: FC<{ ipInfo: IpHistoryOutputDTO[] }> = ({ ipInfo }) => {
  return (
    <IpInfoContainer>
      {ipInfo.map((ip) => {
        return (
          <IpInfoLine>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <CountryCodeToEmoji countryCode={ip.country} />
              </Tooltip.Trigger>
              <Tooltip.Content>{ip.country}</Tooltip.Content>
            </Tooltip>
            <span>{DateTime.fromISO(ip.createdAt).toLocaleString(DateTime.DATETIME_MED)}</span>
            <span>
              <IpWhoisLink href={`https://www.whois.com/whois/${ip.ip}`} target="_blank">
                {ip.ip}
              </IpWhoisLink>
            </span>
            <span>{ip.city}</span>
          </IpInfoLine>
        );
      })}
    </IpInfoContainer>
  );
};

export const PlayerProfile: FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  if (!playerId) {
    navigate(PATHS.players());
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  const { data, isLoading } = usePlayer(playerId);

  const { data: pogs, isLoading: isLoadingPogs } = usePlayerOnGameServers({
    filters: {
      playerId: [playerId],
    },
  });

  useDocumentTitle(data?.name || 'Player Profile');

  if (isLoading || isLoadingPogs || !data || !pogs) {
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  return (
    <div>
      <h1>{data?.name}</h1>
      <Columns>
        <div style={{ maxWidth: '800px' }}>
          <Stats border={false} direction="horizontal">
            <Stats.Stat
              description="Member since"
              value={DateTime.fromISO(data?.createdAt).toLocaleString({
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            />
            <Stats.Stat
              description="Last seen"
              value={DateTime.fromISO(data?.updatedAt).toLocaleString({
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            />
          </Stats>
        </div>
        <ChipContainer>
          {data?.id && <Chip color="secondary" label={`Takaro ID: ${data.id}`} />}
          {data?.steamId && (
            <Chip
              color="secondary"
              onClick={() => {
                window.open(`https://steamcommunity.com/profiles/${data?.steamId}`, '_blank');
              }}
              label={`Steam ID: ${data.steamId}`}
            />
          )}
          {data.epicOnlineServicesId && <Chip color="secondary" onClick={() => {}} label={data.epicOnlineServicesId} />}
          {data.xboxLiveId && <Chip color="secondary" onClick={() => {}} label={data.xboxLiveId} />}
        </ChipContainer>
      </Columns>

      <Divider />

      <h2>IP History</h2>
      <IpInfo ipInfo={pogs.data.map((pog) => pog.ipHistory).flat()} />

      <PlayerRolesTable roles={data?.roleAssignments} playerId={playerId} playerName={data?.name} />

      <Columns>
        <h2>Inventory</h2>
        <PlayerInventoryTable pogs={pogs.data} />

        <EventWidgetContainer>
          <EventFeedWidget query={{ filters: { playerId: [playerId] } }} />
        </EventWidgetContainer>
      </Columns>

      <Outlet />
    </div>
  );
};
