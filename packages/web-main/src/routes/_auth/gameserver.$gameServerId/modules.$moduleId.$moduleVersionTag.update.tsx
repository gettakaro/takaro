import { gameServerModuleInstallationOptions } from '../../../queries/gameserver';
import { moduleQueryOptions } from '../../../queries/module';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { InstallModuleForm } from './-InstallModuleForm';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { DrawerSkeleton } from '@takaro/lib-components';
import { useQueries } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/modules/$moduleId/$moduleVersionTag/update')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_MODULES', 'MANAGE_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => {
    const [mod, modInstallation] = await Promise.all([
      context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId)),
      context.queryClient.ensureQueryData(gameServerModuleInstallationOptions(params.moduleId, params.gameServerId)),
    ]);
    return { mod, modInstallation };
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const { gameServerId, moduleId } = Route.useParams();
  const loaderData = Route.useLoaderData();

  const [{ data: mod }, { data: modInstallation }] = useQueries({
    queries: [
      { ...moduleQueryOptions(moduleId), initialData: loaderData.mod },
      { ...gameServerModuleInstallationOptions(moduleId, gameServerId), initialData: loaderData.modInstallation },
    ],
  });

  return (
    <InstallModuleForm
      gameServerId={gameServerId}
      modVersion={modInstallation.version}
      modInstallation={modInstallation}
      mod={mod}
    />
  );
}
