import { IpHistoryOutputDTO, NameHistoryOutputDTO, PlayerOutputDTO } from '@takaro/apiclient';
import { Card, CopyId, Tooltip, styled } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';
import { PlayerRolesTable } from './-PlayerRolesTable';
import { FC } from 'react';
import { Section, Container, Scrollable } from './-style';
import { CountryCodeToEmoji } from '../../../../components/CountryCodeToEmoji';
import { DateTime } from 'luxon';
import { playerQueryOptions } from '../../../../queries/player';
import { useQuery } from '@tanstack/react-query';
import { AiOutlineLink as LinkIcon } from 'react-icons/ai';

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
          <h2>Info</h2>
          <CardContainer>
            <PlayerInfoCard player={player} />
            <SteamInfoCard player={player} />
          </CardContainer>
        </Section>

        <Section>
          <h2>Player History</h2>
          <HistoryContainer>
            <div>
              <h3>IP History</h3>
              <IpHistory ipInfo={player.ipHistory} />
            </div>
            <div>
              <h3>Known Aliases</h3>
              <NameHistory nameHistory={player.nameHistory} />
            </div>
          </HistoryContainer>
        </Section>

        <Section>
          <PlayerRolesTable roles={player?.roleAssignments} playerId={playerId} playerName={player?.name} />
        </Section>
      </Container>
    </Scrollable>
  );
}

const NameHistory: FC<{ nameHistory: NameHistoryOutputDTO[] }> = ({ nameHistory }) => {
  if (!nameHistory || nameHistory.length === 0) {
    return <p>No aliases recorded</p>;
  }

  return (
    <Card variant="outline">
      <Card.Body>
        <TimelineWrapper>
          <HistoryList>
            {nameHistory.map((entry, index) => {
              const isFirst = index === 0;
              const dateTime = DateTime.fromISO(entry.createdAt);
              const relativeTime = dateTime.toRelative();
              const absoluteTime = dateTime.toLocaleString(DateTime.DATETIME_MED);

              return (
                <HistoryItem key={`${entry.name}-${entry.createdAt}-${index}`}>
                  <HistoryEntry>
                    <MainText isFirst={isFirst}>{entry.name}</MainText>
                    <DateText>
                      {relativeTime} • {absoluteTime}
                    </DateText>
                  </HistoryEntry>
                </HistoryItem>
              );
            })}
          </HistoryList>
        </TimelineWrapper>
      </Card.Body>
    </Card>
  );
};

const IpHistory: FC<{ ipInfo: IpHistoryOutputDTO[] }> = ({ ipInfo }) => {
  if (!ipInfo || ipInfo.length === 0) {
    return <p>No IP records</p>;
  }

  return (
    <Card variant="outline">
      <Card.Body>
        <IpInfo ipInfo={ipInfo} />
      </Card.Body>
    </Card>
  );
};

const IpInfo: FC<{ ipInfo: IpHistoryOutputDTO[] }> = ({ ipInfo }) => {
  if (ipInfo.length === 0) {
    return <p>No records</p>;
  }

  return (
    <TimelineWrapper>
      <HistoryList>
        {ipInfo.map((ip, index) => {
          const isFirst = index === 0;
          const dateTime = DateTime.fromISO(ip.createdAt);
          const relativeTime = dateTime.toRelative();
          const absoluteTime = dateTime.toLocaleString(DateTime.DATETIME_MED);

          return (
            <HistoryItem key={`${ip.ip}-${ip.createdAt}-${index}`}>
              <HistoryEntry>
                <MainText isFirst={isFirst} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IpWhoisLink href={`https://scamalytics.com/ip/${ip.ip}`} target="_blank">
                    {ip.ip}
                  </IpWhoisLink>
                  {ip.country && (
                    <Tooltip>
                      <Tooltip.Trigger asChild>
                        <span style={{ display: 'inline-flex' }}>
                          <CountryCodeToEmoji countryCode={ip.country} />
                        </span>
                      </Tooltip.Trigger>
                      <Tooltip.Content>{ip.country}</Tooltip.Content>
                    </Tooltip>
                  )}
                </MainText>
                <DateText>
                  {ip.city && `${ip.city} • `}
                  {relativeTime} • {absoluteTime}
                </DateText>
              </HistoryEntry>
            </HistoryItem>
          );
        })}
      </HistoryList>
    </TimelineWrapper>
  );
};

