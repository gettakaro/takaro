import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { styled, Skeleton } from '@takaro/lib-components';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';
import { getOryClient, oryClientConfiguration } from '../../util/ory';
import { Verification } from '@ory/elements-react/theme';
import { handleFlowError, VerificationFlow } from '@ory/client-fetch';
import { useSnackbar } from 'notistack';

export const Route = createFileRoute('/_single-page/account/verification')({
  component: Component,
  validateSearch: zodValidator(
    z.object({
      flowId: z.string().catch(''),
    }),
  ),
});

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

function Component() {
  useDocumentTitle('Verification');
  const [flow, setFlow] = useState<VerificationFlow | null>(null);
  const oryClient = getOryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { flowId } = Route.useSearch();

  async function getOrCreateVerificationFlow(flowId?: string): Promise<VerificationFlow> {
    const restartFlow = async () => {
      return await getOryClient()
        .createBrowserVerificationFlow()
        .catch(() => {
          // TODO: we probably need to update kratos/ory containers
          // to handle this with handleFlowError.
          // For now we get: sdk cannot handle this error.
          window.location.assign('/login');
        });
    };

    if (!flowId) {
      return restartFlow() as Promise<VerificationFlow>;
    }

    const verificationFlow = await oryClient
      .getVerificationFlowRaw({ id: flowId! })
      .then((res) => res.value())
      .catch(
        handleFlowError({
          onValidationError: (responseBody) => {
            enqueueSnackbar((responseBody as any).error.reason, { variant: 'default', type: 'error' });
          },
          onRestartFlow: restartFlow,
          onRedirect: (url: string) => {
            window.location.assign(url);
          },
        }),
      );

    return verificationFlow as VerificationFlow;
  }

  useEffect(() => {
    getOrCreateVerificationFlow(flowId).then((flow) => {
      setFlow(flow);
    });
  }, []);

  if (!flow) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  return (
    <>
      <Container>
        <Verification flow={flow} config={oryClientConfiguration} />
      </Container>
    </>
  );
}
