import { ModuleInstallationOutputDTO, ModuleOutputDTO } from '@takaro/apiclient';
import { Tooltip, Dialog, Button, IconButton } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { FC, useState, MouseEvent } from 'react';
import { AiOutlineDelete as DeleteIcon, AiOutlineSetting as ConfigIcon } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { ModuleCardContainer, SpacedRow, ActionIconsContainer } from './style';

import { useGameServerModuleUninstall } from 'queries/gameservers';
import { useGameServerOutletContext } from 'frames/GameServerFrame';

interface IModuleCardProps {
  mod: ModuleOutputDTO;
  installation?: ModuleInstallationOutputDTO;
  onClick?: () => void;
}

export const ModuleCardInstall: FC<IModuleCardProps> = ({ mod, installation }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { mutateAsync: uninstallModule, isLoading: isDeleting } = useGameServerModuleUninstall();
  const navigate = useNavigate();
  const { gameServerId } = useGameServerOutletContext();

  const handleOnDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!installation) throw new Error('No installation found');
    await uninstallModule({
      gameServerId: installation.gameserverId,
      moduleId: mod.id,
    });
    setOpenDialog(false);
  };

  return (
    <ModuleCardContainer>
      <h2>{mod.name}</h2>

      <p>{mod.description}</p>

      <SpacedRow>
        <span>
          {mod.commands.length > 0 && <p>Commands: {mod.commands.length}</p>}
          {mod.hooks.length > 0 && <p>Hooks: {mod.hooks.length}</p>}
          {mod.cronJobs.length > 0 && <p>Cronjobs: {mod.cronJobs.length}</p>}
        </span>
        <ActionIconsContainer>
          {installation ? (
            <>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <IconButton
                    onClick={() => {
                      navigate(PATHS.gameServer.moduleInstallations.install(gameServerId, mod.id));
                    }}
                    ariaLabel="Configure module"
                    icon={<ConfigIcon />}
                  />
                </Tooltip.Trigger>
                <Tooltip.Content>Configure</Tooltip.Content>
              </Tooltip>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDialog(true);
                    }}
                    icon={<DeleteIcon key={`uninstall-module-icon-${mod.id}`} />}
                    ariaLabel="Uninstall module"
                  />
                </Tooltip.Trigger>
                <Tooltip.Content>Uninstall</Tooltip.Content>
              </Tooltip>
            </>
          ) : (
            <Button
              text="Install"
              onClick={() => {
                navigate(PATHS.gameServer.moduleInstallations.install(gameServerId, mod.id));
              }}
            />
          )}
        </ActionIconsContainer>
      </SpacedRow>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading>
            Module: <span style={{ textTransform: 'capitalize' }}>{mod.name}</span>{' '}
          </Dialog.Heading>
          <Dialog.Body>
            <h2>Uninstall module</h2>
            <p>
              Are you sure you want to uninstall the module <strong>{mod.name}</strong>? This action is irreversible!
            </p>
            <Button
              isLoading={isDeleting}
              onClick={(e) => handleOnDelete(e)}
              fullWidth
              text="Uninstall module"
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </ModuleCardContainer>
  );
};
