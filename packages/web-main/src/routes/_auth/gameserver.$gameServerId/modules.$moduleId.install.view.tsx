import { gameServerModuleInstallationOptions } from 'queries/gameserver';
import { moduleQueryOptions } from 'queries/module';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { InstallModuleForm } from './-InstallModuleForm';
import { hasPermission } from 'hooks/useHasPermission';
import { PERMISSIONS } from '@takaro/apiclient';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/modules/$moduleId/install/view')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, [PERMISSIONS.ReadModules])) {
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
});

export function Component() {
  const { gameServerId } = Route.useParams();
  const { mod, modInstallation } = Route.useLoaderData();

  return <InstallModuleForm gameServerId={gameServerId} modInstallation={modInstallation} mod={mod} readOnly={true} />;
}
