import { FC, useState, useMemo, useEffect } from 'react';
import { Button, TextField, styled, errors, Company, FormError } from '@takaro/lib-components';
import { Helmet } from 'react-helmet';
import { AiFillMail as Mail } from 'react-icons/ai';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth';
import { PATHS } from 'paths';
import { LoginFlow } from '@ory/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';

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

// const Header = styled.header`
//   width: 100%;
//   height: 60px;
//   display: flex;
//   align-items: center;
//   justify-content: flex-end;
//   padding: 2rem;
//   margin-bottom: 5rem;
//
//   p {
//     margin-right: 1rem;
//     font-weight: 600;
//   }
// `;

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

// const Header = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: ${({ theme }) => theme.spacing['0_5']};
// `;

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
  const navigate = useNavigate();

  const validationSchema = useMemo(
    () =>
      z.object({
        email: z.string().email('This is not a valid email address.').nonempty('Email is a required field.'),
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
  }, [loginFlow]);

  const { control, handleSubmit, reset } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ email, password }) => {
    setLoading(true);
    setError(undefined);
    try {
      if (loginFlow?.id) {
        await logIn(loginFlow?.id, email, password, csrfToken!);
        navigate(PATHS.home());
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

  return (
    <>
      <Helmet>
        <title>Log in - Takaro </title>
      </Helmet>
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
          <StyledLink to="/forgot-password">Forgot your password?</StyledLink>
          {error && <FormError message={error} />}
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
};

export default LogIn;
