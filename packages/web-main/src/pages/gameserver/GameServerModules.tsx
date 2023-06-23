import { Loading, styled } from '@takaro/lib-components';
import { FC, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Outlet } from 'react-router-dom';
import { ModuleCards } from '../../components/modules/Cards/style';
import { ModuleCardInstall } from '../../components/modules/Cards/ModuleCardInstall';
import { useGameServerModuleInstallations } from 'queries/gameservers';
import { useModules } from 'queries/modules';

const Page = styled.div`
  padding: 3rem 8rem;
  h1 {
    margin-bottom: 2rem;
  }
`;

const GameServerModules: FC = () => {
  const { serverId } = useParams();
  const { data: installations } = useGameServerModuleInstallations(serverId!);
  const { data: modules } = useModules();

  const mappedModules = useMemo(() => {
    if (!installations || !modules) {
      return;
    }

    return modules.map((mod) => {
      const installation = installations.find(
        (inst) => inst.moduleId === mod.id
      );
      return {
        ...mod,
        installed: !!installation,
        installation: installation,
      };
    });
  }, [installations, modules]);

  if (!installations || !modules || !mappedModules) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>Modules - Takaro</title>
      </Helmet>
      <Page>
        <h1>Modules</h1>

        <ModuleCards>
          {mappedModules.map((mod) => (
            <ModuleCardInstall
              key={mod.id}
              mod={mod}
              installation={mod.installation}
            />
          ))}
          <Outlet />
        </ModuleCards>
      </Page>
    </>
  );
};

export default GameServerModules;
