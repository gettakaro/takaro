import { Stats, styled, Loading, Divider, Chip, Tooltip } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayer } from 'queries/players';
import { FC } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { DateTime } from 'luxon';
import { SiEpicgames as EpicGamesIcon } from 'react-icons/si';
import { FaSteam as SteamIcon, FaXbox as XboxIcon, FaLeaf as TakaroIcon } from 'react-icons/fa';
import { PlayerRolesTable } from './PlayerRolesTable';
import { PlayerInventoryTable } from './PlayerInventoryTable';
import { usePlayerOnGameServers } from 'queries/players/queries';
import { IpHistoryOutputDTO } from '@takaro/apiclient';
import { CountryCodeToEmoji } from 'components/countryCodeToEmoji';

export const ChipContainer = styled.div`
  display: flex;
  align-items: center;
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
    return <Loading />;
  }

  const { data, isLoading } = usePlayer(playerId);

  const { data: pogs, isLoading: isLoadingPogs } = usePlayerOnGameServers({
    filters: {
      playerId: [playerId],
    },
  });

  if (isLoading || isLoadingPogs || !data || !pogs) {
    return <Loading />;
  }

  return (
    <div>
      <h1>{data?.name}</h1>

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
        {data?.id && <Chip color="secondary" avatar={<TakaroIcon />} label={`Takaro ID: ${data.id}`} />}
        {data?.steamId && (
          <Chip
            color="secondary"
            avatar={<SteamIcon />}
            onClick={() => {
              window.open(`https://steamcommunity.com/profiles/${data?.steamId}`, '_blank');
            }}
            label={`Steam ID: ${data.steamId}`}
          />
        )}
        {data.epicOnlineServicesId && (
          <Chip color="secondary" avatar={<EpicGamesIcon />} onClick={() => {}} label={data.epicOnlineServicesId} />
        )}
        {data.xboxLiveId && <Chip color="secondary" avatar={<XboxIcon />} onClick={() => {}} label={data.xboxLiveId} />}
      </ChipContainer>
      <Divider />

      <h2>IP History</h2>
      <IpInfo ipInfo={pogs.data.map((pog) => pog.ipHistory).flat()} />

      <h2>Roles</h2>
      <PlayerRolesTable roles={data?.roleAssignments} playerId={playerId} playerName={data?.name} />

      <h2>Inventory</h2>
      <PlayerInventoryTable pogs={pogs.data} />

      <Outlet />
    </div>
  );
};
