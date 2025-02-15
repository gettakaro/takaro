import { useModuleCreate } from '../../../queries/module';
import { ModuleFormBuilder } from './-modules/ModuleForm/ModuleFormBuilder';
import { ModuleFormSubmitProps, moduleViewValidationSchema } from './-modules/ModuleForm';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { DrawerSkeleton } from '@takaro/lib-components';
import { ModuleFormManual } from './-modules/ModuleForm/ModuleFormManual';

export const Route = createFileRoute('/_auth/_global/modules/create/')({
  validateSearch: moduleViewValidationSchema,
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
  const { mutate, isSuccess, error, isPending } = useModuleCreate();
  const navigate = useNavigate();
  const { view } = Route.useSearch();

  if (isSuccess) {
    navigate({ to: '/modules' });
  }

  const onSubmit = async (fields: ModuleFormSubmitProps) => {
    mutate({
      name: fields.name,
      latestVersion: {
        description: fields.description,
        configSchema: fields.schema,
        uiSchema: fields.uiSchema,
        permissions: fields.permissions,
      },
    });
  };

  return (
    <>
      {view === 'manual' && <ModuleFormManual onSubmit={onSubmit} isLoading={isPending} error={error} />}
      {view === 'builder' && <ModuleFormBuilder onSubmit={onSubmit} isLoading={isPending} error={error} />}
    </>
  );
}
