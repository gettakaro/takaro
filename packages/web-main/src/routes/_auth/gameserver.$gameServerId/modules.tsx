import { Skeleton, styled, useTheme } from '@takaro/lib-components';
import { Outlet, redirect, createFileRoute } from '@tanstack/react-router';
import { useQueries } from '@tanstack/react-query';
import { ModuleInstallCard, CardList } from '../../../components/cards';
import { moduleInstallationsOptions } from '../../../queries/gameserver';
import { modulesQueryOptions } from '../../../queries/module';
import { hasPermission } from '../../../hooks/useHasPermission';
import { PERMISSIONS } from '@takaro/apiclient';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { userMeQueryOptions } from '../../../queries/user';

const SubHeader = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.mediumLarge};
  margin-bottom: ${({ theme }) => theme.spacing[2]}};
`;

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
      context.queryClient.ensureQueryData(
        moduleInstallationsOptions({
          filters: { gameserverId: [params.gameServerId] },
        }),
      ),
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

  const [{ data: modules }, { data: installations }] = useQueries({
    queries: [
      {
        ...modulesQueryOptions(),
        initialData: loaderData.modules,
      },
      {
        ...moduleInstallationsOptions({
          filters: { gameserverId: [gameServerId] },
        }),
        initialData: loaderData.installations,
      },
    ],
  });

  const mappedModules = modules.data.map((mod) => {
    const installation = installations.find((inst) => inst.moduleId === mod.id);
    return {
      ...mod,
      installed: !!installation,
      installation: installation,
    };
  });

  const installedModules = mappedModules.filter((mod) => mod.installed);
  const availableModules = mappedModules.filter((mod) => !mod.installed);

  const theme = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2], overflowY: 'auto' }}>
      {installedModules.length > 0 && (
        <div>
          <SubHeader>Installed Modules</SubHeader>
          <CardList>
            {installedModules.map((mod) => (
              <ModuleInstallCard key={mod.id} mod={mod} installation={mod.installation} gameServerId={gameServerId} />
            ))}
          </CardList>
        </div>
      )}
      <div>
        <SubHeader>Available Modules</SubHeader>
        <div style={{ overflowY: 'auto', height: '100%' }}>
          <CardList>
            {availableModules.map((mod) => (
              <ModuleInstallCard key={mod.id} mod={mod} installation={mod.installation} gameServerId={gameServerId} />
            ))}
          </CardList>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
