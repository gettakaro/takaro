import {
  AiOutlineDelete as DeleteIcon,
  AiOutlineSetting as ConfigIcon,
  AiOutlineMenu as MenuIcon,
  AiOutlineLink as LinkIcon,
  AiOutlineEye as ViewIcon,
  AiOutlineStop as DisableIcon,
  AiOutlineCheck as EnableIcon,
} from 'react-icons/ai';
import { IconButton, Dropdown, useTheme, Dialog, ValueConfirmationField, Button } from '@takaro/lib-components';
import { PermissionsGuard } from 'components/PermissionsGuard';
import { ModuleInstallationOutputDTO, ModuleOutputDTO, PERMISSIONS } from '@takaro/apiclient';
import { FC, MouseEvent, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGameServerModuleInstall, useGameServerModuleUninstall } from 'queries/gameserver';
import { useSnackbar } from 'notistack';

interface ModuleInstallActionsProps {
  mod: ModuleOutputDTO;
  gameServerId: string;
  installation?: ModuleInstallationOutputDTO;
}

export const ModuleInstallActions: FC<ModuleInstallActionsProps> = ({ mod, gameServerId, installation }) => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [valid, setValid] = useState<boolean>(false);
  const { mutate: installModule } = useGameServerModuleInstall();
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: uninstallModule, isPending: isDeleting, isSuccess } = useGameServerModuleUninstall();
  const navigate = useNavigate();
  const handleOnOpenClick = () => {
    window.open(`/module-builder/${mod.id}`, '_blank');
  };

  const handleOnViewModuleConfigClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: '/gameserver/$gameServerId/modules/$moduleId/install/view',
      params: { gameServerId, moduleId: mod.id },
    });
  };

  const handleUninstall = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!installation) throw new Error('No installation found');
    await uninstallModule({
      gameServerId: installation.gameserverId,
      moduleId: mod.id,
    });
    setOpenDialog(false);
  };

  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      handleUninstall(e);
    } else {
      setOpenDialog(true);
    }
  };

  const handleInstallConfigureClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: '/gameserver/$gameServerId/modules/$moduleId/install',
      params: { gameServerId, moduleId: mod.id },
    });
  };

  const handleOnModuleEnableDisableClick = (e: MouseEvent) => {
    e.stopPropagation();

    if (installation) {
      const systemConfig = installation.systemConfig;
      systemConfig['enabled'] = !systemConfig['enabled'];
      installModule({
        moduleId: mod.id,
        gameServerId,
        moduleInstall: {
          systemConfig: JSON.stringify(systemConfig),
          userConfig: JSON.stringify(installation.userConfig),
        },
      });
    }
  };

  const isModuleInstallationEnabled = installation?.systemConfig['enabled'] === true ? true : false;

  if (isSuccess) {
    enqueueSnackbar('Module uninstalled!', { variant: 'default', type: 'success' });
  }

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger asChild>
          <IconButton icon={<MenuIcon />} ariaLabel="Settings" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Group label="Actions">
            <PermissionsGuard requiredPermissions={[[PERMISSIONS.ManageModules]]}>
              <Dropdown.Menu.Item
                icon={<ViewIcon />}
                onClick={handleOnViewModuleConfigClick}
                label="View module config"
              />
              <Dropdown.Menu.Item
                icon={<ConfigIcon />}
                onClick={handleInstallConfigureClick}
                label="Configure module "
              />
              <Dropdown.Menu.Item
                icon={isModuleInstallationEnabled ? <DisableIcon fill={theme.colors.error} /> : <EnableIcon />}
                onClick={handleOnModuleEnableDisableClick}
                label={isModuleInstallationEnabled ? 'Disable module' : 'Enable module'}
              />

              <Dropdown.Menu.Item
                icon={<DeleteIcon fill={theme.colors.error} />}
                onClick={handleOnDeleteClick}
                label="Uninstall module"
              />
            </PermissionsGuard>
          </Dropdown.Menu.Group>
          <Dropdown.Menu.Group>
            <Dropdown.Menu.Item icon={<LinkIcon />} onClick={handleOnOpenClick} label="Open in Module Builder" />
          </Dropdown.Menu.Group>
        </Dropdown.Menu>
      </Dropdown>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading>Module uninstall</Dialog.Heading>

          <Dialog.Body>
            <p style={{ alignContent: 'center' }}>
              Are you sure you want to uninstall the module <strong>{mod.name}</strong>? To confirm, type the module
              name below.
            </p>
            <ValueConfirmationField
              id="uninstallModuleConfirmation"
              onValidChange={(valid) => setValid(valid)}
              value={mod.name}
              label="Module name"
            />
            <Button
              isLoading={isDeleting}
              onClick={(e) => handleUninstall(e)}
              fullWidth
              disabled={!valid}
              text="Uninstall module"
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