const InfoCard = styled(Card)<{ clickable?: boolean }>`
  position: relative;

  h3 {
    color: ${({ theme }) => theme.colors.textAlt};
    font-weight: 400;
    margin-bottom: ${({ theme }) => theme.spacing['1']};
  }

  ${({ clickable, theme }) =>
    clickable &&
    `
      cursor: pointer;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: ${theme.colors.backgroundAlt};
      }
    `}
`;

const ExternalLinkIcon = styled(LinkIcon)`
  position: absolute;
  top: ${({ theme }) => theme.spacing['1']};
  right: ${({ theme }) => theme.spacing['1']};
  width: 16px;
  height: 16px;
  opacity: 0.5;
  color: ${({ theme }) => theme.colors.text};
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(554px, max-content) max-content;
  gap: ${({ theme }) => theme.spacing['2']};
  width: 100%;
`;

const HistoryContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing['2']};
  width: 100%;

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing['1']};
    color: ${({ theme }) => theme.colors.textAlt};
  }
`;

const InnerBody = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: ${({ theme }) => theme.spacing['8']};
  grid-row-gap: ${({ theme }) => theme.spacing['0_75']};
`;

const PlayerInfoCard: FC<{ player: PlayerOutputDTO }> = ({ player }) => {
  return (
    <InfoCard variant="outline">
      <InfoCard.Title label="General" />
      <InfoCard.Body>
        <InnerBody>
          <span>Player ID </span> <CopyId id={player.id} />
          <span>Steam ID </span>{' '}
          {player.steamId ? (
            <CopyId
              id={player.steamId}
              externalLink={`https://steamcommunity.com/profiles/${player.steamId}`}
              externalLinkTooltip="View Steam profile"
            />
          ) : (
            '/'
          )}
          <span>Epic Online Services ID </span>
          {player.epicOnlineServicesId ? <CopyId id={player.epicOnlineServicesId} /> : '/'}
          <span>Xbox Live ID </span> {player.xboxLiveId ? <CopyId id={player.xboxLiveId} /> : '/'}
          <span>Platform ID </span> {player.platformId ? <CopyId id={player.platformId} /> : '/'}
        </InnerBody>
      </InfoCard.Body>
    </InfoCard>
  );
};

const SteamInfoCard: FC<{ player: PlayerOutputDTO }> = ({ player }) => {
  return (
    <InfoCard
      variant="outline"
      clickable
      onClick={() => window.open(`https://steamcommunity.com/profiles/${player.steamId}`)}
    >
      <InfoCard.Title label="Steam" />
      <InfoCard.Body>
        <InnerBody>
          <span>VAC banned</span> {player.steamVacBanned ? 'Yes' : 'No'}
          <span>VAC bans</span> {player.steamNumberOfVACBans ?? 0}
          <span>Days since last ban</span> {player.steamsDaysSinceLastBan ?? 0}
          <span>Community banned</span> {player.steamCommunityBanned ? 'Yes' : 'No'}
          <span>Economy Banned</span> {player.steamEconomyBan ? 'Yes' : 'No'}
        </InnerBody>
      </InfoCard.Body>
      <ExternalLinkIcon />
    </InfoCard>
  );
};

export const ChipContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing['1']};
`;

const TimelineWrapper = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing['0_5']};

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.backgroundAccent};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.textAlt};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.colors.text};
    }
  }
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const HistoryItem = styled.li`
  padding: ${({ theme }) => theme.spacing['1']} 0;
`;

const HistoryEntry = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['0_25']};
`;

const MainText = styled.div<{ isFirst?: boolean }>`
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ isFirst }) => (isFirst ? 500 : 400)};
  ${({ isFirst, theme }) =>
    isFirst &&
    `
    &::after {
      content: ' (current)';
      color: ${theme.colors.primary};
      font-weight: 400;
      font-size: 0.9em;
    }
  `}
`;

const DateText = styled.div`
  color: ${({ theme }) => theme.colors.textAlt};
  opacity: 0.8;
  font-size: 0.9em;
`;

const IpWhoisLink = styled.a`
  color: inherit;
  text-decoration: underline;
  text-decoration-color: ${({ theme }) => theme.colors.primary};
  text-underline-offset: 2px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
