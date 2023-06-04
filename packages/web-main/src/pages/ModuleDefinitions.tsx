import { FC } from 'react';
import { Divider, Loading, styled } from '@takaro/lib-components';
import { Helmet } from 'react-helmet';
import { FiPlus } from 'react-icons/fi';
import { useModules } from 'queries/modules';
import { useNavigate, Outlet } from 'react-router-dom';
import { PATHS } from 'paths';
import { FloatingDelayGroup } from '@floating-ui/react';
import { ModuleCardDefinition } from '../components/modules/Cards/ModuleCardDefinition';
import { AddModuleCard, ModuleCards } from '../components/modules/Cards/style';

const Page = styled.div`
  padding: 3rem 8rem;
  h1 {
    margin-bottom: 2rem;
  }
`;

export const ModuleDefinitions: FC = () => {
  const { data: modules } = useModules();
  const navigate = useNavigate();

  if (!modules) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>Modules - Takaro</title>
      </Helmet>
      <Page>
        <p>
          Modules are the building blocks of your game server. They consist of
          commands, cronjobs, or hooks. You can install the built-in modules
          easily, just configure them!. Advanced users can create their own
          modules.
        </p>

        <Divider />
        <h1>Available modules</h1>
        <ModuleCards>
          <AddModuleCard
            active={true}
            onClick={() => {
              navigate(PATHS.modules.create());
            }}
          >
            <FiPlus size={24} />
            <h3>new module</h3>
          </AddModuleCard>
          <FloatingDelayGroup delay={{ open: 1000, close: 200 }}>
            {modules.map((mod) => (
              <ModuleCardDefinition key={mod.id} mod={mod} />
            ))}
            <Outlet />
          </FloatingDelayGroup>
        </ModuleCards>
      </Page>
    </>
  );
};
