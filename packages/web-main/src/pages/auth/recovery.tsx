import { FC, useEffect, useState } from "react";
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { RecoveryFlow } from '@ory/client';
import { useAuth } from 'hooks/useAuth';

import { Button, TextField, styled, errors, Company, FormError } from '@takaro/lib-components';

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

export const Recovery: FC = () => {
  const { oryClient } = useAuth();
  const [searchParams] = useSearchParams();
  const [recoveryFlow, setRecoveryFlow] = useState<RecoveryFlow | null>(null);

  
  useEffect(() => {
    const flowId = searchParams.get('flow');
    console.log(flowId)

    if(!flowId) {
      return;
    }

    oryClient.getRecoveryFlow({id: flowId})
    .then((flowRes) => {
      setRecoveryFlow(flowRes.data);
    })
  }, [searchParams, oryClient]);

  return (
    <>
      <Helmet>
        <title>Recovery - Takaro </title>
      </Helmet>
      <Container>
        <Company size="huge" />
        </Container>
    </>
  );
};