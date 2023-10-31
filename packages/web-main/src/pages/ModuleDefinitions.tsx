import { FC } from 'react';
import { Divider, Loading, styled } from '@takaro/lib-components';
import { FiPlus } from 'react-icons/fi';
import { useInfiniteModules } from 'queries/modules';
import { useNavigate, Outlet } from 'react-router-dom';
import { PATHS } from 'paths';
import { ModuleCardDefinition } from '../components/modules/Cards/ModuleCardDefinition';
import { AddModuleCard, ModuleCards } from '../components/modules/Cards/style';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

const SubHeader = styled.h2<{ withMargin?: boolean }>`
  font-size: ${({ theme }) => theme.fontSize.mediumLarge};
  margin-bottom: ${({ theme, withMargin }) => (withMargin ? theme.spacing[2] : 0)}};
`;

const SubText = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const ModuleDefinitions: FC = () => {
  useDocumentTitle('Modules');
  const { data: modules, isLoading, InfiniteScroll } = useInfiniteModules();

  const navigate = useNavigate();

  if (isLoading) {
    return <Loading />;
  }

  // TODO: handle empty state
  if (!modules) {
    return <p></p>;
  }

  const flattenedModules = modules.pages.flatMap((page) => page.data);
  const builtinModules = flattenedModules.filter((mod) => mod.builtin);
  const customModules = flattenedModules.filter((mod) => !mod.builtin);

  return (
    <>
      <p>
        Modules are the building blocks of your game server. They consist of commands, cronjobs, or hooks. You can
        install the built-in modules easily, just configure them!. Advanced users can create their own modules.
      </p>

      <Divider />
      <SubHeader withMargin>Yours</SubHeader>
      <ModuleCards>
        <AddModuleCard
          onClick={() => {
            navigate(PATHS.modules.create());
          }}
        >
          <FiPlus size={24} />
          <h3>new module</h3>
        </AddModuleCard>
        {customModules.map((mod) => (
          <ModuleCardDefinition key={mod.id} mod={mod} />
        ))}
      </ModuleCards>
      <SubHeader>Built-in</SubHeader>
      <SubText>
        These modules are built-in and can be installed per server through the modules page for a selected gameserver.
        Tip: you can copy a built-in module in the editor and modify it to your needs.
      </SubText>
      <ModuleCards>
        {builtinModules.map((mod) => (
          <ModuleCardDefinition key={mod.id} mod={mod} />
        ))}
        <Outlet />
      </ModuleCards>
      {InfiniteScroll}
    </>
  );
};
