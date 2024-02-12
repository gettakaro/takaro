import { createFileRoute } from '@tanstack/react-router';
import { ExecutionType, IFormInputs, VariablesForm } from './-variables/VariableCreateUpdateForm';
import { useVariableCreate } from 'queries/variables/queries.js';

export const Route = createFileRoute('/_auth/variables/create')({
  component: Component,
});

function Component() {
  const { mutateAsync, isPending, error } = useVariableCreate();

  async function createVariable(variable: IFormInputs) {
    await mutateAsync({
      key: variable.key,
      value: variable.value,
      moduleId: variable.moduleId,
      playerId: variable.playerId,
      gameServerId: variable.gameServerId,
    });
  }
  return <VariablesForm isLoading={isPending} submit={createVariable} type={ExecutionType.CREATE} error={error} />;
}
