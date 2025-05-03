import { useState, useMemo, useEffect } from 'react';
import { Button, TextField, styled, Company, FormError } from '@takaro/lib-components';
import { AiFillMail as Mail } from 'react-icons/ai';
import { SubmitHandler, useForm } from 'react-hook-form';
import { createFileRoute, Link, useNavigate, useRouter, useSearch } from '@tanstack/react-router';
import { handleFlowError, LoginFlow } from '@ory/client-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getApiClient } from '../util/getApiClient';
import { useAuth } from '../hooks/useAuth';
import { zodValidator } from '@tanstack/zod-adapter';
import { getOryClient } from '../util/ory';

export const Route = createFileRoute('/login')({
  validateSearch: zodValidator(
    z.object({
      redirect: z.string().optional(),
      flowId: z.string().optional(),
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
  const { flowId } = Route.useSearch();
  const [error, setError] = useState<string>();
  const oryClient = getOryClient();
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

  async function logIn(flow: string, email: string, password: string, csrf_token: string): Promise<void> {
    oryClient
      .updateLoginFlowRaw({
        flow,
        updateLoginFlowBody: {
          csrf_token,
          identifier: email,
          password,
          method: 'password',
        },
      })
      .catch(
        handleFlowError({
          onValidationError: (responseBody) => {
            setError((responseBody as any).ui.messages[0].text);
          },
          onRedirect: () => {},
          onRestartFlow: () => {},
        }),
      );

    await apiClient.user.userControllerDeleteSelectedDomainCookie();
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

  async function getOrCreateLoginFlow(flowId?: string): Promise<LoginFlow> {
    if (!flowId) {
      const loginFlow = await oryClient.createBrowserLoginFlow({ refresh: true });
      const csrfAttr = (loginFlow as LoginFlow).ui.nodes[0].attributes;
      // @ts-expect-error: ory types are incorrect
      setCsrfToken(csrfAttr.value);
      return loginFlow as LoginFlow;
    }

    const loginFlow = await oryClient
      .getLoginFlowRaw({ id: flowId })
      .then((res) => res.value())
      .catch(
        handleFlowError({
          onValidationError: () => {},
          onRestartFlow: () => {},
          onRedirect: () => {},
        }),
      );

    const csrfAttr = (loginFlow as LoginFlow).ui.nodes[0].attributes;
    // @ts-expect-error: ory types are incorrect
    setCsrfToken(csrfAttr.value);
    return loginFlow as LoginFlow;
  }

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
    } catch {
      reset();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrCreateLoginFlow(flowId).then((flow) => {
      setLoginFlow(flow);
    });
  }, []);

  return (
    <>
      <Container>
        <Company size="huge" />
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
          <Button icon={<Mail />} isLoading={loading} fullWidth text="Log in" type="submit" variant="default" />
        </form>
      </Container>
    </>
  );
}
