import { useState, useMemo, useEffect, useRef } from 'react';
import { Alert, Button, TextField, styled, Company, FormError, Divider } from '@takaro/lib-components';
import { AiFillMail as Mail } from 'react-icons/ai';
import { FaDiscord as DiscordIcon, FaSteam as SteamIcon } from 'react-icons/fa';
import { SubmitHandler, useForm } from 'react-hook-form';
import { createFileRoute, Link, useNavigate, useRouter, useSearch } from '@tanstack/react-router';
import { LoginFlow } from '@ory/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useOry } from '../hooks/useOry';
import { getApiClient } from '../util/getApiClient';
import { useAuth } from '../hooks/useAuth';
import { zodValidator } from '@tanstack/zod-adapter';
import { initiateOryOAuth, isOAuthCallback } from '../util/oryOAuth';

export const Route = createFileRoute('/login')({
  validateSearch: zodValidator(
    z.object({
      redirect: z.string().optional(),
    }),
  ),
  component: Component,
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  max-width: 600px;
  text-align: center;
  margin: -200px auto 0 auto;
  gap: ${({ theme }) => theme.spacing[6]};
`;

const LessMargin = styled.div`
  div {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }
`;

const LinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing['1_5']};

  a {
    font-size: ${({ theme }) => theme.fontSize.tiny};
  }
`;

const LoginOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
`;

interface IFormInputs {
  email: string;
  password: string;
  csrf_token: string;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Component() {
  useDocumentTitle('Log in');

  const [loading, setLoading] = useState(false);
  const [loginFlow, setLoginFlow] = useState<LoginFlow>();
  const [csrfToken, setCsrfToken] = useState<string>();
  const [error, setError] = useState<string>();
  const [discordLoading, setDiscordLoading] = useState(false);
  const [steamLoading, setSteamLoading] = useState(false);
  const { oryClient } = useOry();
  const apiClient = getApiClient();
  const search = useSearch({ from: '/login' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const hasProcessedOAuthCallback = useRef(false);

  const validationSchema = useMemo(
    () =>
      z.object({
        email: z.string().email('This is not a valid email address.').min(1, { message: 'Email is a required field.' }),
        password: z.string().min(1, { message: 'Password is a required field' }),
      }),
    [],
  );

  async function createLoginFlow() {
    const res = await oryClient.createBrowserLoginFlow({
      refresh: true,
    });
    return res.data;
  }

  async function logIn(flow: string, email: string, password: string, csrf_token: string): Promise<void> {
    await oryClient.updateLoginFlow({
      flow,
      updateLoginFlowBody: {
        csrf_token,
        identifier: email,
        password,
        method: 'password',
      },
    });
    const res = await apiClient.user.userControllerMe({
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    login(res.data.data);
    await router.invalidate();
    // hack to wait for auth state to update???
    await sleep(500);
    await navigate({ to: search.redirect ?? '/' });
  }

  // Initialize login flow and handle OAuth callbacks
  useEffect(() => {
    const initializeLogin = async () => {
      // Check if this is an OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const flowId = urlParams.get('flow');

      if (flowId && isOAuthCallback() && !hasProcessedOAuthCallback.current) {
        hasProcessedOAuthCallback.current = true;
        // This is an OAuth callback, fetch the flow to check its state
        try {
          const flowResponse = await oryClient.getLoginFlow({ id: flowId });
          const flow = flowResponse.data;
          setLoginFlow(flow);

          // Check if authentication was successful
          if (flow.ui.messages && flow.ui.messages.some((msg) => msg.id === 4000010)) {
            // Session exists, user is authenticated
            try {
              const res = await apiClient.user.userControllerMe({
                headers: {
                  'Cache-Control': 'no-cache',
                },
              });
              login(res.data.data);
              await router.invalidate();
              await sleep(500);
              await navigate({ to: search.redirect ?? '/' });
            } catch (error) {
              console.error('Failed to fetch user after OAuth login:', error);
              setError('Authentication successful but failed to load user data. Please try again.');
            }
          } else if (flow.ui.messages && flow.ui.messages.length > 0) {
            // There are error messages from the OAuth flow
            const errorMessages = flow.ui.messages
              .filter((msg) => msg.type === 'error')
              .map((msg) => msg.text)
              .join(' ');
            setError(errorMessages || 'OAuth authentication failed. Please try again.');
          }

          // Extract CSRF token
          const csrfNode = flow.ui.nodes.find(
            (node) => node.attributes && 'name' in node.attributes && node.attributes.name === 'csrf_token',
          );
          if (csrfNode && 'value' in csrfNode.attributes) {
            setCsrfToken(csrfNode.attributes.value as string);
          }
        } catch (error) {
          console.error('Failed to fetch login flow:', error);
          // Create a new flow if fetching failed
          const flow = await createLoginFlow();
          setLoginFlow(flow);
          const csrfNode = flow.ui.nodes.find(
            (node) => node.attributes && 'name' in node.attributes && node.attributes.name === 'csrf_token',
          );
          if (csrfNode && 'value' in csrfNode.attributes) {
            setCsrfToken(csrfNode.attributes.value as string);
          }
        }
      } else if (!flowId) {
        // Not an OAuth callback, check for existing session first
        try {
          const res = await apiClient.user.userControllerMe({
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
          // User is already authenticated, redirect them
          login(res.data.data);
          await router.invalidate();
          await sleep(500);
          await navigate({ to: search.redirect ?? '/' });
        } catch {
          // User is not authenticated, create login flow
          const flow = await createLoginFlow();
          setLoginFlow(flow);
          const csrfNode = flow.ui.nodes.find(
            (node) => node.attributes && 'name' in node.attributes && node.attributes.name === 'csrf_token',
          );
          if (csrfNode && 'value' in csrfNode.attributes) {
            setCsrfToken(csrfNode.attributes.value as string);
          }
        }
      }
    };

    initializeLogin();
  }, [apiClient, login, navigate, router, search.redirect, oryClient]);

  // Update CSRF token when login flow changes
  useEffect(() => {
    if (loginFlow) {
      const csrfNode = loginFlow.ui.nodes.find(
        (node) => node.attributes && 'name' in node.attributes && node.attributes.name === 'csrf_token',
      );
      if (csrfNode && 'value' in csrfNode.attributes) {
        setCsrfToken(csrfNode.attributes.value as string);
      }
    }
  }, [loginFlow]);

  const { control, handleSubmit, reset } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ email, password }) => {
    setLoading(true);
    setError(undefined);
    try {
      if (loginFlow?.id && csrfToken) {
        await logIn(loginFlow.id, email, password, csrfToken);
      }
    } catch (error) {
      reset();
      console.log(error);

      if (isAxiosError(error)) {
        // Check if this is an error from the Ory flow (has ui.messages)
        if (error.response?.data?.ui?.messages) {
          setError(error.response.data.ui.messages.map((message) => message.text));
        }
        // Check if this is an error from our API (has meta.error.message)
        else if (error.response?.data?.meta?.error?.message) {
          setError(error.response.data.meta.error.message);
        }
        // Fallback to generic error message
        else {
          setError('An error occurred during login. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    if (!loginFlow || !oryClient) {
      return;
    }

    setDiscordLoading(true);
    setError(undefined);

    try {
      await initiateOryOAuth(oryClient, {
        provider: 'discord',
        returnTo: search.redirect ?? '/',
        loginFlow,
        flowType: 'login',
      });
    } catch (error) {
      setDiscordLoading(false);
      console.error('Discord login failed:', error);
      setError('Failed to initiate Discord login. Please try again.');
    }
  };

  const handleSteamLogin = async () => {
    if (!loginFlow || !oryClient) {
      return;
    }

    setSteamLoading(true);
    setError(undefined);

    try {
      await initiateOryOAuth(oryClient, {
        provider: 'steam',
        returnTo: search.redirect ?? '/',
        loginFlow,
        flowType: 'login',
      });
    } catch (error) {
      setSteamLoading(false);
      console.error('Steam login failed:', error);
      setError('Failed to initiate Steam login. Please try again.');
    }
  };

  return (
    <>
      <Container>
        <Company size="huge" />
        <Alert
          variant="info"
          title="Takaro is Invite Only"
          text='Are you a player? Use the "link" command in-game to get an invite link. Are you a server admin? Join our Discord and ask for an invite!'
        />
        <LoginOptions>
          <Button
            color="primary"
            icon={<DiscordIcon />}
            variant="default"
            onClick={handleDiscordLogin}
            isLoading={discordLoading}
            disabled={loading || discordLoading || steamLoading || !loginFlow}
            fullWidth
          >
            Log in with Discord
          </Button>
          <Button
            color="primary"
            icon={<SteamIcon />}
            variant="default"
            onClick={handleSteamLogin}
            isLoading={steamLoading}
            disabled={loading || discordLoading || steamLoading || !loginFlow}
            fullWidth
          >
            Log in with Steam
          </Button>
          <Divider label={{ labelPosition: 'center', text: 'or' }} />
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField control={control} label="Email" loading={loading} name="email" placeholder="hi cutie" required />
            <LessMargin>
              <TextField
                control={control}
                label="Password"
                loading={loading}
                name="password"
                required
                type="password"
              />
            </LessMargin>
            <LinkContainer>
              <Link to="/account/recovery">Forgot your password?</Link>
            </LinkContainer>
            {error && <FormError error={error} />}
            <Button icon={<Mail />} isLoading={loading} fullWidth type="submit" variant="default">
              Log in
            </Button>
          </form>
        </LoginOptions>
      </Container>
    </>
  );
}
