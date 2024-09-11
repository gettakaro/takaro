import { Skeleton } from '@takaro/lib-components';
import { redirect, createFileRoute } from '@tanstack/react-router';
import { CardList } from 'components/cards';
import { gameServerModuleInstallationsOptions } from 'queries/gameserver';
import { modulesQueryOptions } from 'queries/module';
import { hasPermission } from 'hooks/useHasPermission';
import { ModuleInstallationOutputDTO, ModuleOutputArrayDTOAPI, PERMISSIONS } from '@takaro/apiclient';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { userMeQueryOptions } from 'queries/user';
import { ViewSelector } from 'components/ViewSelector';
import { ModulesCardView } from './-components/modules/modulesCardView';
import { ModulesTableView } from './-components/modules/modulesTableView';

export interface ModuleViewProps {
  gameServerId: string;
  installations: ModuleInstallationOutputDTO[];
  modules: ModuleOutputArrayDTOAPI;
}

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/modules')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, [PERMISSIONS.ReadModules])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => {
    const [modules, moduleInstallations] = await Promise.all([
      context.queryClient.ensureQueryData(modulesQueryOptions()),
      context.queryClient.ensureQueryData(gameServerModuleInstallationsOptions(params.gameServerId)),
    ]);

    return { modules: modules, installations: moduleInstallations };
  },
  component: Component,
  pendingComponent: () => (
    <CardList>
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height="100%" width="100%" />
      ))}
    </CardList>
  ),
});

export function Component() {
  const loaderData = Route.useLoaderData();
  const { gameServerId } = Route.useParams();
  useDocumentTitle('Modules');

  const tableView = (
    <ModulesTableView
      gameServerId={gameServerId}
      installations={loaderData.installations}
      modules={loaderData.modules}
    />
  );
  const cardView = (
    <ModulesCardView
      gameServerId={gameServerId}
      installations={loaderData.installations}
      modules={loaderData.modules}
    />
  );
  return <ViewSelector id="shop" tableView={tableView} cardView={cardView} />;
}
