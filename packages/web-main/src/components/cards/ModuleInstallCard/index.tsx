import {
  ModuleInstallationOutputDTO,
  ModuleOutputDTO,
  PERMISSIONS,
  SmallModuleVersionOutputDTO,
} from '@takaro/apiclient';
import { IconButton, Card, useTheme, Dropdown, Chip, Tooltip, Button, styled, Popover } from '@takaro/lib-components';
import { PermissionsGuard } from '../../../components/PermissionsGuard';
import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';
import { FC, useState, MouseEvent, useRef, useEffect } from 'react';
import {
  AiOutlineDelete as DeleteIcon,
  AiOutlineSetting as ConfigIcon,
  AiOutlineMenu as MenuIcon,
  AiOutlineLink as LinkIcon,
  AiOutlineEye as ViewIcon,
  AiOutlineStop as DisableIcon,
  AiOutlineCheck as EnableIcon,
  AiOutlineBook as DocumentationIcon,
  AiOutlineRetweet as DifferentVersionIcon,
} from 'react-icons/ai';
import { useNavigate } from '@tanstack/react-router';
import { SpacedRow, InnerBody } from '../style';
import { useGameServerModuleInstall } from '../../../queries/gameserver';
import { DeleteImperativeHandle } from '../../../components/dialogs';
import { ModuleUninstallDialog } from '../../../components/dialogs/ModuleUninstallDialog';
import { ModuleVersionSelectQueryField } from '../../../components/selects';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const Wrapper = styled.div`
  div {
    margin-bottom: 0;
  }
`;

const DescriptionDiv = styled.div`
  max-height: 100px;
  overflow-y: auto;
  margin-bottom: 10px;
`;

interface IModuleCardProps {
  mod: ModuleOutputDTO;
  installation?: ModuleInstallationOutputDTO;
  onClick?: () => void;
  gameServerId: string;
}

const validationSchema = z.object({
  tag: z.string().min(1),
});

export const ModuleInstallCard: FC<IModuleCardProps> = ({ mod, installation, gameServerId }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { mutateAsync: installModule } = useGameServerModuleInstall();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isLatestSelected, setIsLatestSelected] = useState<boolean>(false);
  const [showInstallOtherVersionPopover, setShowInstallOtherVersionPopover] = useState<boolean>(false);
  const uninstallModuleDialogRef = useRef<DeleteImperativeHandle>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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
      to: '/gameserver/$gameServerId/modules/$moduleId/$moduleVersionTag/install/view',
      params: { gameServerId, moduleId: mod.id, moduleVersionTag: installation!.version.tag },
    });
  };

  const handleConfigureClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: '/gameserver/$gameServerId/modules/$moduleId/$moduleVersionTag/update',
      params: { gameServerId, moduleId: mod.id, moduleVersionTag: installation!.version.tag },
    });
  };

  const handleOnCopyClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(mod.id);
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
      <Card
        data-testid={`module-installation-${mod.name}-card`}
        style={isLatestSelected ? { borderColor: theme.colors.warning } : {}}
        ref={cardRef}
      >
        <Card.Body>
          <InnerBody>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{mod.name}</h2>
              {installation && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
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
                  <Popover
                    open={showInstallOtherVersionPopover}
                    onOpenChange={setShowInstallOtherVersionPopover}
                    placement="bottom"
                  >
                    <Popover.Trigger asChild>
                      <div></div>
                    </Popover.Trigger>
                    <Popover.Content>
                      <div style={{ display: 'flex', padding: '20px', flexDirection: 'column', minWidth: '300px' }}>
                        <h2 style={{ marginBottom: '10px' }}>Install different module version</h2>
                        <ModuleVersionInstallForm
                          moduleId={mod.id}
                          gameServerId={gameServerId}
                          filterVersions={(version) => version.tag !== installation.version.tag}
                        />
                      </div>
                    </Popover.Content>
                  </Popover>

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
                              label="Change module configuration"
                            />
                            <Dropdown.Menu.Item
                              icon={<DifferentVersionIcon />}
                              label="Install different module version"
                              onClick={() => setShowInstallOtherVersionPopover(true)}
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
                </div>
              )}
            </div>
            <DescriptionDiv>{mod.latestVersion.description}</DescriptionDiv>

            <SpacedRow>
              <span style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {mod.latestVersion.commands.length > 0 && <p>Commands: {mod.latestVersion.commands.length}</p>}
                {mod.latestVersion.hooks.length > 0 && <p>Hooks: {mod.latestVersion.hooks.length}</p>}
                {mod.latestVersion.cronJobs.length > 0 && <p>Cronjobs: {mod.latestVersion.cronJobs.length}</p>}
                {mod.latestVersion.permissions.length > 0 && <p>Permissions: {mod.latestVersion.permissions.length}</p>}
              </span>
            </SpacedRow>
            {!installation && (
              <ModuleVersionInstallForm
                moduleId={mod.id}
                gameServerId={gameServerId}
                onVersionTagSelected={(tag) =>
                  tag === 'latest' ? setIsLatestSelected(true) : setIsLatestSelected(false)
                }
              />
            )}
          </InnerBody>
        </Card.Body>
      </Card>
    </>
  );
};

interface ModuleVersionInstallFormProps {
  moduleId: string;
  gameServerId: string;
  onVersionTagSelected?: (tag: string) => void;
  filterVersions?: (version: SmallModuleVersionOutputDTO) => boolean;
}

export const ModuleVersionInstallForm: FC<ModuleVersionInstallFormProps> = ({
  moduleId,
  gameServerId,
  onVersionTagSelected,
  filterVersions,
}) => {
  const navigate = useNavigate();
  const { handleSubmit, control, watch, reset } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = async ({ tag }) => {
    navigate({
      to: '/gameserver/$gameServerId/modules/$moduleId/$moduleVersionTag/install',
      params: { gameServerId, moduleId: moduleId, moduleVersionTag: tag },
    });
    reset({ tag: undefined });
  };

  const isLatestSelected = watch('tag') === 'latest';

  useEffect(() => {
    if (isLatestSelected && typeof onVersionTagSelected === 'function') {
      onVersionTagSelected('latest');
    }
  }, [isLatestSelected]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Wrapper style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
        <ModuleVersionSelectQueryField
          control={control}
          name="tag"
          label=""
          moduleId={moduleId}
          filter={filterVersions}
          returnVariant="tag"
        />
        <Tooltip disabled={!isLatestSelected}>
          <Tooltip.Trigger asChild>
            <Button color={isLatestSelected ? 'warning' : 'primary'} type="submit" text="Install" />
          </Tooltip.Trigger>
          <Tooltip.Content>
            Installing <strong>latest</strong> is strongly discouraged as it might break your installed module. <br />
            If you are not actively developing the module, please select a tagged version to install.
          </Tooltip.Content>
        </Tooltip>
      </Wrapper>
    </form>
  );
};
