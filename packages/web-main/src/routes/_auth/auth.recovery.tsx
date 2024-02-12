import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { RecoveryFlow, UpdateRecoveryFlowBody } from '@ory/client';
import { styled, Company, Skeleton } from '@takaro/lib-components';
import { UserAuthCard } from '@ory/elements';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { useOry } from 'hooks/useOry';

const searchSchema = z.object({
  flowId: z.string().catch(''),
});

export const Route = createFileRoute('/_auth/auth/recovery')({
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
  const [flow, setFlow] = useState<RecoveryFlow | null>(null);
  const { flowId } = Route.useSearch();
  const { oryClient, oryError } = useOry();

  const navigate = useNavigate({ from: Route.fullPath });

  const getFlow = useCallback(
    (flowId: string) =>
      oryClient
        .getRecoveryFlow({ id: flowId })
        .then(({ data: flow }) => setFlow(flow))
        .catch(sdkErrorHandler),
    []
  );

  // initialize the sdkError for generic handling of errors
  const sdkErrorHandler = oryError(getFlow, setFlow, '/recovery');

  // create a new recovery flow
  const createFlow = () => {
    oryClient
      .createBrowserRecoveryFlow()
      // flow contains the form fields, error messages and csrf token
      .then(({ data: flow }) => {
        // Update URI query params to include flow id
        navigate({ search: { flowId: flow.id } });
        // Set the flow data
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  const submitFlow = (body: UpdateRecoveryFlowBody) => {
    // something unexpected went wrong and the flow was not set
    if (!flow) {
      return navigate({ to: '/login', replace: true });
    }

    oryClient
      .updateRecoveryFlow({ flow: flow.id, updateRecoveryFlowBody: body })
      .then(({ data: flow }) => {
        // Form submission was successful, show the message to the user!
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  useEffect(() => {
    // the flow already exists
    if (flowId) {
      getFlow(flowId).catch(createFlow); // if for some reason the flow has expired, we need to get a new one
      return;
    }
    // we assume there was no flow, so we create a new one
    createFlow();
  }, []);

  if (!flow) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  return (
    <>
      <Container>
        <Company size="huge" />

        <StyledUserCard
          title="Recovery"
          flowType={'recovery'}
          // the flow is always required since it contains the UI form elements, UI error messages and csrf token
          flow={flow}
          // the recovery form should allow users to navigate to the login page
          additionalProps={{
            loginURL: {
              handler: () => navigate({ to: '/login', replace: true }),
              href: '/login',
            },
          }}
          // submit the form data to Ory
          onSubmit={({ body }) => submitFlow(body as UpdateRecoveryFlowBody)}
        />
      </Container>
    </>
  );
}
