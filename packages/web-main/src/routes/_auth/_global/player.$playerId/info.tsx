import { IpHistoryOutputDTO } from '@takaro/apiclient';
import { Tooltip, styled } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';
import { PlayerRolesTable } from './-PlayerRolesTable';
import { FC } from 'react';
import { Section, Container, Scrollable } from './-style';
import { CountryCodeToEmoji } from 'components/CountryCodeToEmoji';
import { DateTime } from 'luxon';
import { playerQueryOptions } from 'queries/player';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/_global/player/$playerId/info')({
  component: Component,
  loader: async ({ context, params }) => context.queryClient.ensureQueryData(playerQueryOptions(params.playerId)),
});

function Component() {
  const loadedPLayer = Route.useLoaderData();
  const { playerId } = Route.useParams();

  const { data: player } = useQuery({
    ...playerQueryOptions(playerId),
    initialData: loadedPLayer,
  });

  return (
    <Scrollable>
      <Container>
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
          <IpInfoLine key={ip + '-info-line'}>
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
