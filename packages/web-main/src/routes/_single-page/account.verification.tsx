import { useCallback, useEffect, useState } from 'react';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { UpdateVerificationFlowBody, VerificationFlow } from '@ory/client';
import { styled, Skeleton } from '@takaro/lib-components';
import { UserAuthCard } from '@ory/elements';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { z } from 'zod';
import { useOry } from '../../hooks/useOry';

const searchSchema = z.object({
  flowId: z.string().catch(''),
});

export const Route = createFileRoute('/_single-page/account/verification')({
  component: Component,
  validateSearch: (search) => searchSchema.parse(search),
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
  const { oryClient, oryError } = useOry();
  const { flowId } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  // Get the flow based on the flowId in the URL (.e.g redirect to this page after flow initialized)
  const getFlow = useCallback(
    (flowId: string) =>
      oryClient
        // the flow data contains the form fields, error messages and csrf token
        .getVerificationFlow({ id: flowId })
        .then(({ data: flow }) => {
          setFlow(flow);
        })
        .catch(sdkErrorHandler),
    [],
  );

  // initialize the sdkError for generic handling of errors
  const sdkErrorHandler = oryError(getFlow, setFlow, '/verification', true);

  // create a new verification flow
  const createFlow = () => {
    oryClient
      .createBrowserVerificationFlow()
      // flow contains the form fields, error messages and csrf token
      .then(({ data: flow }) => {
        // Update URI query params to include flow id
        navigate({ search: { flowId: flow.id }, replace: true });
        // Set the flow data
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  // submit the verification form data to Ory
  const submitFlow = (body: UpdateVerificationFlowBody) => {
    // something unexpected went wrong and the flow was not set
    if (!flow) return navigate({ to: '/account/verification', replace: true, search: { flowId: '' } });

    oryClient
      .updateVerificationFlow({
        flow: flow.id,
        updateVerificationFlowBody: body,
      })
      .then(({ data: flow }) => {
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  useEffect(() => {
    // it could happen that we are redirected here with an existing flow
    if (flowId) {
      // if the flow failed to get since it could be expired or invalid, we create a new one
      getFlow(flowId).catch(createFlow);
      return;
    }
    createFlow();
  }, []);

  if (!flow) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  return (
    <>
      <Container>
        <UserAuthCard
          title="Verification"
          flowType="verification"
          // we always need to provide the flow data since it contains the form fields, error messages and csrf token
          flow={flow}
          // we want users to be able to go back to the login page from the verification page
          additionalProps={{
            signupURL: '/login',
          }}
          // submit the verification form data to Ory
          onSubmit={({ body }) => submitFlow(body as UpdateVerificationFlowBody)}
        />
      </Container>
    </>
  );
}
