import { gameServerModuleInstallationOptions } from 'queries/gameserver';
import { moduleQueryOptions } from 'queries/module';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { InstallModuleForm } from './-InstallModuleForm';
import { hasPermission } from 'hooks/useHasPermission';
import { PERMISSIONS } from '@takaro/apiclient';
import { userMeQueryOptions } from 'queries/user';
import { DrawerSkeleton } from '@takaro/lib-components';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/modules/$moduleId/install/view')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, [PERMISSIONS.ReadModules])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => {
    const [mod, modInstallation] = await Promise.all([
      context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId)),
      context.queryClient.ensureQueryData(gameServerModuleInstallationOptions(params.gameServerId, params.moduleId)),
    ]);
    return { mod, modInstallation };
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const { gameServerId } = Route.useParams();
  const { mod, modInstallation } = Route.useLoaderData();

  return <InstallModuleForm readOnly={true} gameServerId={gameServerId} modInstallation={modInstallation} mod={mod} />;
}
