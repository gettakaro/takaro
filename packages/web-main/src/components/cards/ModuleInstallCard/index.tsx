import { ModuleInstallationOutputDTO, ModuleOutputDTO, PERMISSIONS } from '@takaro/apiclient';
import {
  Dialog,
  Button,
  IconButton,
  Card,
  useTheme,
  Dropdown,
  ValueConfirmationField,
  Chip,
} from '@takaro/lib-components';
import { PermissionsGuard } from 'components/PermissionsGuard';
import { useSnackbar } from 'notistack';

import { FC, useState, MouseEvent } from 'react';
import {
  AiOutlineDelete as DeleteIcon,
  AiOutlineSetting as ConfigIcon,
  AiOutlineMenu as MenuIcon,
  AiOutlineLink as LinkIcon,
  AiOutlineEye as ViewIcon,
  AiOutlineStop as DisableIcon,
  AiOutlineCheck as EnableIcon,
} from 'react-icons/ai';

import { useNavigate } from '@tanstack/react-router';
import { SpacedRow, ActionIconsContainer, CardBody } from '../style';
import { useGameServerModuleInstall, useGameServerModuleUninstall } from 'queries/gameserver';

interface IModuleCardProps {
  mod: ModuleOutputDTO;
  installation?: ModuleInstallationOutputDTO;
  onClick?: () => void;
  gameServerId: string;
}

export const ModuleInstallCard: FC<IModuleCardProps> = ({ mod, installation, gameServerId }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [valid, setValid] = useState<boolean>(false);
  const { mutateAsync: uninstallModule, isPending: isDeleting, isSuccess } = useGameServerModuleUninstall();
  const { mutate: installModule } = useGameServerModuleInstall();
  const navigate = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      handleUninstall(e);
    } else {
      setOpenDialog(true);
    }
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

  if (isSuccess) {
    enqueueSnackbar('Module uninstalled!', { variant: 'default', type: 'success' });
  }

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

  return (
    <>
      <Card data-testid={`module-${mod.id}`}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{mod.name}</h2>
            {installation && (
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
                    <Dropdown.Menu.Item
                      icon={<LinkIcon />}
                      onClick={handleOnOpenClick}
                      label="Open in Module Builder"
                    />
                  </Dropdown.Menu.Group>
                </Dropdown.Menu>
              </Dropdown>
            )}
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
