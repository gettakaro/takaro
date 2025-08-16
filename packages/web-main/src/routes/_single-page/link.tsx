import { Alert, Button, Company, FormError, TextField, styled, Divider } from '@takaro/lib-components';
import { Navigate, createFileRoute } from '@tanstack/react-router';
import { useUserLinkPlayerProfile, userMeQueryOptions } from '../../queries/user';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { AiOutlineLogout as LogoutIcon } from 'react-icons/ai';
import { FaSteam as SteamIcon } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { zodValidator } from '@tanstack/zod-adapter';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginDiscordCard } from '../_auth/_global/settings/-discord/LoginDiscordCard';
import { LoginSteamCard } from '../_auth/_global/settings/-steam/LoginSteamCard';
import { useOry } from '../../hooks/useOry';
import { initiateOryOAuth } from '../../util/oryOAuth';
import { useState, useEffect } from 'react';
import { LoginFlow } from '@ory/client';

const Container = styled.div`
  max-width: 800px;
  width: 100%;
  margin-top: -300px;
`;

export const Route = createFileRoute('/_single-page/link')({
  validateSearch: zodValidator(
    z.object({
      code: z.string().catch(''),
    }),
  ),
  component: Component,
  loader: async ({ context }) => {
    try {
      const session = await context.queryClient.fetchQuery(userMeQueryOptions());
      if (session) {
        return { session: session };
      }
    } catch {
      return undefined;
    }
  },
});

const validationSchema = z.object({
  code: z
    .string()
    .regex(new RegExp('^[a-z0-9]+(?:-[a-z0-9]+){2}$'), 'Expected code with pattern word-word-word')
    .min(1),
  email: z.string().email().min(1),
});

function Component() {
  const { code } = Route.useSearch();
  const loaderData = Route.useLoaderData();
  const { mutate, isPending, error, isSuccess } = useUserLinkPlayerProfile();
  const { enqueueSnackbar } = useSnackbar();
  const { logOut } = useAuth();
  const { oryClient } = useOry();
  const [steamLoading, setSteamLoading] = useState(false);
  const [loginFlow, setLoginFlow] = useState<LoginFlow | null>(null);

  const { data: session } = useQuery({ ...userMeQueryOptions(), initialData: loaderData?.session });

  // Initialize login flow for non-logged-in users
  useEffect(() => {
    if (!session && oryClient) {
      oryClient
        .createBrowserLoginFlow({ refresh: true, returnTo: window.location.href })
        .then(({ data }) => setLoginFlow(data))
        .catch(() => {
          // Failed to create login flow, but user can still use manual linking
        });
    }
  }, [session, oryClient]);

  const { control, handleSubmit, watch } = useForm<z.infer<typeof validationSchema>>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
    values: {
      code: code ? code : '',
      email: session ? session.user.email || '' : '',
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = async ({ email, code }) => {
    mutate({ email, code });
  };

  const handleSteamLogin = async () => {
    if (!loginFlow || !oryClient) {
      return;
    }

    setSteamLoading(true);

    try {
      await initiateOryOAuth(oryClient, {
        provider: 'steam',
        returnTo: window.location.href,
        loginFlow,
        flowType: 'login',
      });
    } catch (error) {
      setSteamLoading(false);
      console.error('Steam login failed:', error);
      enqueueSnackbar('Failed to initiate Steam login. Please try again.', { variant: 'default', type: 'error' });
    }
  };

  if (isSuccess && session?.user.email === watch('email')) {
    enqueueSnackbar('Player linked successfully!', { variant: 'default', type: 'success' });
    return <Navigate to="/" />;
  }

  if (isSuccess) {
    return (
      <Container>
        <Company />
        <Alert
          variant="info"
          text="Player linked successfully! Please check your email to verify your account. You can close this page!"
        />
      </Container>
    );
  }

  return (
    <Container>
      <Company />

      <Alert
        variant="info"
        text="Connect your player profile to Takaro to purchase items in gameshops and to view stats!"
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          loading={isPending}
          control={control}
          name="code"
          label="Code"
          required
          placeholder="takaro-is-cool"
        />
        <TextField
          readOnly={session && !!session.user.email}
          description={
            session && !!session.user.email
              ? 'If you want to link a player to a different email, please log out first.'
              : undefined
          }
          loading={isPending}
          control={control}
          name="email"
          label="Email"
          required
          type="email"
          placeholder="email@takaro.io"
        />
        {error && <FormError error={error} />}
        {/* Show Steam login option for non-logged-in users */}
        {!session && (
          <>
            <Divider label={{ labelPosition: 'center', text: 'OR' }} />
            <Alert
              variant="info"
              text="If you play on Steam, you can login with your Steam account to automatically link your player profile."
            />
            <Button
              fullWidth
              onClick={handleSteamLogin}
              isLoading={steamLoading}
              disabled={steamLoading || !loginFlow}
              icon={<SteamIcon />}
              color="primary"
            >
              Login with Steam to Auto-Link
            </Button>
          </>
        )}
        {session && session.user.email ? (
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
            <Button fullWidth isLoading={isPending} type="submit">
              Link Player to Account
            </Button>
            <Button
              onClick={async () => await logOut()}
              variant="outline"
              color="primary"
              fullWidth
              icon={<LogoutIcon />}
              type="button"
            >
              Log out
            </Button>
          </div>
        ) : (
          <Button fullWidth isLoading={isPending} type="submit">
            Link Player to Account
          </Button>
        )}
      </form>

      {/* Add Discord linking section for logged-in users */}
      {session && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Connect Discord Account</h2>
          <p>Link your Discord account to unlock Discord-based features and integrations.</p>
          <LoginDiscordCard session={session} />
        </div>
      )}

      {/* Add Steam linking section for logged-in users */}
      {session && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Connect Steam Account</h2>
          <p>Link your Steam account to enable Steam-based authentication and features.</p>
          <LoginSteamCard session={session} />
        </div>
      )}
    </Container>
  );
}
