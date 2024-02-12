import { useModuleCreate } from 'queries/modules';
import { ModuleForm, ModuleFormSubmitProps } from './-modules/ModuleForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/modules/create')({
  component: Component,
});

function Component() {
  const { mutate, isSuccess, error, isPending } = useModuleCreate();
  const onSubmit = async (fields: ModuleFormSubmitProps) => {
    mutate({
      name: fields.name,
      description: fields.description,
      configSchema: fields.schema, // this is already stringified
      uiSchema: fields.uiSchema, // this is already stringified
      permissions: fields.permissions,
    });
  };
  return <ModuleForm onSubmit={onSubmit} isLoading={isPending} isSuccess={isSuccess} error={error} />;
}
