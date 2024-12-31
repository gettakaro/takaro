import {
  Company,
  Tooltip,
  Dialog,
  Button,
  IconButton,
  Card,
  Dropdown,
  useTheme,
  ValueConfirmationField,
  Chip,
} from '@takaro/lib-components';
import { PERMISSIONS, ModuleOutputDTO } from '@takaro/apiclient';
import { useModuleRemove } from 'queries/module';
import { FC, useState, MouseEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { SpacedRow, ActionIconsContainer, InnerBody } from '../style';
import { PermissionsGuard } from 'components/PermissionsGuard';
import {
  AiOutlineMenu as MenuIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineLink as LinkIcon,
  AiOutlineEye as ViewIcon,
  AiOutlineCopy as CopyIcon,
  AiOutlineExport as ExportIcon,
  AiOutlineTag as TagIcon,
} from 'react-icons/ai';
import { TagModuleDialog } from './TagModuleDialog';
import { ExportModuleDialog } from './ExportModuleDialog';
import { DateTime } from 'luxon';

interface IModuleCardProps {
  mod: ModuleOutputDTO;
}

export const ModuleDefinitionCard: FC<IModuleCardProps> = ({ mod }) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openTagDialog, setOpenTagDialog] = useState<boolean>(false);
  const [openExportDialog, setOpenExportDialog] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);
  const { mutate: removeModule, isPending: isDeleting, isSuccess: deleteIsSuccess } = useModuleRemove();

  const { latestVersion } = mod;

  const theme = useTheme();
  const navigate = useNavigate();

  const handleOnDelete = (e: MouseEvent) => {
    e.stopPropagation();
    removeModule({ moduleId: mod.id });
  };

  if (deleteIsSuccess) {
    setOpenDeleteDialog(false);
  }

  const handleOnEditClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/modules/$moduleId/update', params: { moduleId: mod.id } });
  };

  const handleOnViewClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/modules/$moduleId/view', params: { moduleId: mod.id } });
  };

  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      handleOnDelete(e);
    } else {
      setOpenDeleteDialog(true);
    }
  };

  const handleOnTagClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenTagDialog(true);
  };

  const handleOnCopyClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/modules/$moduleId/copy', params: { moduleId: mod.id } });
  };

  const handleOnOpenClick = (e: MouseEvent) => {
    e.stopPropagation();
    window.open(`/module-builder/${mod.id}`, '_blank');
  };

  const handleOnExportClick = async (e: MouseEvent) => {
    e.stopPropagation();
    setOpenExportDialog(true);
  };

  const newestTag = mod.versions
    .filter((version) => version.tag !== 'latest')
    .sort((a, b) => DateTime.fromISO(b.createdAt).toMillis() - DateTime.fromISO(a.createdAt).toMillis())[0]?.tag;

  return (
    <>
      <Card data-testid={`${mod.name}`}>
        <Card.Body>
          <InnerBody>
            <SpacedRow>
              <h2>{mod.name}</h2>
              <ActionIconsContainer>
                <Tooltip>
                  <Tooltip.Trigger>
                    <Chip variant="outline" color={newestTag ? 'primary' : 'secondary'} label={newestTag ?? 'None'} />
                  </Tooltip.Trigger>
                  <Tooltip.Content>Latest version</Tooltip.Content>
                </Tooltip>
                {mod.builtin && (
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Company
                        key={`builtin-module-icon-${mod.id}`}
                        textVisible={false}
                        size="tiny"
                        iconColor="secondary"
                      />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      This is a built-in module, you cannot edit or delete it.
                      <br />
                      You can however copy it and edit the copy.
                      <br />
                      Open the module by clicking on it.
                    </Tooltip.Content>
                  </Tooltip>
                )}

                <Dropdown>
                  <Dropdown.Trigger asChild>
                    <IconButton icon={<MenuIcon />} ariaLabel="Settings" />
                  </Dropdown.Trigger>
                  <Dropdown.Menu>
                    {mod.builtin && (
                      <>
                        <Dropdown.Menu.Item icon={<ViewIcon />} onClick={handleOnViewClick} label="View module" />
                      </>
                    )}
                    {!mod.builtin && (
                      <Dropdown.Menu.Group label="Actions">
                        <PermissionsGuard requiredPermissions={[[PERMISSIONS.ManageModules]]}>
                          <Dropdown.Menu.Item icon={<ViewIcon />} onClick={handleOnViewClick} label="View module" />
                          <Dropdown.Menu.Item icon={<EditIcon />} onClick={handleOnEditClick} label="Edit module" />
                          <Dropdown.Menu.Item icon={<CopyIcon />} onClick={handleOnCopyClick} label="Copy module" />
                          <Dropdown.Menu.Item icon={<TagIcon />} onClick={handleOnTagClick} label="Tag module" />
                          <Dropdown.Menu.Item
                            icon={<DeleteIcon fill={theme.colors.error} />}
                            onClick={handleOnDeleteClick}
                            label="Delete module"
                          />
                        </PermissionsGuard>
                      </Dropdown.Menu.Group>
                    )}
                    <Dropdown.Menu.Group>
                      <Dropdown.Menu.Item
                        icon={<LinkIcon />}
                        onClick={handleOnOpenClick}
                        label="Open in Module Builder"
                      />
                      <Dropdown.Menu.Item icon={<ExportIcon />} onClick={handleOnExportClick} label="Export to file" />
                    </Dropdown.Menu.Group>
                  </Dropdown.Menu>
                </Dropdown>
              </ActionIconsContainer>
            </SpacedRow>
            <p>{latestVersion.description}</p>
            <span style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {latestVersion.commands.length > 0 && <p>Commands: {latestVersion.commands.length}</p>}
              {latestVersion.hooks.length > 0 && <p>Hooks: {latestVersion.hooks.length}</p>}
              {latestVersion.cronJobs.length > 0 && <p>Cronjobs: {latestVersion.cronJobs.length}</p>}
              {latestVersion.permissions.length > 0 && <p>Permissions: {latestVersion.permissions.length}</p>}
            </span>
          </InnerBody>
        </Card.Body>
      </Card>
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <Dialog.Content>
          <Dialog.Heading size={4}>
            Delete Module: <span style={{ textTransform: 'capitalize' }}>{mod.name}</span>{' '}
          </Dialog.Heading>
          <Dialog.Body size="medium">
            <p>
              Are you sure you want to delete the module <strong>{mod.name}</strong>? To confirm, type the module name
              below.
            </p>
            <ValueConfirmationField
              id="deleteModuleConfirmation"
              onValidChange={(valid) => setIsValid(valid)}
              value={mod.name}
              label="Module name"
            />
            <Button
              isLoading={isDeleting}
              onClick={(e) => handleOnDelete(e)}
              fullWidth
              disabled={!isValid}
              text="Delete module"
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
      <TagModuleDialog
        moduleId={mod.id}
        moduleName={mod.name}
        openDialog={openTagDialog}
        setOpenDialog={setOpenTagDialog}
      />

      <ExportModuleDialog
        moduleId={mod.id}
        moduleName={mod.name}
        moduleVersions={mod.versions}
        openDialog={openExportDialog}
        setOpenDialog={setOpenExportDialog}
      />
    </>
  );
};
