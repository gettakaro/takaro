import { ModuleInstallationOutputDTO, ModuleOutputDTO, PERMISSIONS } from '@takaro/apiclient';
import {
  IconButton,
  Card,
  useTheme,
  Dropdown,
  Chip,
  IconTooltip,
  Tooltip,
  Button,
  styled,
} from '@takaro/lib-components';
import { PermissionsGuard } from '../../../components/PermissionsGuard';
import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';
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
import { useNavigate } from '@tanstack/react-router';
import { SpacedRow, InnerBody } from '../style';
import { useGameServerModuleInstall } from '../../../queries/gameserver';
import { getNewestVersionExcludingLatestTag, versionGt } from '../../../util/ModuleVersionHelpers';
import { DeleteImperativeHandle } from '../../../components/dialogs';
import { ModuleUninstallDialog } from '../../../components/dialogs/ModuleUninstallDialog';
import { useQuery } from '@tanstack/react-query';
import { moduleTagsQueryOptions } from '../../../queries/module';
import { ModuleVersionSelectQueryField } from '../../../components/selects';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const Wrapper = styled.div`
  div {
    margin-bottom: 0;
  }
`;

interface IModuleCardProps {
  mod: ModuleOutputDTO;
  installation?: ModuleInstallationOutputDTO;
  onClick?: () => void;
  gameServerId: string;
}

const validationSchema = z.object({
  versionId: z.string().min(1),
});

export const ModuleInstallCard: FC<IModuleCardProps> = ({ mod, installation, gameServerId }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { mutateAsync: installModule } = useGameServerModuleInstall();
  const navigate = useNavigate();
  const theme = useTheme();
  const uninstallModuleDialogRef = useRef<DeleteImperativeHandle>(null);
  const { data: smallVersions } = useQuery(moduleTagsQueryOptions({ limit: 2, moduleId: mod.id }));
  const { handleSubmit, control, reset } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });

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

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = async ({ versionId }) => {
    try {
      await installModule({
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
      reset({ versionId: undefined });
    }
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
                  {smallVersions &&
                    getNewestVersionExcludingLatestTag(smallVersions.data) &&
                    versionGt(getNewestVersionExcludingLatestTag(smallVersions.data).tag, installation.version.tag) && (
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
            <p>{mod.latestVersion.description}</p>

            <SpacedRow>
              <span style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {mod.latestVersion.commands.length > 0 && <p>Commands: {mod.latestVersion.commands.length}</p>}
                {mod.latestVersion.hooks.length > 0 && <p>Hooks: {mod.latestVersion.hooks.length}</p>}
                {mod.latestVersion.cronJobs.length > 0 && <p>Cronjobs: {mod.latestVersion.cronJobs.length}</p>}
                {mod.latestVersion.permissions.length > 0 && <p>Permissions: {mod.latestVersion.permissions.length}</p>}
              </span>
            </SpacedRow>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Wrapper style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                <ModuleVersionSelectQueryField control={control} name="versionId" label="" moduleId={mod.id} />
                <Button type="submit" text="Install" />
              </Wrapper>
            </form>
          </InnerBody>
        </Card.Body>
      </Card>
    </>
  );
};
