import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { IFormInputs, VariablesForm } from './-variables/VariablesForm';
import { useVariableCreate } from '../../../queries/variable';
import { hasPermission } from '../../../hooks/useHasPermission';
import { VariableCreateDTO } from '@takaro/apiclient';
import { userMeQueryOptions } from '../../../queries/user';

export const Route = createFileRoute('/_auth/_global/variables/create')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_VARIABLES', 'MANAGE_VARIABLES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  const { mutate, isPending, error, isSuccess } = useVariableCreate();
  const navigate = useNavigate();

  if (isSuccess) {
    navigate({ to: '/variables' });
  }

  function createVariable(variable: IFormInputs) {
    if (variable.expiresAt === null) {
      variable.expiresAt = undefined;
    }
    const createdVariable: VariableCreateDTO = {
      ...variable,
      expiresAt: variable.expiresAt,
    };
    mutate(createdVariable);
  }

  return <VariablesForm isLoading={isPending} onSubmit={createVariable} error={error} />;
}
