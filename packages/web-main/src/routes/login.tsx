import { useState, useMemo, useEffect } from 'react';
import { Button, TextField, styled, errors, Company, FormError } from '@takaro/lib-components';
import { AiFillMail as Mail } from 'react-icons/ai';
import { SubmitHandler, useForm } from 'react-hook-form';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LoginFlow } from '@ory/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { useOry } from 'hooks/useOry';
import { getApiClient } from 'util/getApiClient';
import { useAuth } from 'hooks/useAuth';
import { flushSync } from 'react-dom';

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    redirect: z.string().catch('/dashboard'),
  }),
  component: Component,
});

/*
const StyledLink = styled(Link)`
  width: 100%;
  display: block;
  text-align: left;
  margin-top: -1.5rem;
  margin-bottom: 2.5rem;

  &:hover {
    text-decoration: underline;
  }
`;
*/

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

interface IFormInputs {
  email: string;
  password: string;
  csrf_token: string;
}

function Component() {
  useDocumentTitle('Log in');

  const [loading, setLoading] = useState(false);
  const [loginFlow, setLoginFlow] = useState<LoginFlow>();
  const [csrfToken, setCsrfToken] = useState<string>();
  const [error, setError] = useState<string>();
  const { oryClient } = useOry();
  const apiClient = getApiClient();
  const search = Route.useSearch();
  const { setSession, session } = useAuth();
  const navigate = useNavigate();

  const validationSchema = useMemo(
    () =>
      z.object({
        email: z.string().email('This is not a valid email address.').min(1, { message: 'Email is a required field.' }),
        password: z.string().min(1, { message: 'Password is a required field' }),
      }),
    []
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
    flushSync(() => {
      setSession(res.data.data);
    });
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
      if (loginFlow?.id) {
        await logIn(loginFlow?.id, email, password, csrfToken!);
      }
    } catch (error) {
      reset();

      if (error instanceof AxiosError) {
        const err = errors.defineErrorType(error);

        if (err instanceof errors.NotAuthorizedError) {
          setError('Incorrect email or password.');
          return;
        }
        if (err instanceof errors.ResponseClientError) {
          setError('Something went wrong processing your request.');
        }
      } else {
        setError('Incorrect email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // session == successfully logged in
  if (session) {
    console.log('fired');
    // redirect is always defined
    navigate({ to: search.redirect });
  }

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
          <TextField control={control} label="Password" loading={loading} name="password" required type="password" />
          {/* <StyledLink to="/account/recovery">Forgot your password?</StyledLink> */}
          {error && <FormError error={error} />}
          <Button
            icon={<Mail />}
            isLoading={loading}
            fullWidth
            text="Log in with Email"
            type="submit"
            variant="default"
          />
        </form>
      </Container>
    </>
  );
}
