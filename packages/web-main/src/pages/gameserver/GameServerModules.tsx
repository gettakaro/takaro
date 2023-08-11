import { Loading, Skeleton, styled } from '@takaro/lib-components';
import { FC, useMemo } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { ModuleCards } from '../../components/modules/Cards/style';
import { ModuleCardInstall } from '../../components/modules/Cards/ModuleCardInstall';
import { useGameServerModuleInstallations } from 'queries/gameservers';
import { useInfiniteModules } from 'queries/modules';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

const Page = styled.div`
  padding: 3rem 8rem;
  h1 {
    margin-bottom: 2rem;
  }
`;

const GameServerModules: FC = () => {
  useDocumentTitle('Modules');
  const { serverId } = useParams();
  const { data: installations, isLoading } = useGameServerModuleInstallations(serverId!);
  const { data } = useInfiniteModules();

  const mappedModules = useMemo(() => {
    if (!installations || !data) {
      return;
    }

    // todo: currently weird implementation :), you'll probably come back to this and think wth happened here :D
    // enjoy the ride
    const modules = data.pages.flatMap((page) => page.data);
    return modules.map((mod) => {
      const installation = installations.find((inst) => inst.moduleId === mod.id);
      return {
        ...mod,
        installed: !!installation,
        installation: installation,
      };
    });
  }, [installations, data]);

  if (isLoading) {
    return (
      <ModuleCards>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="100%" width="100%" />
        ))}
      </ModuleCards>
    );
  }

  if (!installations || !data || !mappedModules) {
    return <Loading />;
  }

  return (
    <>
      <Page>
        <h1>Modules</h1>

        <ModuleCards>
          {mappedModules.map((mod) => (
            <ModuleCardInstall key={mod.id} mod={mod} installation={mod.installation} />
          ))}
          <Outlet />
        </ModuleCards>
      </Page>
    </>
  );
};

export default GameServerModules;
