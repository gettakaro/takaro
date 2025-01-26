import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Company, FormError, TextField, styled } from '@takaro/lib-components';
import { Navigate, createFileRoute } from '@tanstack/react-router';
import { useUserLinkPlayerProfile, userMeQueryOptions } from 'queries/user';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { AiOutlineLogout as LogoutIcon } from 'react-icons/ai';
import { useAuth } from 'hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

const Container = styled.div`
  max-width: 800px;
  width: 100%;
  margin-top: -300px;
`;

export const Route = createFileRoute('/_single-page/link')({
  validateSearch: z.object({
    code: z.string().optional().catch(undefined),
  }),
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

  const { data: session } = useQuery({ ...userMeQueryOptions(), initialData: loaderData?.session });

  const { control, handleSubmit, watch } = useForm<z.infer<typeof validationSchema>>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
    values: {
      code: code ? code : '',
      email: session ? session.user.email : '',
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = async ({ email, code }) => {
    mutate({ email, code });
  };

  if (isSuccess && session?.user.email === watch('email')) {
    enqueueSnackbar('Player linked successfully!', { variant: 'default', type: 'success' });
    return <Navigate to="/dashboard" />;
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
        {session && session.user.email ? (
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
            <Button fullWidth isLoading={isPending} type="submit" text="Link Player to Account" />
            <Button
              onClick={async () => await logOut()}
              variant="outline"
              color="primary"
              fullWidth
              icon={<LogoutIcon />}
              type="button"
              text="log out"
            />
          </div>
        ) : (
          <Button fullWidth isLoading={isPending} type="submit" text="Link Player to Account" />
        )}
      </form>
    </Container>
  );
}
