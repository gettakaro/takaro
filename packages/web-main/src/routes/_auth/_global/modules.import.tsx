import { useModuleImport } from 'queries/modules';
import { ModuleImportForm, IFormInputs } from './-modules/ModuleImportForm';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/_global/modules/import')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['MANAGE_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  const { mutate, isSuccess, error, isPending } = useModuleImport();
  const onSubmit = async (fields: IFormInputs) => {
    mutate({ ...JSON.parse(fields.data), name: fields.name });
  };
  return <ModuleImportForm onSubmit={onSubmit} isLoading={isPending} isSuccess={isSuccess} error={error} />;
}
