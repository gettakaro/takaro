import { FC, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { RecoveryFlow, SettingsFlow } from '@ory/client';
import { useAuth } from 'hooks/useAuth';

import { Button, TextField, styled, errors, Company, FormError, Loading } from '@takaro/lib-components';
import { Form } from '@takaro/lib-components/src/components/inputs/JsonSchemaForm/generator/style';
import { useForm } from 'react-hook-form';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  height: 100vh;

  max-width: 600px;
  text-align: center;
  margin: -200px auto 0 auto;

  gap: ${({ theme }) => theme.spacing[6]};
`;

export const AuthSettings: FC = () => {
  const { oryClient } = useAuth();
  const [searchParams] = useSearchParams();
  const [flow, setFlow] = useState<SettingsFlow | null>(null);

  const {control} = useForm();

  useEffect(() => {
    const flowId = searchParams.get('flow');

    if (!flowId) {
      return;
    }

    oryClient.getSettingsFlow({ id: flowId }).then((flowRes) => {
      setFlow(flowRes.data);
    });
  }, []);

  if (!flow) {
    return <Loading />;
  }

  const ui = flow.ui;

  const passwordComponents = (
    <>
      <TextField control={control} label="Password" loading={false} name="password" required type="password"  />
      <Button text='Submit' type='submit'/>
    </>
  )

  return (
    <>
      <Helmet>
        <title>Profile - Takaro </title>
      </Helmet>
      <Container>
        <h2>Password</h2>
        <Form action={ui.action} method={ui.method}>
        {passwordComponents}
        </Form>
      </Container>
    </>
  );
};
