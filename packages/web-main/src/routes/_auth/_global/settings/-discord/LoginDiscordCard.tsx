import { FC, useContext } from 'react';
import { Card, Button, styled, useTheme, Chip } from '@takaro/lib-components';
import { FaDiscord as DiscordIcon } from 'react-icons/fa';
import { getConfigVar } from '../../../../../util/getConfigVar';
import { SessionContext } from '../../../../../hooks/useSession';
import { MeOutputDTO } from '@takaro/apiclient';

const InnerBody = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ConnectionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex: 1;
`;

const StatusText = styled.div<{ connected: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[0.5]};

  .status-label {
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.colors.textAlt};
    font-weight: 500;
  }

  .discord-id {
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.colors.text};
    font-family: monospace;
  }
`;

interface LoginDiscordCardProps {
  session?: MeOutputDTO;
}

export const LoginDiscordCard: FC<LoginDiscordCardProps> = ({ session: sessionProp }) => {
  const { colors } = useTheme();

  // Try to use context if available, otherwise use prop
  const context = useContext(SessionContext);
  const session = sessionProp || context?.session;

  if (!session) {
    return null;
  }

  const hasLinkedDiscord = !!session.user.discordId;

  return (
    <Card>
      <Card.Body>
        <InnerBody>
          <ConnectionInfo>
            <DiscordIcon size={48} color={hasLinkedDiscord ? colors.primary : colors.backgroundAccent} />
            <StatusText connected={hasLinkedDiscord}>
              <div className="status-label">Discord Account</div>
              {hasLinkedDiscord ? (
                <>
                  <Chip color="success" label="Connected" />
                  {session.user.discordId && <div className="discord-id">ID: {session.user.discordId}</div>}
                </>
              ) : (
                <Chip color="backgroundAccent" label="Not connected" />
              )}
            </StatusText>
          </ConnectionInfo>
          <a href={`${getConfigVar('apiUrl')}/auth/discord?redirect=${window.location.href}`}>
            <Button>{hasLinkedDiscord ? 'Update connection' : 'Connect Discord'}</Button>
          </a>
        </InnerBody>
      </Card.Body>
    </Card>
  );
};
