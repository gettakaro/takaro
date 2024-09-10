import { useCallback, useEffect, useState } from 'react';
import { SettingsFlow, UpdateSettingsFlowBody } from '@ory/client';
import { gridStyle, NodeMessages, UserSettingsCard, UserSettingsFlowType } from '@ory/elements';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useOry } from 'hooks/useOry';
import { useSnackbar } from 'notistack';

const searchSchema = z.object({
  flowId: z.string().catch(''),
});

export const Route = createFileRoute('/_single-page/account/profile')({
  component: Component,
  validateSearch: (search) => searchSchema.parse(search),
});

function Component() {
  useDocumentTitle('Profile');
  const { enqueueSnackbar } = useSnackbar();
  const { oryClient, oryError } = useOry();
  const [flow, setFlow] = useState<SettingsFlow | null>(null);
  const { flowId } = Route.useSearch();

  const navigate = useNavigate({ from: Route.fullPath });

  // Get the flow based on the flowId in the URL (.e.g redirect to this page after flow initialized)
  const getFlow = useCallback(
    (flowId: string) =>
      oryClient
        // the flow data contains the form fields, error messages and csrf token
        .getSettingsFlow({ id: flowId })
        .then(({ data: flow }) => setFlow(flow))
        .catch(sdkErrorHandler),
    [],
  );

  // initialize the sdkError for generic handling of errors
  const sdkErrorHandler = oryError(getFlow, setFlow, '/settings', true);

  const createFlow = () => {
    oryClient
      // create a new settings flow
      // the flow contains the form fields, error messages and csrf token
      // depending on the Ory Network project settings, the form fields returned may vary
      .createBrowserSettingsFlow()
      .then(({ data: flow }) => {
        // Update URI query params to include flow id
        navigate({ search: { flowId: flow.id }, replace: true });
        // Set the flow data
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  // submit any of the settings form data to Ory
  const onSubmit = (body: UpdateSettingsFlowBody) => {
    // something unexpected went wrong and the flow was not set
    if (!flow) return navigate({ to: '/login', replace: true });

    oryClient
      // submit the form data the user provided to Ory
      .updateSettingsFlow({ flow: flow.id, updateSettingsFlowBody: body })
      .then(({ data: flow }) => {
        setFlow(flow);
        enqueueSnackbar('Your changes have been saved!', { type: 'info' });
        navigate({ to: '/login' });
      })
      .catch(sdkErrorHandler);
  };

  useEffect(() => {
    // we might redirect to this page after the flow is initialized, so we check for the flowId in the URL
    // the flow already exists
    if (flowId) {
      getFlow(flowId).catch(createFlow); // if for some reason the flow has expired, we need to get a new one
      return;
    }
    createFlow();
  }, []);

  if (!flow) return <></>;

  return (
    <div className={gridStyle({ gap: 16 })} style={{ width: '100%' }}>
      <NodeMessages uiMessages={flow.ui.messages} />
      {/* here we simply map all of the settings flows we could have. These flows won't render if they aren't enabled inside your Ory Network project */}
      {(['profile', 'password', 'totp', 'webauthn', 'lookupSecret', 'oidc'] as UserSettingsFlowType[]).map(
        (flowType: UserSettingsFlowType, index) => (
          <UserSettingsCard
            key={index}
            flow={flow}
            method={flowType}
            includeScripts={true}
            onSubmit={({ body }) => onSubmit(body as UpdateSettingsFlowBody)}
          />
        ),
      )}
    </div>
  );
}
