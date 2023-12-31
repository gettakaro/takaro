import { Loading, Skeleton, styled } from '@takaro/lib-components';
import { FC, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { ModuleInstallCard, CardList } from 'components/cards';
import { useGameServerModuleInstallations } from 'queries/gameservers';
import { useInfiniteModules } from 'queries/modules';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useGameServerDocumentTitle } from 'hooks/useDocumentTitle';

const SubHeader = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.mediumLarge};
  margin-bottom: ${({ theme }) => theme.spacing[2]}};
`;

const GameServerModules: FC = () => {
  useGameServerDocumentTitle('Modules');
  const { selectedGameServerId } = useSelectedGameServer();
  const { data: installations, isLoading } = useGameServerModuleInstallations(selectedGameServerId);

  const { data } = useInfiniteModules();

  const mappedModules = useMemo(() => {
    if (!installations || !data) {
      return;
    }

    // todo: Instead of paginated view of the modules we just flat map them
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
      <CardList>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="100%" width="100%" />
        ))}
      </CardList>
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
      <CardList>
        {installedModules.map((mod) => (
          <ModuleInstallCard key={mod.id} mod={mod} installation={mod.installation} />
        ))}
      </CardList>
      <SubHeader>Available</SubHeader>
      <CardList>
        {availableModules.map((mod) => (
          <ModuleInstallCard key={mod.id} mod={mod} installation={mod.installation} />
        ))}
      </CardList>
      <Outlet />
    </>
  );
};

export default GameServerModules;
