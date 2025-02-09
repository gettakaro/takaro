import { moduleQueryOptions, useModuleUpdate } from '../../../queries/module';
import { ModuleForm, ModuleFormSubmitProps } from './-modules/ModuleForm';
import { DrawerSkeleton } from '@takaro/lib-components';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';

export const Route = createFileRoute('/_auth/_global/modules/$moduleId/update')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: ({ params, context }) => context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId)),
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const mod = Route.useLoaderData();
  const { mutate, isSuccess, isPending: isSubmitting, error: formError } = useModuleUpdate();
  const navigate = useNavigate();

  if (isSuccess) {
    navigate({ to: '/modules' });
  }

  const onSubmit = (fields: ModuleFormSubmitProps) => {
    mutate({
      id: mod.id,
      moduleUpdate: {
        name: fields.name,
        latestVersion: {
          description: fields.description,
          configSchema: fields.schema, // this is already stringified
          uiSchema: fields.uiSchema, // this is already stringified
          permissions: fields.permissions,
        },
      },
    });
  };

  return (
    <ModuleForm
      moduleName={mod.name}
      moduleVersion={mod.latestVersion}
      onSubmit={onSubmit}
      isLoading={isSubmitting}
      error={formError}
    />
  );
}
