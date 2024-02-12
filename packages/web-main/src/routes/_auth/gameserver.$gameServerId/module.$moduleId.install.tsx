import { gameServerModuleInstallationOptions } from 'queries/gameservers';
import { moduleOptions } from 'queries/modules';
import { createFileRoute } from '@tanstack/react-router';
import { InstallModuleForm } from './-InstallModuleForm';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/module/$moduleId/install')({
  loader: async ({ params, context }) => {
    const [mod, modInstallation] = await Promise.all([
      context.queryClient.ensureQueryData(moduleOptions(params.moduleId)),
      context.queryClient.ensureQueryData(gameServerModuleInstallationOptions(params.gameServerId, params.moduleId)),
    ]);
    return { mod, modInstallation };
  },
  component: Component,
});

export function Component() {
  const { gameServerId } = Route.useParams();
  const { mod, modInstallation } = Route.useLoaderData();

  return <InstallModuleForm gameServerId={gameServerId} modInstallation={modInstallation} mod={mod} readOnly={false} />;
}
