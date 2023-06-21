import {
  ModuleInstallationOutputDTO,
  ModuleOutputDTO,
} from '@takaro/apiclient';
import {
  Tooltip,
  Dialog,
  DialogContent,
  DialogHeading,
  Button,
  styled,
} from '@takaro/lib-components';
import { PATHS } from 'paths';
import { FC, useState, MouseEvent } from 'react';
import { FaTrash as TrashIcon, FaWrench as WrenchIcon } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  ModuleCardContainer,
  SpacedRow,
  ActionIconsContainer,
  DeleteDialogContainer,
} from './style';

import { useGameServerModuleUninstall } from 'queries/gameservers';
import { useGameServerOutletContext } from 'frames/GameServerFrame';

interface IModuleCardProps {
  mod: ModuleOutputDTO;
  installation?: ModuleInstallationOutputDTO;
  onClick?: () => void;
}

export const ModuleCardInstall: FC<IModuleCardProps> = ({
  mod,
  installation,
}) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { mutateAsync: uninstallModule, isLoading: isDeleting } =
    useGameServerModuleUninstall();
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
    <ModuleCardContainer active={false}>
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
              <Tooltip label="Configure">
                <div>
                  <WrenchIcon
                    onClick={() => {
                      navigate(
                        PATHS.gameServer.moduleInstallations.install(
                          gameServerId,
                          mod.id
                        )
                      );
                    }}
                  />
                </div>
              </Tooltip>
              <Tooltip label="Uninstall">
                <div>
                  <TrashIcon
                    key={`uninstall-module-icon-${mod.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDialog(true);
                    }}
                  />
                </div>
              </Tooltip>
            </>
          ) : (
            <Button
              text="Install"
              onClick={() => {
                navigate(
                  PATHS.gameServer.moduleInstallations.install(
                    gameServerId,
                    mod.id
                  )
                );
              }}
            />
          )}
        </ActionIconsContainer>
      </SpacedRow>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeading>
            Module:{' '}
            <span style={{ textTransform: 'capitalize' }}>{mod.name}</span>{' '}
          </DialogHeading>
          <DeleteDialogContainer>
            <h2>Uninstall module</h2>
            <p>
              Are you sure you want to uninstall the module{' '}
              <strong>{mod.name}</strong>? This action is irreversible!
            </p>
            <Button
              isLoading={isDeleting}
              onClick={(e) => handleOnDelete(e)}
              fullWidth
              text={`Uninstall module`}
              color="error"
            />
          </DeleteDialogContainer>
        </DialogContent>
      </Dialog>
    </ModuleCardContainer>
  );
};
