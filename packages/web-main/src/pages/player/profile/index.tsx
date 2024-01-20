import { styled, Tooltip, Skeleton } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayer } from 'queries/players';
import { FC } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { DateTime } from 'luxon';
// import { SiEpicgames as EpicGamesIcon } from 'react-icons/si';
// import { FaSteam as SteamIcon, FaXbox as XboxIcon, FaLeaf as TakaroIcon } from 'react-icons/fa';
import { PlayerRolesTable } from './PlayerRolesTable';
import { usePlayerOnGameServers } from 'queries/players/queries';
import { IpHistoryOutputDTO } from '@takaro/apiclient';
import { CountryCodeToEmoji } from 'components/CountryCodeToEmoji';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { Section } from './style';

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

  return (
    <>
      <Section>
        <h2>IP History</h2>
        <IpInfo ipInfo={pogs.data.map((pog) => pog.ipHistory).flat()} />
      </Section>

      <PlayerRolesTable roles={player?.roleAssignments} playerId={playerId} playerName={player?.name} />

      <Outlet />
    </>
  );
};
