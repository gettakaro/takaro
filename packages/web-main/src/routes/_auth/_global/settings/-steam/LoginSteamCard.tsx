import { FC, useContext, useState, useEffect } from 'react';
import { Card, Button, styled, useTheme, Chip } from '@takaro/lib-components';
import { FaSteam as SteamIcon } from 'react-icons/fa';
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

  .steam-id {
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.colors.text};
    font-family: monospace;
  }
`;

interface LoginSteamCardProps {
  session?: MeOutputDTO;
}

export const LoginSteamCard: FC<LoginSteamCardProps> = ({ session: sessionProp }) => {
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

  const hasLinkedSteam = !!session.user.steamId;

  // Fetch settings flow to check if unlink is available
  useEffect(() => {
    if (hasLinkedSteam && oryClient) {
      oryClient
        .createBrowserSettingsFlow()
        .then(({ data }) => {
          setCanUnlink(canUnlinkProvider(data, 'steam'));
        })
        .catch(() => {
          // Settings flow fetch failed, but we can still show the update button
        });
    }
  }, [hasLinkedSteam, oryClient]);

  const handleSteamConnect = async () => {
    setIsConnecting(true);
    try {
      await initiateOryOAuth(oryClient, {
        provider: 'steam',
        returnTo: window.location.href,
        flowType: 'settings', // Use settings flow for linking social accounts
      });
    } catch {
      setIsConnecting(false);
    }
  };

  const handleSteamUnlink = async () => {
    if (!canUnlink || !oryClient) {
      return;
    }

    setIsConnecting(true);
    try {
      // Get current settings flow
      const { data: settingsFlow } = await oryClient.createBrowserSettingsFlow();

      // Unlink Steam through Ory
      await unlinkOAuthProvider(oryClient, settingsFlow, 'steam');

      // The form submission will redirect, so this won't be reached
    } catch (error: any) {
      setIsConnecting(false);

      // Show error message
      const errorMessage = error?.message || 'Failed to unlink Steam account';
      enqueueSnackbar(errorMessage, { variant: 'default', type: 'error' });
    }
  };

  return (
    <Card>
      <Card.Body>
        <InnerBody>
          <ConnectionInfo>
            <SteamIcon size={48} color={hasLinkedSteam ? colors.primary : colors.backgroundAccent} />
            <StatusText connected={hasLinkedSteam}>
              <div className="status-label">Steam Account</div>
              {hasLinkedSteam ? (
                session.user.steamId && <div className="steam-id">{session.user.steamId}</div>
              ) : (
                <Chip color="backgroundAccent" label="Not connected" />
              )}
            </StatusText>
          </ConnectionInfo>
          <Button
            onClick={hasLinkedSteam && canUnlink ? handleSteamUnlink : handleSteamConnect}
            isLoading={isConnecting}
            disabled={isConnecting}
            color={hasLinkedSteam && canUnlink ? 'error' : 'primary'}
          >
            {hasLinkedSteam ? (canUnlink ? 'Unlink Steam' : 'Update connection') : 'Connect Steam'}
          </Button>
        </InnerBody>
      </Card.Body>
    </Card>
  );
};
