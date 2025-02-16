import { moduleQueryOptions, moduleVersionQueryOptions, moduleVersionsQueryOptions } from '../../../queries/module';
import { DrawerSkeleton } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { useQueries } from '@tanstack/react-query';
import { canRenderInBuilder, moduleViewValidationSchema } from './-modules/ModuleForm';
import { useSnackbar } from 'notistack';
import { ModuleFormBuilder } from './-modules/ModuleForm/ModuleFormBuilder';
import { ModuleFormManual } from './-modules/ModuleForm/ModuleFormManual';

export const Route = createFileRoute('/_auth/_global/modules/$moduleId/view/$moduleVersionTag')({
  validateSearch: moduleViewValidationSchema,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loaderDeps: ({ search }) => ({ view: search.view }),
  loader: async ({ params, context, deps }) => {
    const mod = await context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId));
    const moduleVersions = await context.queryClient.ensureQueryData(
      moduleVersionsQueryOptions({ filters: { tag: [params.moduleVersionTag] } }),
    );

    // todo: this is not very clean, if they fill in a version that doesn't exist.
    if (moduleVersions.data.length === 0) {
      throw redirect({
        to: '/modules/$moduleId/view/$moduleVersionTag',
        params: { moduleId: params.moduleId, moduleVersionTag: 'latest' },
        search: { view: deps.view },
      });
    }

    return {
      mod,
      modVersion: moduleVersions.data[0],
    };
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const loaderData = Route.useLoaderData();
  const params = Route.useParams();
  const { view } = Route.useSearch();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = Route.useNavigate();

  const [{ data: mod }, { data: modVersion }] = useQueries({
    queries: [
      { ...moduleQueryOptions(params.moduleId), initialData: loaderData.mod },
      { ...moduleVersionQueryOptions(loaderData.modVersion.id), initialData: loaderData.modVersion },
    ],
  });

  if (view === 'builder') {
    if (canRenderInBuilder(mod.latestVersion.configSchema, mod.latestVersion.uiSchema) === false) {
      enqueueSnackbar('This module could not be viewed in builder mode', { type: 'error', variant: 'default' });
      throw navigate({
        to: '/modules/$moduleId/update',
        params: { moduleId: Route.useParams().moduleId },
        search: { view: 'manual' },
        replace: true,
      });
    }
  }

  return (
    <>
      {view === 'manual' && <ModuleFormManual moduleName={mod.name} moduleVersion={modVersion} error={null} />}
      {view === 'builder' && <ModuleFormBuilder moduleName={mod.name} moduleVersion={modVersion} error={null} />}
    </>
  );
}
