import { FC } from 'react';
import { styled, useTheme } from '@takaro/lib-components';
import { useQueries } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { CardList, ModuleInstallCard } from 'components/cards';
import { gameServerModuleInstallationsOptions } from 'queries/gameserver';
import { modulesQueryOptions } from 'queries/module';
import { ModuleViewProps } from '../../modules';

const SubHeader = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.mediumLarge};
  margin-bottom: ${({ theme }) => theme.spacing[2]}};
`;

export const ModulesCardView: FC<ModuleViewProps> = ({
  installations: initialInstallations,
  modules: initialModules,
  gameServerId,
}) => {
  const [{ data: modules }, { data: installations }] = useQueries({
    queries: [
      {
        ...modulesQueryOptions(),
        initialData: initialModules,
      },
      {
        ...gameServerModuleInstallationsOptions(gameServerId),
        initialData: initialInstallations,
      },
    ],
  });

  const mappedModules = modules.data.map((mod) => {
    const installation = installations.find((inst) => inst.moduleId === mod.id);
    return {
      ...mod,
      installed: !!installation,
      installation: installation,
    };
  });

  const installedModules = mappedModules.filter((mod) => mod.installed);
  const availableModules = mappedModules.filter((mod) => !mod.installed);

  const theme = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2], overflowY: 'auto' }}>
      {installedModules.length > 0 && (
        <div>
          <SubHeader>Installed</SubHeader>
          <CardList>
            {installedModules.map((mod) => (
              <ModuleInstallCard key={mod.id} mod={mod} installation={mod.installation} gameServerId={gameServerId} />
            ))}
          </CardList>
        </div>
      )}
      <div>
        <SubHeader>Available</SubHeader>
        <div style={{ overflowY: 'auto', height: '100%' }}>
          <CardList>
            {availableModules.map((mod) => (
              <ModuleInstallCard key={mod.id} mod={mod} installation={mod.installation} gameServerId={gameServerId} />
            ))}
          </CardList>
        </div>
      </div>
      <Outlet />
    </div>
  );
};
