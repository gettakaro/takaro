import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { ExecutionType, IFormInputs, VariablesForm } from './-variables/VariableCreateUpdateForm';
import { useVariableCreate } from 'queries/variable';
import { hasPermission } from 'hooks/useHasPermission';
import { useSnackbar } from 'notistack';

export const Route = createFileRoute('/_auth/_global/variables/create')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!hasPermission(session, ['READ_VARIABLES', 'MANAGE_VARIABLES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  const { mutate, isPending, error, isSuccess } = useVariableCreate();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  if (isSuccess) {
    enqueueSnackbar('Variable created!', { variant: 'default', type: 'success' });
    navigate({ to: '/variables' });
  }

  function createVariable(variable: IFormInputs) {
    mutate({
      key: variable.key,
      value: variable.value,
      moduleId: variable.moduleId,
      playerId: variable.playerId,
      gameServerId: variable.gameServerId,
    });
  }

  return <VariablesForm isLoading={isPending} submit={createVariable} type={ExecutionType.CREATE} error={error} />;
}
