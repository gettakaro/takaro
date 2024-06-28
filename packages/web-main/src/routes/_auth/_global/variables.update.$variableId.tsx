import { DrawerSkeleton } from '@takaro/lib-components';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useVariableUpdate, variableQueryOptions } from 'queries/variable';
import { VariablesForm, ExecutionType, IFormInputs } from './-variables/VariableCreateUpdateForm';
import { useSnackbar } from 'notistack';
import { queryClient } from 'queryClient';
import { hasPermission } from 'hooks/useHasPermission';
import { useEffect } from 'react';

export const Route = createFileRoute('/_auth/_global/variables/update/$variableId')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!hasPermission(session, ['READ_VARIABLES', 'MANAGE_VARIABLES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: ({ params }) => queryClient.ensureQueryData(variableQueryOptions(params.variableId)),
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const navigate = useNavigate({ from: Route.fullPath });
  const data = Route.useLoaderData();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate, isPending, isSuccess } = useVariableUpdate();

  if (!data) {
    enqueueSnackbar('Variable not found', { type: 'error' });
    throw notFound();
  }

  function updateVariable(variable: IFormInputs) {
    mutate({ variableId: data.id, variableDetails: variable });
    navigate({ to: '/variables' });
  }

  useEffect(() => {
    if (isSuccess) {
      navigate({ to: '/variables' });
    }
  }, [navigate, isSuccess]);

  // set null values to undefined otherwise zod will complain
  if (data?.playerId === null) {
    data.playerId = undefined;
  }
  if (data?.gameServerId === null) {
    data.gameServerId = undefined;
  }
  if (data?.moduleId === null) {
    data.moduleId = undefined;
  }

  return <VariablesForm isLoading={isPending} variable={data} submit={updateVariable} type={ExecutionType.UPDATE} />;
}
