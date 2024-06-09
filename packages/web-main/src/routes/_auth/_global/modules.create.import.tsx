import { createFileRoute, redirect } from '@tanstack/react-router';
import { useModuleImport } from 'queries/module';
import { ModuleImportForm, IFormInputs } from './-modules/ModuleImportForm';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/_global/modules/create/import')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['MANAGE_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  const { mutate, isSuccess, error, isPending } = useModuleImport();
  const onSubmit = async ({ importData, name }: IFormInputs) => {
    const data = importData[0];
    const text = await data.text();
    const json = JSON.parse(text);

    mutate({ ...json, name });
  };
  return <ModuleImportForm onSubmit={onSubmit} isLoading={isPending} isSuccess={isSuccess} error={error} />;
}
