import { FC, useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RecoveryFlow, UpdateRecoveryFlowBody } from '@ory/client';
import { useAuth } from 'hooks/useAuth';
import { styled, Company, Skeleton } from '@takaro/lib-components';
import { UserAuthCard } from '@ory/elements';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

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

export const Recovery: FC = () => {
  useDocumentTitle('Recovery');
  const [flow, setFlow] = useState<RecoveryFlow | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { oryClient, oryError } = useAuth();

  const navigate = useNavigate();

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
        setSearchParams({ ['flow']: flow.id });
        // Set the flow data
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  const submitFlow = (body: UpdateRecoveryFlowBody) => {
    // something unexpected went wrong and the flow was not set
    if (!flow) return navigate('/login', { replace: true });

    oryClient
      .updateRecoveryFlow({ flow: flow.id, updateRecoveryFlowBody: body })
      .then(({ data: flow }) => {
        // Form submission was successful, show the message to the user!
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  useEffect(() => {
    // we might redirect to this page after the flow is initialized, so we check for the flowId in the URL
    const flowId = searchParams.get('flow');
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
          additionalProps={{ loginURL: '/login' }}
          // submit the form data to Ory
          onSubmit={({ body }) => submitFlow(body as UpdateRecoveryFlowBody)}
        />
      </Container>
    </>
  );
};
