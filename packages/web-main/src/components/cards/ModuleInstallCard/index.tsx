import { ModuleInstallationOutputDTO, ModuleOutputDTO, PERMISSIONS } from '@takaro/apiclient';
import {
  IconButton,
  Card,
  useTheme,
  Dropdown,
  Chip,
  DropdownButton,
  Action,
  IconTooltip,
  Popover,
  Tooltip,
} from '@takaro/lib-components';
import { PermissionsGuard } from 'components/PermissionsGuard';
import { AiOutlineArrowRight as ArrowRightIcon } from 'react-icons/ai';
import { FC, useState, MouseEvent, useRef } from 'react';
import {
  AiOutlineDelete as DeleteIcon,
  AiOutlineSetting as ConfigIcon,
  AiOutlineMenu as MenuIcon,
  AiOutlineLink as LinkIcon,
  AiOutlineEye as ViewIcon,
  AiOutlineStop as DisableIcon,
  AiOutlineCheck as EnableIcon,
  AiOutlineExclamation as NewVersionNotifyIcon,
} from 'react-icons/ai';
import { FaExchangeAlt as ChangeVersionIcon } from 'react-icons/fa';
import { useNavigate } from '@tanstack/react-router';
import { SpacedRow, ActionIconsContainer, InnerBody } from '../style';
import { useGameServerModuleInstall } from 'queries/gameserver';
import { getNewestVersionExcludingLatestTag, versionGt, versionLt } from 'util/ModuleVersionHelpers';
import { DeleteImperativeHandle } from 'components/dialogs';
import { ModuleUninstallDialog } from 'components/dialogs/ModuleUninstallDialog';

interface IModuleCardProps {
  mod: ModuleOutputDTO;
  installation?: ModuleInstallationOutputDTO;
  onClick?: () => void;
  gameServerId: string;
}

