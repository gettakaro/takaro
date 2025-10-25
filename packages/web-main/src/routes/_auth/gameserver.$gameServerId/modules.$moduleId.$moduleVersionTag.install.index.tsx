import { moduleQueryOptions, moduleVersionsQueryOptions } from '../../../queries/module';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { InstallModuleForm } from '../../../components/moduleInstallations/InstallModuleForm';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { DrawerSkeleton } from '@takaro/lib-components';
import { useQueries } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/modules/$moduleId/$moduleVersionTag/install/')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => {
    const [mod, modVersionsResponse] = await Promise.all([
      context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId)),
      context.queryClient.ensureQueryData(
        moduleVersionsQueryOptions({ filters: { tag: [params.moduleVersionTag], moduleId: [params.moduleId] } }),
      ),
    ]);

    if (modVersionsResponse.data.length !== 1) {
      notFound();
    }

    return { mod, modVersionsResponse };
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const { gameServerId, moduleId, moduleVersionTag } = Route.useParams();
  const loaderData = Route.useLoaderData();

  const [{ data: mod }, { data: modVersions }] = useQueries({
    queries: [
      { ...moduleQueryOptions(moduleId), initialData: loaderData.mod },
      {
        ...moduleVersionsQueryOptions({ filters: { tag: [moduleVersionTag], moduleId: [moduleId] } }),
        initialData: loaderData.modVersionsResponse,
      },
    ],
  });

  if (modVersions.data.length !== 1) {
    notFound();
  }

  return <InstallModuleForm modVersion={modVersions.data[0]} gameServerId={gameServerId} mod={mod} readOnly={false} />;
}
