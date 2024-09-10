import { ModuleInstallationOutputDTO, ModuleOutputDTO } from '@takaro/apiclient';
import { Button, Card, Chip } from '@takaro/lib-components';
import { FC, MouseEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { SpacedRow, ActionIconsContainer, CardBody } from '../style';
import { ModuleInstallActions } from './ModuleInstallActions';

interface IModuleCardProps {
  mod: ModuleOutputDTO;
  installation?: ModuleInstallationOutputDTO;
  onClick?: () => void;
  gameServerId: string;
}

export const ModuleInstallCard: FC<IModuleCardProps> = ({ mod, installation, gameServerId }) => {
  const navigate = useNavigate();

  const handleInstallConfigureClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: '/gameserver/$gameServerId/modules/$moduleId/install',
      params: { gameServerId, moduleId: mod.id },
    });
  };

  return (
    <>
      <Card data-testid={`module-${mod.id}`}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{mod.name}</h2>
            {installation && <ModuleInstallActions installation={installation} gameServerId={gameServerId} mod={mod} />}
          </div>
          <p>{mod.description}</p>

          <SpacedRow>
            {installation && !installation.systemConfig['enabled'] ? (
              <Chip label="disabled" variant="outline" color="error" />
            ) : (
              <span style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {mod.commands.length > 0 && <p>Commands: {mod.commands.length}</p>}
                {mod.hooks.length > 0 && <p>Hooks: {mod.hooks.length}</p>}
                {mod.cronJobs.length > 0 && <p>Cronjobs: {mod.cronJobs.length}</p>}
                {mod.permissions.length > 0 && <p>Permissions: {mod.permissions.length}</p>}
              </span>
            )}
            <ActionIconsContainer>
              {!installation && <Button text="Install" onClick={handleInstallConfigureClick} />}
            </ActionIconsContainer>
          </SpacedRow>
        </CardBody>
      </Card>
    </>
  );
};
