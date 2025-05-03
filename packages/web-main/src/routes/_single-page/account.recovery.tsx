import { useEffect, useState } from 'react';
import { styled, Company, LoadingPage } from '@takaro/lib-components';
import { Recovery } from '@ory/elements-react/theme';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { getOryClient, oryClientConfiguration } from '../../util/ory';
import { zodValidator } from '@tanstack/zod-adapter';
import { handleFlowError, RecoveryFlow } from '@ory/client-fetch';
import { useSnackbar } from 'notistack';

export const Route = createFileRoute('/_single-page/account/recovery')({
  component: Component,
  validateSearch: zodValidator(
    z.object({
      flowId: z.string().optional(),
    }),
  ),
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  height: 100vh;

  text-align: start;
  margin: -200px auto 0 auto;

  gap: ${({ theme }) => theme.spacing[6]};
`;

function Component() {
  useDocumentTitle('Recovery');
  const { flowId } = Route.useSearch();
  const [flow, setFlow] = useState<RecoveryFlow | null>(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const oryClient = getOryClient();
  async function getOrCreateRecoveryFlow(flowId?: string): Promise<RecoveryFlow> {
    const restartFlow = async () => {
      return await getOryClient()
        .createBrowserRecoveryFlow()
        .catch(
          handleFlowError({
            onValidationError: (responseBody) => {
              enqueueSnackbar((responseBody as any).error.reason, { variant: 'default', type: 'error' });
              navigate({ to: '/' });
              //window.location.href = '/';
            },
            onRestartFlow: () => {
              restartFlow();
            },
            onRedirect: (url: string) => {
              navigate({ to: url });
            },
            // TODO: we probably need to update kratos/ory containers
            // to handle this with handleFlowError.
            // For now we get: sdk cannot handle this error.
            //window.location.assign('/login');
          }),
        );
    };

    if (!flowId) {
      return restartFlow() as Promise<RecoveryFlow>;
    }

    const recoveryFlow = await oryClient
      .getRecoveryFlowRaw({ id: flowId! })
      .then((res) => res.value())
      .catch(
        handleFlowError({
          onValidationError: () => {},
          onRestartFlow: restartFlow,
          onRedirect: (url: string) => {
            window.location.assign(url);
          },
        }),
      );
    return recoveryFlow as RecoveryFlow;
  }

  useEffect(() => {
    getOrCreateRecoveryFlow(flowId).then((flow) => {
      setFlow(flow);
    });
  }, []);

  if (!flow) return <LoadingPage />;

  return (
    <>
      <Container>
        <Company size="large" />
        <Recovery flow={flow} config={oryClientConfiguration} />
      </Container>
    </>
  );
}
