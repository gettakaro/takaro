import { moduleQueryOptions, useModuleUpdate } from 'queries/module';
import { ModuleForm, ModuleFormSubmitProps } from './-modules/ModuleForm';
import { DrawerSkeleton } from '@takaro/lib-components';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { useSnackbar } from 'notistack';

export const Route = createFileRoute('/_auth/_global/modules/$moduleId/update')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
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
  const { enqueueSnackbar } = useSnackbar();
  const { mutate, isSuccess, isPending: isSubmitting, error: formError } = useModuleUpdate();
  const navigate = useNavigate();

  if (isSuccess) {
    enqueueSnackbar('Module updated!', { variant: 'default', type: 'success' });
    navigate({ to: '/modules' });
  }

  const onSubmit = (fields: ModuleFormSubmitProps) => {
    mutate({
      id: mod.id,
      moduleUpdate: {
        name: fields.name,
        description: fields.description,
        configSchema: fields.schema, // already stringified
        uiSchema: fields.uiSchema, // already stringified
        permissions: fields.permissions,
      },
    });
  };

  return <ModuleForm mod={mod} onSubmit={onSubmit} isLoading={isSubmitting} error={formError} />;
}
