import { FC, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { SettingsFlow } from '@ory/client';
import { useAuth } from 'hooks/useAuth';
import { filterNodesByGroups } from '@ory/integrations/ui';
import { styled, Loading, mapUINode } from '@takaro/lib-components';
import { useForm } from 'react-hook-form';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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

  const { control, handleSubmit } = useForm();

  useEffect(() => {
    const flowId = searchParams.get('flow');

    try {
      const createFlow = async () => {
        setFlow((await oryClient.createBrowserSettingsFlow()).data);
      };

      if (!flowId) {
        createFlow();
        return;
      }

      oryClient.getSettingsFlow({ id: flowId }).then((flowRes) => {
        setFlow(flowRes.data);
      });
    } catch (e) {
      // failed to create flow error handling
      console.log(e);
    }
  }, [oryClient, searchParams]);

  if (!flow) {
    return <Loading />;
  }

  const onSubmit = async (formData: unknown) => {
    // TODO:
    /*oryClient.updateSettingsFlow({
      flow: flow.id,
      updateSettingsFlowBody: {
        flow: flow.id,
      },
    });
  */
  };

  return (
    <>
      <Helmet>
        <title>Profile - Takaro</title>
      </Helmet>
      <Container>
        <form onSubmit={handleSubmit(onSubmit)}>
          {filterNodesByGroups({
            nodes: flow.ui.nodes,
            // we will also map default fields here such as csrf_token
            // this only maps the `password` method
            // other methods can also be mapped such as `oidc` or `webauthn`
            groups: ['profile', 'password'],
          }).map((node, idx) => mapUINode(node, idx, control))}
        </form>
      </Container>
    </>
  );
};
