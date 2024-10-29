import { DrawerSkeleton } from '@takaro/lib-components';
import { createFileRoute, notFound, redirect, useNavigate } from '@tanstack/react-router';
import { useVariableUpdate, variableQueryOptions } from 'queries/variable';
import { VariablesForm, IFormInputs } from './-variables/VariablesForm';
import { useSnackbar } from 'notistack';
import { queryClient } from 'queryClient';
import { hasPermission } from 'hooks/useHasPermission';
import { VariableUpdateDTO } from '@takaro/apiclient';
import { userMeQueryOptions } from 'queries/user';

export const Route = createFileRoute('/_auth/_global/variables/update/$variableId')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
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

  if (isSuccess) {
    navigate({ to: '/variables' });
  }

  function updateVariable(variable: IFormInputs) {
    if (variable.expiresAt === null) {
      variable.expiresAt = undefined;
    }
    const updatedVariable: VariableUpdateDTO = {
      ...variable,
      expiresAt: variable.expiresAt,
    };
    mutate({ variableId: data.id, variableDetails: updatedVariable });
  }

  // set null values to undefined otherwise zod will complain
  const sanitizedData = {
    ...data,
    playerId: data.playerId === null ? undefined : data.playerId,
    gameServerId: data.gameServerId === null ? undefined : data.gameServerId,
    moduleId: data.moduleId === null ? undefined : data.moduleId,
  };

  return <VariablesForm isLoading={isPending} variable={sanitizedData} onSubmit={updateVariable} />;
}
