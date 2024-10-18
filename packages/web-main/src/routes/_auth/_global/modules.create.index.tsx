import { useModuleCreate } from 'queries/module';
import { ModuleForm, ModuleFormSubmitProps } from './-modules/ModuleForm';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { userMeQueryOptions } from 'queries/user';
import { DrawerSkeleton } from '@takaro/lib-components';

export const Route = createFileRoute('/_auth/_global/modules/create/')({
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

  if (isSuccess) {
    navigate({ to: '/modules' });
  }

  const onSubmit = async (fields: ModuleFormSubmitProps) => {
    mutate({
      name: fields.name,
      description: fields.description,
      configSchema: fields.schema, // this is already stringified
      uiSchema: fields.uiSchema, // this is already stringified
      permissions: fields.permissions,
    });
  };
  return <ModuleForm onSubmit={onSubmit} isLoading={isPending} error={error} />;
}
