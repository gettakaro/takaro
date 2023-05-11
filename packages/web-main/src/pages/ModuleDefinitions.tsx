import { FC } from 'react';
import { Button, Divider, Loading, styled } from '@takaro/lib-components';
import { Helmet } from 'react-helmet';
import { FiPlus } from 'react-icons/fi';
import { useModules } from 'queries/modules';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';

const Page = styled.div`
  padding: 3rem 8rem;
  h1 {
    margin-bottom: 2rem;
  }
`;

const ModuleCards = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  grid-auto-rows: 160px;
  gap: ${({ theme }) => theme.spacing['1_5']};
`;

const ModuleCard = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing[2]};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const AddModuleCard = styled(ModuleCard)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
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
          {modules.data.data.map((module) => (
            <ModuleCard
              onClick={() => {
                navigate(PATHS.studio.module(module.id));
              }}
              key={module.id}
            >
              <h2>{module.name}</h2>
              <p>{module.description}</p>
              <span>
                {module.commands.length > 0 && (
                  <p>Commands: {module.commands.length}</p>
                )}
                {module.hooks.length > 0 && <p>Hooks: {module.hooks.length}</p>}
                {module.cronJobs.length > 0 && (
                  <p>Cronjobs: {module.cronJobs.length}</p>
                )}
              </span>
            </ModuleCard>
          ))}
          <AddModuleCard
            onClick={() => {
              navigate(PATHS.modules.create());
            }}
          >
            <FiPlus size={24} />
            <h3>new module</h3>
          </AddModuleCard>
        </ModuleCards>
      </Page>
    </>
  );
};
