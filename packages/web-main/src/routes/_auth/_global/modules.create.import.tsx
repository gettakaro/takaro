import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useModuleImport } from '../../../queries/module';
import { ModuleImportForm, IFormInputs } from './-modules/ModuleImportForm';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { DrawerSkeleton } from '@takaro/lib-components';
import { useSnackbar } from 'notistack';

export const Route = createFileRoute('/_auth/_global/modules/create/import')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const { mutate, isSuccess, error, isPending } = useModuleImport();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  if (isSuccess) {
    navigate({ to: '/modules' });
    enqueueSnackbar('Module imported!', { variant: 'default', type: 'success' });
  }

  const onSubmit = async ({ importData, name }: IFormInputs) => {
    const data = importData[0];
    const text = await data.text();
    const json = JSON.parse(text);
    mutate({ ...json, name });
  };

  return <ModuleImportForm onSubmit={onSubmit} isLoading={isPending} error={error} />;
}
