import { styled, LoadingPage } from '@takaro/lib-components';
import { Settings } from '@ory/elements-react/theme';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';
import { getOryClient, oryClientConfiguration } from '../../util/ory';
import { handleFlowError, SettingsFlow } from '@ory/client-fetch';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/_single-page/account/profile')({
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
  align-items: flex-start;
  justify-content: flex-start;
  height: 100vh;
  text-align: start;
`;

function Component() {
  useDocumentTitle('Profile');
  const { flowId } = Route.useSearch();
  const [flow, setFlow] = useState<SettingsFlow | null>(null);

  useEffect(() => {
    getOrCreateSettingsFlow(flowId).then((flow) => {
      setFlow(flow);
    });
  }, []);

  async function getOrCreateSettingsFlow(flowId?: string): Promise<SettingsFlow> {
    const restartFlow = async () => {
      return await getOryClient()
        .createBrowserSettingsFlow()
        .catch(() => {
          // TODO: we probably need to update kratos/ory containers
          // to handle this with handleFlowError.
          // For now we get: sdk cannot handle this error.
          window.location.assign('/login');
        });
    };

    if (!flowId) {
      return restartFlow() as Promise<SettingsFlow>;
    }

    const settingsFlow = await getOryClient()
      .getSettingsFlowRaw({ id: flowId })
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
    return settingsFlow as SettingsFlow;
  }

  if (!flow) return <LoadingPage />;

  return (
    <Container>
      <Settings
        flow={flow}
        config={oryClientConfiguration}
        components={{
          Page: {
            Header: () => <></>,
          },
        }}
      />
    </Container>
  );
}
