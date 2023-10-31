import { FC } from 'react';
import { Divider, Loading, styled } from '@takaro/lib-components';
import { FiPlus } from 'react-icons/fi';
import { useInfiniteModules } from 'queries/modules';
import { useNavigate, Outlet } from 'react-router-dom';
import { PATHS } from 'paths';
import { ModuleCardDefinition } from '../components/modules/Cards/ModuleCardDefinition';
import { AddModuleCard, ModuleCards } from '../components/modules/Cards/style';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

const SubHeader = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.mediumLarge};
    margin-bottom: ${({ theme }) => theme.spacing[2]}};
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

  return (
    <>
      <p>
        Modules are the building blocks of your game server. They consist of commands, cronjobs, or hooks. You can
        install the built-in modules easily, just configure them!. Advanced users can create their own modules.
      </p>

      <Divider />
      <SubHeader>Available modules</SubHeader>
      <ModuleCards>
        <AddModuleCard
          onClick={() => {
            navigate(PATHS.modules.create());
          }}
        >
          <FiPlus size={24} />
          <h3>new module</h3>
        </AddModuleCard>
        {modules.pages
          .flatMap((page) => page.data)
          .map((mod) => (
            <ModuleCardDefinition key={mod.id} mod={mod} />
          ))}
        <Outlet />
      </ModuleCards>
      {InfiniteScroll}
    </>
  );
};
