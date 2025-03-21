import { DrawerSkeleton } from '@takaro/lib-components';
import { createFileRoute, notFound, redirect, useNavigate } from '@tanstack/react-router';
import { useVariableUpdate, variableQueryOptions } from '../../../queries/variable';
import { VariablesForm, IFormInputs } from './-variables/VariablesForm';
import { useSnackbar } from 'notistack';
import { queryClient } from '../../../queryClient';
import { hasPermission } from '../../../hooks/useHasPermission';
import { VariableUpdateDTO } from '@takaro/apiclient';
import { userMeQueryOptions } from '../../../queries/user';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/_global/variables/update/$variableId')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_VARIABLES', 'MANAGE_VARIABLES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params }) => {
    const variable = await queryClient.ensureQueryData(variableQueryOptions(params.variableId));
    return { variable };
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const navigate = useNavigate({ from: Route.fullPath });
  const loaderData = Route.useLoaderData();
  const { variableId } = Route.useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate, isPending, isSuccess } = useVariableUpdate();

  const { data } = useQuery({ ...variableQueryOptions(variableId), initialData: loaderData.variable });

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
  if (data?.playerId === null) {
    data.playerId = undefined;
  }
  if (data?.gameServerId === null) {
    data.gameServerId = undefined;
  }
  if (data?.moduleId === null) {
    data.moduleId = undefined;
  }

  return <VariablesForm isLoading={isPending} variable={data} onSubmit={updateVariable} />;
}
