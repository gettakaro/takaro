import { moduleQueryOptions, moduleVersionQueryOptions } from '../../../queries/module';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { InstallModuleForm } from './-InstallModuleForm';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { DrawerSkeleton } from '@takaro/lib-components';
import { useQueries } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/modules/$moduleId/$versionId/install/')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => {
    const [mod, modVersion] = await Promise.all([
      context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId)),
      context.queryClient.ensureQueryData(moduleVersionQueryOptions(params.versionId)),
    ]);
    return { mod, modVersion };
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

export function Component() {
  const { gameServerId, moduleId, versionId } = Route.useParams();
  const loaderData = Route.useLoaderData();

  const [{ data: mod }, { data: modVersion }] = useQueries({
    queries: [
      { ...moduleQueryOptions(moduleId), initialData: loaderData.mod },
      { ...moduleVersionQueryOptions(versionId), initialData: loaderData.modVersion },
    ],
  });

  return <InstallModuleForm modVersion={modVersion} gameServerId={gameServerId} mod={mod} readOnly={false} />;
}
