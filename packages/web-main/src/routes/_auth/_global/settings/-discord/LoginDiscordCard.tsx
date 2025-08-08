import { FC, useContext, useState, useEffect } from 'react';
import { Card, Button, styled, useTheme, Chip } from '@takaro/lib-components';
import { FaDiscord as DiscordIcon } from 'react-icons/fa';
import { SessionContext } from '../../../../../hooks/useSession';
import { MeOutputDTO } from '@takaro/apiclient';
import { useOry } from '../../../../../hooks/useOry';
import { initiateOryOAuth, canUnlinkProvider, unlinkOAuthProvider } from '../../../../../util/oryOAuth';
import { useSnackbar } from 'notistack';

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
  const { oryClient } = useOry();
  const [isConnecting, setIsConnecting] = useState(false);
  const [canUnlink, setCanUnlink] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Try to use context if available, otherwise use prop
  const context = useContext(SessionContext);
  const session = sessionProp || context?.session;

  if (!session) {
    return null;
  }

  const hasLinkedDiscord = !!session.user.discordId;

  // Fetch settings flow to check if unlink is available
  useEffect(() => {
    if (hasLinkedDiscord && oryClient) {
      oryClient
        .createBrowserSettingsFlow()
        .then(({ data }) => {
          setCanUnlink(canUnlinkProvider(data, 'discord'));
        })
        .catch(() => {
          // Settings flow fetch failed, but we can still show the update button
        });
    }
  }, [hasLinkedDiscord, oryClient]);

  const handleDiscordConnect = async () => {
    setIsConnecting(true);
    try {
      await initiateOryOAuth(oryClient, {
        provider: 'discord',
        returnTo: window.location.href,
        flowType: 'settings', // Use settings flow for linking social accounts
      });
    } catch {
      setIsConnecting(false);
    }
  };

  const handleDiscordUnlink = async () => {
    if (!canUnlink || !oryClient) {
      return;
    }

    setIsConnecting(true);
    try {
      // Get current settings flow
      const { data: settingsFlow } = await oryClient.createBrowserSettingsFlow();

      // Unlink Discord through Ory
      await unlinkOAuthProvider(oryClient, settingsFlow, 'discord');

      // The form submission will redirect, so this won't be reached
    } catch (error: any) {
      setIsConnecting(false);

      // Show error message
      const errorMessage = error?.message || 'Failed to unlink Discord account';
      enqueueSnackbar(errorMessage, { variant: 'default', type: 'error' });
    }
  };

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
          <Button
            onClick={hasLinkedDiscord && canUnlink ? handleDiscordUnlink : handleDiscordConnect}
            isLoading={isConnecting}
            disabled={isConnecting}
            color={hasLinkedDiscord && canUnlink ? 'error' : 'primary'}
          >
            {hasLinkedDiscord ? (canUnlink ? 'Unlink Discord' : 'Update connection') : 'Connect Discord'}
          </Button>
        </InnerBody>
      </Card.Body>
    </Card>
  );
};
