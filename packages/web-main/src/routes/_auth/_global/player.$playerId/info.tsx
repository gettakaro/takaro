import { IpHistoryOutputDTO, PlayerOutputDTO } from '@takaro/apiclient';
import { Card, CopyId, Tooltip, styled } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';
import { PlayerRolesTable } from './-PlayerRolesTable';
import { FC } from 'react';
import { Section, Container, Scrollable } from './-style';
import { CountryCodeToEmoji } from 'components/CountryCodeToEmoji';
import { DateTime } from 'luxon';
import { playerQueryOptions } from 'queries/players';

export const Route = createFileRoute('/_auth/_global/player/$playerId/info')({
  component: Component,
  loader: async ({ context, params }) => context.queryClient.ensureQueryData(playerQueryOptions(params.playerId)),
});

function Component() {
  const player = Route.useLoaderData();
  const { playerId } = Route.useParams();

  return (
    <Scrollable>
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

        <Section>
          <PlayerRolesTable roles={player?.roleAssignments} playerId={playerId} playerName={player?.name} />
        </Section>
      </Container>
    </Scrollable>
  );
}

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

const PlayerInfoCard: FC<{ player: PlayerOutputDTO }> = ({ player }) => {
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

const SteamInfoCard: FC<{ player: PlayerOutputDTO }> = ({ player }) => {
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

export const ChipContainer = styled.div`
  display: flex;
  flex-direction: column;
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
