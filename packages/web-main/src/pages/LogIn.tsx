import { FC, useState, useMemo, useEffect } from 'react';
import {
  Button,
  Divider,
  TextField,
  ErrorMessage,
  styled,
  errors,
  Company,
} from '@takaro/lib-components';
import { Helmet } from 'react-helmet';
import { FaDiscord as Discord, FaGoogle as Google } from 'react-icons/fa';
import { AiFillMail as Mail } from 'react-icons/ai';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth';
import { useUser } from 'hooks/useUser';
import { PATHS } from 'paths';
import { Page } from './Page';
import { LoginFlow } from '@ory/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

const Wrapper = styled.div`
  padding: 5rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 2rem;
  margin-bottom: 5rem;

  p {
    margin-right: 1rem;
    font-weight: 600;
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  flex-direction: column;
  width: 600px;
  height: calc(100vh - 60px - 5rem - 25vh);
  text-align: center;
  margin: 0 auto;

  form {
    width: 100%;
  }

  .company {
    display: flex;
    align-items: center;
    justify-content: center;
    h2 {
      margin-left: 1rem;
    }
  }

  h1 {
    margin-bottom: 4rem;
  }

  button {
    width: 100%;
    margin-bottom: 3rem;
    margin-top: 1rem;
  }
`;

interface IFormInputs {
  email: string;
  password: string;
  csrf_token: string;
}

const LogIn: FC = () => {
  const [loading, setLoading] = useState(false);
  const [loginFlow, setLoginFlow] = useState<LoginFlow>();
  const [csrfToken, setCsrfToken] = useState<string>();
  const [error, setError] = useState<string>();
  const { logIn, createLoginFlow } = useAuth();
  const { setUserData } = useUser();
  const navigate = useNavigate();

  const validationSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .email('This is not a valid email address.')
          .nonempty('Email is a required field.'),
        password: z.string().nonempty('Password is a required field'),
      }),
    []
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginFlow]);

  const { control, handleSubmit, reset } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ email, password }) => {
    setLoading(true);
    setError(undefined);
    try {
      if (setUserData && loginFlow?.id) {
        const userData = await logIn(
          loginFlow?.id,
          email,
          password,
          csrfToken!
        );
        setUserData(userData);
        navigate(PATHS.home());
      }
    } catch (error) {
      reset();
      if (error instanceof errors.NotAuthorizedError) {
        setError('Incorrect email or password.');
        return;
      }
      if (error instanceof errors.ResponseClientError) {
        setError('Something went wrong processing your request.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Helmet>
        <title>Log in - Takaro </title>
      </Helmet>
      <Wrapper>
        <Header>
          <p>
            Don't have an account yet? Please contact your domain administrator
            to make one
          </p>
        </Header>

        <Container>
          <Company to="/" />
          <h1>We're just having fun!</h1>
          <Button
            color="primary"
            icon={<Google />}
            onClick={() => {
              /* dummy */
            }}
            text="Log in with Google"
            variant="default"
          />
          <Button
            color="primary"
            icon={<Discord />}
            onClick={() => {
              /* dummy */
            }}
            text="Log in with Discord"
            variant="default"
          />

          <Divider
            label={{ labelPosition: 'center', text: 'or' }}
            size="huge"
          />
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && <ErrorMessage message={error} />}
            <TextField
              control={control}
              label="Email"
              loading={loading}
              name="email"
              placeholder="hi cutie"
              required
            />
            <TextField
              control={control}
              label="Password"
              loading={loading}
              name="password"
              required
              type="password"
            />
            <StyledLink to="/forgot-password">Forgot your password?</StyledLink>
            <Button
              icon={<Mail />}
              isLoading={loading}
              onClick={() => {
                /* dummy */
              }}
              text="Log in with Email"
              type="submit"
              variant="default"
            />
          </form>
        </Container>
      </Wrapper>
    </Page>
  );
};

export default LogIn;
