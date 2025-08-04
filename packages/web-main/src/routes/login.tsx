import { useState, useMemo, useEffect } from 'react';
import { Alert, Button, TextField, styled, Company, FormError } from '@takaro/lib-components';
import { AiFillMail as Mail } from 'react-icons/ai';
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
  const { oryClient } = useOry();
  const apiClient = getApiClient();
  const search = useSearch({ from: '/login' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();

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

  useEffect(() => {
    if (loginFlow) {
      const csrfAttr = loginFlow.ui.nodes[0].attributes;
      // @ts-expect-error Bad ory client types :(
      setCsrfToken(csrfAttr.value);
    } else {
      createLoginFlow().then((flow) => {
        setLoginFlow(flow);
        const csrfAttr = flow.ui.nodes[0].attributes;
        // @ts-expect-error Bad ory client types :(
        setCsrfToken(csrfAttr.value);
      });
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

  return (
    <>
      <Container>
        <Company size="huge" />
        <Alert
          variant="info"
          title="Takaro is Invite Only"
          text='Are you a player? Use the "link" command in-game to get an invite link. Are you a server admin? Join our Discord and ask for an invite!'
        />
        {/* 
          <Button
            color="primary"
            icon={<Google />}
            text="Log in with Google"
            variant="default"
          />
          <Button
            color="primary"
            icon={<Discord />}
            text="Log in with Discord"
            variant="default"
          />
          <Divider
            label={{ labelPosition: 'center', text: 'or' }}
            size="huge"
          />
        */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField control={control} label="Email" loading={loading} name="email" placeholder="hi cutie" required />
          <LessMargin>
            <TextField control={control} label="Password" loading={loading} name="password" required type="password" />
          </LessMargin>
          <LinkContainer>
            <Link to="/account/recovery">Forgot your password?</Link>
          </LinkContainer>
          {error && <FormError error={error} />}
          <Button icon={<Mail />} isLoading={loading} fullWidth type="submit" variant="default">
            Log in
          </Button>
        </form>
      </Container>
    </>
  );
}
