import { Loading, Skeleton, styled } from '@takaro/lib-components';
import { FC, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { ModuleCards } from '../../components/modules/Cards/style';
import { ModuleCardInstall } from '../../components/modules/Cards/ModuleCardInstall';
import { useGameServerModuleInstallations } from 'queries/gameservers';
import { useInfiniteModules } from 'queries/modules';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

const SubHeader = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.mediumLarge};
  margin-bottom: ${({ theme }) => theme.spacing[2]}};
`;

const GameServerModules: FC = () => {
  useDocumentTitle('Modules');
  const { selectedGameServerId } = useSelectedGameServer();
  const { data: installations, isLoading } = useGameServerModuleInstallations(selectedGameServerId);
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

  const installedModules = mappedModules.filter((mod) => mod.installed);
  const availableModules = mappedModules.filter((mod) => !mod.installed);

  return (
    <>
      <SubHeader>Installed</SubHeader>
      <ModuleCards>
        {installedModules.map((mod) => (
          <ModuleCardInstall key={mod.id} mod={mod} installation={mod.installation} />
        ))}
        <Outlet />
      </ModuleCards>
      <SubHeader>Available</SubHeader>
      <ModuleCards>
        {availableModules.map((mod) => (
          <ModuleCardInstall key={mod.id} mod={mod} installation={mod.installation} />
        ))}
        <Outlet />
      </ModuleCards>
    </>
  );
};

export default GameServerModules;
