import { moduleQueryOptions, useModuleUpdate } from '../../../queries/module';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { ModuleFormBuilder } from './-modules/ModuleForm/ModuleFormBuilder';
import { canRenderInBuilder, ModuleFormSubmitProps, moduleViewValidationSchema } from './-modules/ModuleForm';
import { DrawerSkeleton } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { ModuleFormManual } from './-modules/ModuleForm/ModuleFormManual';
import { useSnackbar } from 'notistack';

export const Route = createFileRoute('/_auth/_global/modules/$moduleId/update')({
  validateSearch: moduleViewValidationSchema,
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
  const navigate = Route.useNavigate();
  const { view } = Route.useSearch();
  const { enqueueSnackbar } = useSnackbar();

  if (isSuccess) {
    navigate({ to: '/modules' });
  }

  if (view === 'builder') {
    if (canRenderInBuilder(mod.latestVersion.configSchema, mod.latestVersion.uiSchema) === false) {
      enqueueSnackbar('This module cannot be edited in builder mode', { type: 'error', variant: 'default' });
      throw navigate({
        to: '/modules/$moduleId/update',
        params: { moduleId: Route.useParams().moduleId },
        search: { view: 'manual' },
        replace: true,
      });
    }
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
    <>
      {view === 'manual' && (
        <ModuleFormManual
          moduleName={mod.name}
          moduleVersion={mod.latestVersion}
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          error={formError}
        />
      )}
      {view === 'builder' && (
        <ModuleFormBuilder
          moduleName={mod.name}
          moduleVersion={mod.latestVersion}
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          error={formError}
        />
      )}
    </>
  );
}
