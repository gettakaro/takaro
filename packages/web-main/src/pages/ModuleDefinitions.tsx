import { FC } from 'react';
import { Divider, Loading, styled, useTheme } from '@takaro/lib-components';
import { PERMISSIONS } from '@takaro/apiclient';
import { useInfiniteModules } from 'queries/modules';
import { Outlet } from 'react-router-dom';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { PermissionsGuard } from 'components/PermissionsGuard';
import { AddCard, CardList, ModuleDefinitionCard } from 'components/cards';
import { PATHS } from 'paths';
import { useNavigate } from 'react-router-dom';

const SubHeader = styled.h2<{ withMargin?: boolean }>`
  font-size: ${({ theme }) => theme.fontSize.mediumLarge};
  margin-bottom: ${({ theme, withMargin }) => (withMargin ? theme.spacing[2] : 0)}};
`;

const SubText = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const ModuleDefinitions: FC = () => {
  useDocumentTitle('Modules');
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: modules, isLoading, InfiniteScroll } = useInfiniteModules();

  if (isLoading) {
    return <Loading />;
  }

  if (!modules) {
    return <p></p>;
  }

  const flattenedModules = modules.pages.flatMap((page) => page.data);
  const builtinModules = flattenedModules.filter((mod) => mod.builtin);
  const customModules = flattenedModules.filter((mod) => !mod.builtin);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[1] }}>
      <p>
        Modules are the building blocks of your game server. They consist of commands, cronjobs, or hooks. You can
        install the built-in modules easily, just configure them!. Advanced users can create their own modules.
      </p>

      <Divider />
      <PermissionsGuard requiredPermissions={[PERMISSIONS.ManageModules]}>
        <SubHeader>Custom</SubHeader>
        <SubText>
          You can create your own modules by starting from scratch or by copying a built-in module. To copy a built-in
          module click on a built-in module & inside the editor click on the copy icon next to it's name.
        </SubText>
        <CardList>
          <PermissionsGuard requiredPermissions={[PERMISSIONS.ManageModules]}>
            <AddCard title="Module" onClick={() => navigate(PATHS.modules.create())} />
          </PermissionsGuard>
          {customModules.map((mod) => (
            <ModuleDefinitionCard key={mod.id} mod={mod} />
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
          <ModuleDefinitionCard key={mod.id} mod={mod} />
        ))}
        <Outlet />
      </CardList>
      {InfiniteScroll}
    </div>
  );
};
