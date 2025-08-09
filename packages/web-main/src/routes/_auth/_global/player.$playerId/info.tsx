import { IpHistoryOutputDTO, NameHistoryOutputDTO, PlayerOutputDTO } from '@takaro/apiclient';
import { Card, CopyId, Tooltip, styled, Modal, Button } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';
import { PlayerRolesTable } from './-PlayerRolesTable';
import { FC, useState } from 'react';
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
          <h2>IP History</h2>
          <IpInfo ipInfo={player.ipHistory} />
        </Section>

        <Section>
          <h2>Known Aliases</h2>
          <NameHistory nameHistory={player.nameHistory} />
        </Section>

        <Section>
          <PlayerRolesTable roles={player?.roleAssignments} playerId={playerId} playerName={player?.name} />
        </Section>
      </Container>
    </Scrollable>
  );
}

const NameHistory: FC<{ nameHistory: NameHistoryOutputDTO[] }> = ({ nameHistory }) => {
  const [showModal, setShowModal] = useState(false);

  if (!nameHistory || nameHistory.length === 0) {
    return <p>No aliases recorded</p>;
  }

  // Get first 5 unique names
  const uniqueNames = Array.from(new Set(nameHistory.map((n) => n.name)));
  const displayNames = uniqueNames.slice(0, 5);

  return (
    <>
      <Card
        variant="outline"
        style={{ cursor: displayNames.length > 5 ? 'pointer' : 'default' }}
        onClick={() => nameHistory.length > 5 && setShowModal(true)}
      >
        <Card.Body>
          <NameAliasesContainer>
            {displayNames.map((name, index) => (
              <NameAlias key={`${name}-${index}`}>
                {name}
                {index < displayNames.length - 1 && <span style={{ margin: '0 8px', opacity: 0.5 }}>•</span>}
              </NameAlias>
            ))}
            {uniqueNames.length > 5 && (
              <span style={{ marginLeft: '8px', opacity: 0.7 }}>(+{uniqueNames.length - 5} more)</span>
            )}
          </NameAliasesContainer>
        </Card.Body>
      </Card>

      <Modal open={showModal} onOpenChange={setShowModal}>
        <Modal.Content>
          <Modal.Heading>Player Name History</Modal.Heading>
          <Modal.Body>
            <NameHistoryList>
              {nameHistory.map((entry, index) => (
                <NameHistoryEntry key={`${entry.name}-${entry.createdAt}-${index}`}>
                  <span style={{ fontWeight: 500 }}>{entry.name}</span>
                  <span style={{ opacity: 0.7, fontSize: '0.9em' }}>
                    {DateTime.fromISO(entry.createdAt).toLocaleString(DateTime.DATETIME_MED)}
                  </span>
                </NameHistoryEntry>
              ))}
            </NameHistoryList>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
};

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
              <IpWhoisLink href={`https://scamalytics.com/ip/${ip.ip}`} target="_blank">
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

const NameAliasesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
`;

const NameAlias = styled.span`
  display: inline-flex;
  align-items: center;
`;

const NameHistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
  max-height: 400px;
  overflow-y: auto;
`;

const NameHistoryEntry = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing['1']} ${({ theme }) => theme.spacing['2']};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.backgroundAlt};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundAccent};
  }
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
