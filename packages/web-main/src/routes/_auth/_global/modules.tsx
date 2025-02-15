import { Divider, Skeleton, styled, useTheme, InfiniteScroll, Dropdown, Button } from '@takaro/lib-components';
import { PERMISSIONS } from '@takaro/apiclient';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { PermissionsGuard } from '../../../components/PermissionsGuard';
import { CardList, ModuleDefinitionCard } from '../../../components/cards';
import { useNavigate, Outlet, redirect, createFileRoute } from '@tanstack/react-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { hasPermission } from '../../../hooks/useHasPermission';
import { modulesInfiniteQueryOptions, customModuleCountQueryOptions } from '../../../queries/module';
import { userMeQueryOptions } from '../../../queries/user';
import { globalGameServerSetingQueryOptions } from '../../../queries/setting';
import { getCurrentDomain } from '../../../util/getCurrentDomain';
import { MaxUsage } from '../../../components/MaxUsage';
import { AiOutlineImport as ImportModuleIcon, AiOutlinePlus as CreateModuleIcon } from 'react-icons/ai';

const SubHeader = styled.h2<{ withMargin?: boolean }>`
  font-size: ${({ theme }) => theme.fontSize.mediumLarge};
  margin-bottom: ${({ theme, withMargin }) => (withMargin ? theme.spacing[2] : 0)}};
`;

const SubText = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const Route = createFileRoute('/_auth/_global/modules')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    const developerModeEnabled = await context.queryClient.ensureQueryData(
      globalGameServerSetingQueryOptions('developerMode'),
    );

    if (!hasPermission(session, [PERMISSIONS.ReadModules]) || developerModeEnabled.value === 'false') {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context }) => {
    const opts = modulesInfiniteQueryOptions();
    return {
      modules: context.queryClient.getQueryData(opts.queryKey) ?? (await context.queryClient.fetchInfiniteQuery(opts)),
      customModulesCount: await context.queryClient.ensureQueryData(customModuleCountQueryOptions()),
      me: await context.queryClient.ensureQueryData(userMeQueryOptions()),
    };
  },
  component: Component,
  pendingComponent: PendingComponent,
});

function PendingComponent() {
  return <Skeleton variant="rectangular" height="100%" width="100%" />;
}

function Component() {
  useDocumentTitle('Modules');
  const navigate = useNavigate();
  const theme = useTheme();
  const loaderData = Route.useLoaderData();

  const {
    data: modules,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...modulesInfiniteQueryOptions(),
    initialData: loaderData.modules,
  });

  const { data: me } = useQuery({ ...userMeQueryOptions(), initialData: loaderData.me });
  const { data: customModuleCount } = useQuery({
    ...customModuleCountQueryOptions(),
    initialData: loaderData.customModulesCount,
  });

  if (!modules || isLoading) {
    return <PendingComponent />;
  }

  const flattenedModules = modules.pages.flatMap((page) => page.data);
  const builtinModules = flattenedModules.filter((mod) => mod.builtin);
  const customModules = flattenedModules.filter((mod) => !mod.builtin);

  const currentDomain = getCurrentDomain(me);
  const maxModulesCount = currentDomain.maxModules;
  const canCreateModule = customModuleCount < maxModulesCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[1] }}>
      <p>
        Modules are the building blocks of your game server. They consist of commands, cronjobs, or hooks. You can
        install the built-in modules easily, just configure them!. Advanced users can create their own modules.
      </p>

      <Divider />
      <PermissionsGuard requiredPermissions={[PERMISSIONS.ManageModules]}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SubHeader>Custom</SubHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <MaxUsage value={customModuleCount} total={maxModulesCount} unit="Modules" />
            <PermissionsGuard requiredPermissions={[PERMISSIONS.ManageModules]}>
              <Dropdown>
                <Dropdown.Trigger asChild>
                  <Button text="Module actions" />
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  <Dropdown.Menu.Group>
                    <Dropdown.Menu.Item
                      icon={<CreateModuleIcon />}
                      onClick={() => navigate({ to: '/modules/create', search: { view: 'builder' } })}
                      label="Create module with builder"
                      disabled={!canCreateModule}
                    />
                    <Dropdown.Menu.Item
                      icon={<CreateModuleIcon />}
                      onClick={() => navigate({ to: '/modules/create', search: { view: 'manual' } })}
                      label="Create module from schema"
                      disabled={!canCreateModule}
                    />
                    <Dropdown.Menu.Item
                      icon={<ImportModuleIcon />}
                      onClick={() => navigate({ to: '/modules/create/import' })}
                      label="Import module from file"
                      disabled={!canCreateModule}
                    />
                  </Dropdown.Menu.Group>
                </Dropdown.Menu>
              </Dropdown>
            </PermissionsGuard>
          </div>
        </div>
        <SubText>
          You can create your own modules by starting from scratch or by copying a built-in module. To copy a built-in
          module click on a built-in module & inside the editor click on the copy icon next to it's name.
        </SubText>
        <CardList>
          {customModules.map((mod) => (
            <ModuleDefinitionCard key={mod.id} mod={mod} canCopyModule={canCreateModule} />
          ))}
        </CardList>
      </PermissionsGuard>
      <SubHeader>Built-in</SubHeader>
      <SubText>
        These modules are built-in from Takaro and can be installed per server through the modules page for a selected
        gameserver. If you want to view how they are implemented, you can view the source by clicking on a module.
      </SubText>
      <CardList>
        {builtinModules.map((mod) => (
          <ModuleDefinitionCard key={mod.id} mod={mod} canCopyModule={canCreateModule} />
        ))}
        <Outlet />
      </CardList>
      <InfiniteScroll
        isFetching={isFetching}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}
