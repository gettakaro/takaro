import { useCallback, useEffect, useState } from 'react';
import { RecoveryFlow, UpdateRecoveryFlowBody } from '@ory/client';
import { RecoverySectionAdditionalProps, UserAuthCard } from '@ory/elements';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { useOry } from 'hooks/useOry';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';

const searchSchema = z.object({
  flowId: z.string().catch(''),
});

export const Route = createFileRoute('/_single-page/account/recovery')({
  component: Component,
  validateSearch: (search) => searchSchema.parse(search),
});

function Component() {
  useDocumentTitle('Recovery');
  const [flow, setFlow] = useState<RecoveryFlow | null>();
  const { flowId } = Route.useSearch();
  const { oryClient, oryError } = useOry();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = Route.useNavigate();

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
        // Update URI query params to include flow id
        navigate({ search: { flowId: flow.id } });
        // Set the flow data
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  const submitFlow = async (body: UpdateRecoveryFlowBody) => {
    if (!flow) {
      enqueueSnackbar('Something went wrong, please try again', { type: 'error' });
      return navigate({ to: '/login', replace: true });
    }

    try {
      const { data } = await oryClient.updateRecoveryFlow({
        flow: flow.id,
        updateRecoveryFlowBody: body,
      });

      //// bandage fix, I expected this to automatically navigate to the settings flow (/account/profile).
      //if (data.continue_with && data.continue_with.length > 0) {
      //  navigate({ to: '/account/profile', search: { flowId: data.continue_with[0]['flow']['id'] } });
      //}
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

  if (!flow) return <></>;

  return (
    <UserAuthCard
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
      onSubmit={async ({ body }) => await submitFlow(body as UpdateRecoveryFlowBody)}
    />
  );
}
