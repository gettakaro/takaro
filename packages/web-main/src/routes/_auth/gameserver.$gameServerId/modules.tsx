import { Skeleton, styled, useTheme } from '@takaro/lib-components';
import { Outlet, redirect } from '@tanstack/react-router';
import { ModuleInstallCard, CardList } from 'components/cards';
import { gameServerModuleInstallationsOptions } from 'queries/gameservers';
import { modulesQueryOptions } from 'queries/modules';
import { createFileRoute } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { useSuspenseQuery } from '@tanstack/react-query';

const SubHeader = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.mediumLarge};
  margin-bottom: ${({ theme }) => theme.spacing[2]}};
`;

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/modules')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_MODULES'])) {
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
  //useGameServerDocumentTitle('Modules');

  const { data: installations } = useSuspenseQuery({
    ...gameServerModuleInstallationsOptions(gameServerId),
    initialData: loaderData.installations,
  });
  const { data: modules } = useSuspenseQuery({
    ...modulesQueryOptions(),
    initialData: loaderData.modules,
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
          <SubHeader>Installed</SubHeader>
          <CardList>
            {installedModules.map((mod) => (
              <ModuleInstallCard key={mod.id} mod={mod} installation={mod.installation} gameServerId={gameServerId} />
            ))}
          </CardList>
        </div>
      )}
      <div>
        <SubHeader>Available</SubHeader>
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
