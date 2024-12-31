import { moduleQueryOptions, moduleVersionQueryOptions } from 'queries/module';
import { ModuleForm } from './-modules/ModuleForm';
import { DrawerSkeleton } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { userMeQueryOptions } from 'queries/user';
import { useQueries } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/_global/modules/$moduleId/view/$moduleVersionTag')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => {
    const mod = await context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId));
    const modVersionId = mod.versions.find((version) => version.tag === params.moduleVersionTag)?.id;

    // todo: this is not very clean, if they fill in a version that doesn't exist.
    if (!modVersionId) {
      throw redirect({
        to: '/modules/$moduleId/view/$moduleVersionTag',
        params: { moduleId: params.moduleId, moduleVersionTag: 'latest' },
      });
    }

    const modVersion = await context.queryClient.ensureQueryData(moduleVersionQueryOptions(modVersionId));
    return {
      mod,
      modVersion,
    };
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const loaderData = Route.useLoaderData();
  const params = Route.useParams();

  const [{ data: mod }, { data: modVersion }] = useQueries({
    queries: [
      { ...moduleQueryOptions(params.moduleId), initialData: loaderData.mod },
      { ...moduleVersionQueryOptions(loaderData.modVersion.id), initialData: loaderData.modVersion },
    ],
  });

  console.log(modVersion);

  return (
    <ModuleForm moduleName={mod.name} moduleVersion={modVersion} error={null} smallModuleVersions={mod.versions} />
  );
}
