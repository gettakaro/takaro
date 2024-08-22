import { useCallback, useEffect, useState } from 'react';
import { RecoveryFlow, UpdateRecoveryFlowBody } from '@ory/client';
import { styled, Company, Skeleton } from '@takaro/lib-components';
import { RecoverySectionAdditionalProps, UserAuthCard } from '@ory/elements';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useOry } from 'hooks/useOry';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { flushSync } from 'react-dom';

const searchSchema = z.object({
  flowId: z.string().catch(''),
});

export const Route = createFileRoute('/_single-page/account/recovery')({
  component: Component,
  validateSearch: (search) => searchSchema.parse(search),
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

const StyledUserCard = styled(UserAuthCard)`
  width: 800px;
  max-width: none;
`;

function Component() {
  useDocumentTitle('Recovery');
  const [flow, setFlow] = useState<RecoveryFlow>();
  const { flowId } = Route.useSearch();
  const { oryClient, oryError } = useOry();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate({ from: Route.fullPath });

  const getFlow = useCallback(
    (flowId: string) =>
      oryClient
        .getRecoveryFlow({ id: flowId })
        .then(({ data: flow }) => {
          setFlow(flow);
        })
        .catch(sdkErrorHandler),
    [],
  );

  // initialize the sdkError for generic handling of errors
  const sdkErrorHandler = oryError(getFlow, setFlow, '/account/recovery');

  // create a new recovery flow
  const createFlow = () => {
    oryClient
      .createBrowserRecoveryFlow()
      // flow contains the form fields, error messages and csrf token
      .then(({ data: flow }) => {
        // Set the flow data

        flushSync(() => {
          setFlow(flow);
        });

        // Update URI query params to include flow id
        navigate({ search: { flowId: flow.id } });
      })
      .catch(sdkErrorHandler);
  };

  const submitFlow = async (body: UpdateRecoveryFlowBody) => {
    if (!flow) {
      enqueueSnackbar('Something went wrong, please try again', { type: 'error' });
      return navigate({ to: '/login', replace: true });
    }

    try {
      const { data } = await oryClient.updateRecoveryFlow({ flow: flow.id, updateRecoveryFlowBody: body });
      setFlow(data);
    } catch (e) {
      sdkErrorHandler(e as AxiosError);
    }
  };

  useEffect(() => {
    if (flowId) {
      getFlow(flowId).catch(createFlow);
    } else {
      createFlow();
    }
  }, []);

  if (!flow) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  return (
    <>
      <Container>
        <Company size="huge" />
        <StyledUserCard
          title="Recovery"
          flowType={'recovery'}
          flow={flow}
          additionalProps={
            {
              loginURL: {
                handler: () => navigate({ to: '/login', replace: true }),
                href: '/login',
              },
            } as RecoverySectionAdditionalProps
          }
          onSubmit={({ body }) => submitFlow(body as UpdateRecoveryFlowBody)}
        />
      </Container>
    </>
  );
}