export const ModuleInstallCard: FC<IModuleCardProps> = ({ mod, installation, gameServerId }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { mutateAsync: installModule } = useGameServerModuleInstall();
  const navigate = useNavigate();
  const theme = useTheme();
  const [openVersionPopover, setOpenVersionPopover] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const uninstallImperativeHandle = useRef<DeleteImperativeHandle>();

  const { versions, latestVersion } = mod;

  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      uninstallImperativeHandle.current?.triggerDelete();
    } else {
      setOpenDialog(true);
    }
  };

  const handleOnOpenClick = () => {
    window.open(`/module-builder/${mod.id}`, '_blank');
  };

  const handleOnViewModuleConfigClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: '/gameserver/$gameServerId/modules/$moduleId/$versionId/install/view',
      params: { gameServerId, moduleId: mod.id, versionId: installation!.version.id },
    });
  };

  const handleConfigureClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: '/gameserver/$gameServerId/modules/$moduleId/$versionId/update',
      params: { gameServerId, moduleId: mod.id, versionId: installation!.version.id },
    });
  };

  const handleInstallClick = (versionId: string) => {
    navigate({
      to: '/gameserver/$gameServerId/modules/$moduleId/$versionId/install',
      params: { gameServerId, moduleId: mod.id, versionId },
    });
  };

  const handleChangeVersionClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenVersionPopover(!openVersionPopover);
  };

  const handleChangeVersion = (versionId: string) => {
    try {
      installModule({
        versionId,
        gameServerId,
        systemConfig: JSON.stringify(installation?.systemConfig),
        userConfig: JSON.stringify(installation?.userConfig),
      });
    } catch {
      navigate({
        to: '/gameserver/$gameServerId/modules/$moduleId/$versionId/install',
        params: { gameServerId, moduleId: mod.id, versionId },
      });
    } finally {
      setOpenVersionPopover(false);
    }
  };

  const handleOnModuleEnableDisableClick = (e: MouseEvent) => {
    e.stopPropagation();

    const systemConfig = installation!.systemConfig;
    systemConfig['enabled'] = !systemConfig['enabled'];
    installModule({
      versionId: latestVersion.id,
      gameServerId,
      systemConfig: JSON.stringify(systemConfig),
      userConfig: JSON.stringify(installation!.userConfig),
    });
  };

  const isModuleInstallationEnabled = installation?.systemConfig['enabled'] === true ? true : false;

  return (
    <>
      {installation && (
        <ModuleUninstallDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          gameServerId={gameServerId}
          versionId={installation.version.id}
          moduleName={mod.name}
        />
      )}
      <Card data-testid={`module-${mod.id}`}>
        <Card.Body>
          <InnerBody>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{mod.name}</h2>
              {installation && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {getNewestVersionExcludingLatestTag(mod.versions) &&
                    versionGt(getNewestVersionExcludingLatestTag(mod.versions).tag, installation.version.tag) && (
                      <IconTooltip icon={<NewVersionNotifyIcon />}>New version available</IconTooltip>
                    )}
                  {!installation.systemConfig['enabled'] && (
                    <Tooltip>
                      <Tooltip.Trigger asChild>
                        <Chip label="disabled" variant="outline" color="error" />
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        No module commands, hooks or cronjobs will be executed. Different from uninstalling the module,
                        the configuration is not removed.
                      </Tooltip.Content>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <Chip variant="outline" color="backgroundAccent" label={installation.version.tag} />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      <p>Installed version</p>
                    </Tooltip.Content>
                  </Tooltip>
                  <Popover open={openVersionPopover} onOpenChange={setOpenVersionPopover}>
                    <Popover.Trigger asChild>
                      <div>
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
                                  onClick={handleConfigureClick}
                                  label="Configure module"
                                />
                                <Dropdown.Menu.Item
                                  icon={<ChangeVersionIcon />}
                                  onClick={handleChangeVersionClick}
                                  label="Upgrade/Downgrade module version"
                                />
                                <Dropdown.Menu.Item
                                  icon={
                                    isModuleInstallationEnabled ? (
                                      <DisableIcon fill={theme.colors.error} />
                                    ) : (
                                      <EnableIcon fill={theme.colors.success} />
                                    )
                                  }
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
                      </div>
                    </Popover.Trigger>
                    <Popover.Content>
                      <div style={{ padding: '15px', maxWidth: '350px' }}>
                        A new module version might have new or changed commands, hooks, cronjobs or permissions.
                        {selectedVersion && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px',
                              padding: '10px',
                            }}
                          >
                            <Chip variant="outline" color="backgroundAccent" label={installation.version.tag} />
                            <ArrowRightIcon />
                            <Chip
                              variant="outline"
                              color={versionLt(installation.version.tag, selectedVersion) ? 'success' : 'error'}
                              label={selectedVersion}
                            />
                          </div>
                        )}
                        <DropdownButton
                          color="background"
                          onSelectedChanged={(selectedIdx) => setSelectedVersion(versions[selectedIdx].tag)}
                          fullWidth
                        >
                          {versions
                            .filter((version) => version.tag !== installation.version.tag)
                            .map((version) => (
                              <Action
                                key={`change-version-${version.id}`}
                                disabled={version.id === installation.version.id}
                                onClick={() => handleChangeVersion(version.id)}
                                text={`${versionGt(version.tag, installation.version.tag) ? 'Upgrade' : 'Downgrade'} to ${version.tag}`}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span>{version.tag.charAt(0).toUpperCase() + version.tag.slice(1)}</span>
                                </div>
                              </Action>
                            ))}
                        </DropdownButton>
                      </div>
                    </Popover.Content>
                  </Popover>
                </div>
              )}
            </div>
            <p>{latestVersion.description}</p>

            <SpacedRow>
              <span style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {latestVersion.commands.length > 0 && <p>Commands: {latestVersion.commands.length}</p>}
                {latestVersion.hooks.length > 0 && <p>Hooks: {latestVersion.hooks.length}</p>}
                {latestVersion.cronJobs.length > 0 && <p>Cronjobs: {latestVersion.cronJobs.length}</p>}
                {latestVersion.permissions.length > 0 && <p>Permissions: {latestVersion.permissions.length}</p>}
              </span>

              <ActionIconsContainer>
                {!installation && (
                  <Tooltip disabled={selectedVersion !== 'latest'}>
                    <Tooltip.Trigger asChild>
                      <DropdownButton
                        color={selectedVersion === 'latest' ? 'warning' : 'primary'}
                        onSelectedChanged={(selectedIdx) => setSelectedVersion(versions[selectedIdx].tag)}
                      >
                        {versions.map((version) => (
                          <Action
                            key={`not-installed-${version.id}`}
                            onClick={() => handleInstallClick(version.id)}
                            text={`Install ${version.tag}`}
                          >
                            {version.tag.charAt(0).toUpperCase() + version.tag.slice(1)}
                          </Action>
                        ))}
                      </DropdownButton>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      We strongly recommend using a tagged semantic version (x.x.x) unless you <br />
                      are actively developing the module. the 'latest' version can result <br />
                      in unexpected breaking changes in both the configuration and behaviour.
                    </Tooltip.Content>
                  </Tooltip>
                )}
              </ActionIconsContainer>
            </SpacedRow>
          </InnerBody>
        </Card.Body>
      </Card>
    </>
  );
};
