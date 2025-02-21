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
import { PermissionsGuard } from '../../../components/PermissionsGuard';
import { AiOutlineArrowRight as ArrowRightIcon, AiOutlineCopy as CopyIcon } from 'react-icons/ai';
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
  AiOutlineBook as DocumentationIcon,
} from 'react-icons/ai';
import { FaExchangeAlt as ChangeVersionIcon } from 'react-icons/fa';
import { useNavigate } from '@tanstack/react-router';
import { SpacedRow, ActionIconsContainer, InnerBody } from '../style';
import { useGameServerModuleInstall } from '../../../queries/gameserver';
import { getNewestVersionExcludingLatestTag, versionGt, versionLt } from '../../../util/ModuleVersionHelpers';
import { DeleteImperativeHandle } from '../../../components/dialogs';
import { ModuleUninstallDialog } from '../../../components/dialogs/ModuleUninstallDialog';

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
  const uninstallModuleDialogRef = useRef<DeleteImperativeHandle>(null);

  const handleOnUninstallClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      console.log(uninstallModuleDialogRef.current);
      uninstallModuleDialogRef.current?.triggerDelete();
    } else {
      setOpenDialog(true);
    }
  };

  const handleOnOpenInModuleBuilderClick = () => {
    window.open(`/module-builder/${mod.id}`, '_blank');
  };
  const handleOnOpenInDocumentationClick = () => {
    window.open('https://docs.takaro.io/advanced/modules', '_blank');
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

  const handleOnCopyClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(mod.id);
  };

  const handleChangeVersionClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenVersionPopover(true);
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
      versionId: installation!.versionId,
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
          ref={uninstallModuleDialogRef}
          open={openDialog}
          onOpenChange={setOpenDialog}
          gameServerId={gameServerId}
          versionId={installation.version.id}
          moduleId={mod.id}
          moduleName={mod.name}
        />
      )}
      <Card data-testid={`module-installation-${mod.name}-card`}>
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
                                  disabled={mod.versions.length < 2}
                                />
                                <Dropdown.Menu.Item
                                  icon={<CopyIcon />}
                                  onClick={handleOnCopyClick}
                                  label="Copy module id"
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
                                  onClick={handleOnUninstallClick}
                                  label="Uninstall module"
                                />
                              </PermissionsGuard>
                            </Dropdown.Menu.Group>
                            <Dropdown.Menu.Group>
                              <Dropdown.Menu.Item
                                icon={<LinkIcon />}
                                onClick={handleOnOpenInModuleBuilderClick}
                                label="Open in Module Builder"
                              />
                              <Dropdown.Menu.Item
                                icon={<DocumentationIcon />}
                                label="View module documentation"
                                onClick={handleOnOpenInDocumentationClick}
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
                          onSelectedChanged={(selectedIdx) =>
                            setSelectedVersion(
                              mod.versions.filter((version) => version.tag !== installation!.version.tag)[selectedIdx]
                                .tag,
                            )
                          }
                          fullWidth
                        >
                          {mod.versions
                            .filter((version) => version.tag !== installation!.version.tag)
                            .map((version) => (
                              <Action
                                key={`change-version-${version.id}`}
                                disabled={version.id === installation!.version.id}
                                onClick={() => handleChangeVersion(version.id)}
                                text={`${versionGt(version.tag, installation!.version.tag) ? 'Upgrade' : 'Downgrade'} to ${version.tag}`}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span>{version.tag}</span>
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
            <p>{mod.latestVersion.description}</p>

            <SpacedRow>
              <span style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {mod.latestVersion.commands.length > 0 && <p>Commands: {mod.latestVersion.commands.length}</p>}
                {mod.latestVersion.hooks.length > 0 && <p>Hooks: {mod.latestVersion.hooks.length}</p>}
                {mod.latestVersion.cronJobs.length > 0 && <p>Cronjobs: {mod.latestVersion.cronJobs.length}</p>}
                {mod.latestVersion.permissions.length > 0 && <p>Permissions: {mod.latestVersion.permissions.length}</p>}
              </span>

              <ActionIconsContainer>
                {!installation && (
                  <Tooltip disabled={selectedVersion !== 'latest'}>
                    <Tooltip.Trigger asChild>
                      <DropdownButton
                        color={selectedVersion === 'latest' ? 'warning' : 'primary'}
                        onSelectedChanged={(selectedIdx) => setSelectedVersion(mod.versions[selectedIdx].tag)}
                      >
                        {mod.versions.map((version) => (
                          <Action
                            key={`not-installed-${version.id}`}
                            onClick={() => handleInstallClick(version.id)}
                            text={`Install ${version.tag}`}
                          >
                            {version.tag}
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
