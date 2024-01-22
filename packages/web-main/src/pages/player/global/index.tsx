import { styled, Tooltip, Skeleton, CopyId, Card } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { FC } from 'react';
import { useParams, useNavigate, Outlet, useOutletContext } from 'react-router-dom';
import { DateTime } from 'luxon';
import { PlayerRolesTable } from './PlayerRolesTable';
import { IpHistoryOutputDTO, PlayerOutputDTO, PlayerOutputWithRolesDTO } from '@takaro/apiclient';
import { CountryCodeToEmoji } from 'components/CountryCodeToEmoji';
import { Container, Section } from '../style';

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
  if (ipInfo.length === 0) {
    return <p>No records</p>;
  }

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

const InfoCard = styled(Card)`
  h3 {
    color: ${({ theme }) => theme.colors.textAlt};
    font-weight: 400;

    margin-bottom: ${({ theme }) => theme.spacing['1']};
  }
`;

const InfoCardBody = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: ${({ theme }) => theme.spacing['8']};
  grid-row-gap: ${({ theme }) => theme.spacing['0_75']};

  span {
    text-transform: capitalize;
  }
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(554px, max-content) max-content;
  gap: ${({ theme }) => theme.spacing['2']};
  width: 100%;
`;

export const PlayerInfoCard: FC<{ player: PlayerOutputDTO }> = ({ player }) => {
  return (
    <InfoCard variant="outline">
      <h3>General</h3>
      <InfoCardBody>
        <span>Player ID </span> <CopyId id={player.id} />
        <span>Steam ID </span> {player.steamId ? <CopyId id={player.steamId} /> : '/'}
        <span>Epic Online Services ID </span>
        {player.epicOnlineServicesId ? <CopyId id={player.epicOnlineServicesId} /> : '/'}
        <span>Xbox Live ID </span> {player.xboxLiveId ? <CopyId id={player.xboxLiveId} /> : '/'}
      </InfoCardBody>
    </InfoCard>
  );
};

export const SteamInfoCard: FC<{ player: PlayerOutputDTO }> = ({ player }) => {
  return (
    <InfoCard variant="outline" onClick={() => window.open(`https://steamcommunity.com/profiles/${player.steamId}`)}>
      <h3>Steam</h3>
      <InfoCardBody>
        <span>VAC banned</span> {player.steamVacBanned ? 'Yes' : 'No'}
        <span>VAC bans</span> {player.steamNumberOfVACBans ?? 0}
        <span>Days since last ban</span> {player.steamsDaysSinceLastBan ?? 0}
        <span>Community banned</span> {player.steamCommunityBanned ? 'Yes' : 'No'}
        <span>Economy Banned</span> {player.steamEconomyBan ? 'Yes' : 'No'}
      </InfoCardBody>
    </InfoCard>
  );
};

export const PlayerGlobalProfile: FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  if (!playerId) {
    navigate(PATHS.players());
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  const { player } = useOutletContext<{ player: PlayerOutputWithRolesDTO }>();

  if (!player) {
    return <p>Player not found</p>;
  }

  return (
    <Container>
      <Section>
        <h2>Info</h2>
        <CardContainer>
          <PlayerInfoCard player={player} />
          <SteamInfoCard player={player} />
        </CardContainer>
      </Section>
      <Section>
        <h2>IP History</h2>
        <IpInfo ipInfo={player.ipHistory} />
      </Section>

      <PlayerRolesTable roles={player?.roleAssignments} playerId={playerId} playerName={player?.name} />

      <Outlet />
    </Container>
  );
};
