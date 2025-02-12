import { Company, Tooltip, IconButton, Card, Dropdown, useTheme, Chip } from '@takaro/lib-components';
import { PERMISSIONS, ModuleOutputDTO } from '@takaro/apiclient';
import { FC, useState, MouseEvent, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { SpacedRow, ActionIconsContainer, InnerBody } from '../style';
import { PermissionsGuard } from '../../../components/PermissionsGuard';
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
import { ModuleTagDialog } from '../../../components/dialogs/ModuleTagDialog';
import { ModuleCopyDialog } from '../../../components/dialogs/ModuleCopyDialog';
import { ModuleExportDialog } from '../../../components/dialogs/ModuleExportDialog';
import { ModuleDeleteDialog } from '../../../components/dialogs/ModuleDeleteDialog';
import { DeleteImperativeHandle } from '../../../components/dialogs';

import { DateTime } from 'luxon';

interface IModuleCardProps {
  mod: ModuleOutputDTO;
}

export const ModuleDefinitionCard: FC<IModuleCardProps> = ({ mod }) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openTagDialog, setOpenTagDialog] = useState<boolean>(false);
  const [openExportDialog, setOpenExportDialog] = useState<boolean>(false);
  const [openCopyDialog, setOpenCopyDialog] = useState<boolean>(false);
  const deleteDialogRef = useRef<DeleteImperativeHandle>(null);

  const { latestVersion } = mod;

  const theme = useTheme();
  const navigate = useNavigate();

  const handleOnEditBuilderClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/modules/$moduleId/update', params: { moduleId: mod.id }, search: { view: 'builder' } });
  };
  const handleOnEditManualClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/modules/$moduleId/update', params: { moduleId: mod.id }, search: { view: 'manual' } });
  };

  const handleOnViewClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/modules/$moduleId/view', params: { moduleId: mod.id } });
  };

  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      deleteDialogRef.current?.triggerDelete();
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
    setOpenCopyDialog(true);
  };
  const handleOnCopyIdClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(mod.id);
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
                    <Chip
                      variant="outline"
                      color={newestTag ? 'primary' : 'secondary'}
                      label={newestTag ?? 'no tags'}
                    />
                  </Tooltip.Trigger>
                  <Tooltip.Content>Latest tag</Tooltip.Content>
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
                      <Dropdown.Menu.Group label="Actions">
                        <Dropdown.Menu.Item icon={<ViewIcon />} onClick={handleOnViewClick} label="View module" />
                        <Dropdown.Menu.Item icon={<CopyIcon />} onClick={handleOnCopyClick} label="Copy module" />
                        <Dropdown.Menu.Item icon={<CopyIcon />} onClick={handleOnCopyIdClick} label="Copy module id" />
                      </Dropdown.Menu.Group>
                    )}
                    {!mod.builtin && (
                      <Dropdown.Menu.Group label="Actions">
                        <PermissionsGuard requiredPermissions={[[PERMISSIONS.ManageModules]]}>
                          <Dropdown.Menu.Item icon={<ViewIcon />} onClick={handleOnViewClick} label="View module" />
                          <Dropdown.Menu.Item
                            icon={<EditIcon />}
                            onClick={handleOnEditBuilderClick}
                            label="Edit module (builder)"
                          />
                          <Dropdown.Menu.Item
                            icon={<EditIcon />}
                            onClick={handleOnEditManualClick}
                            label="Edit module (manual)"
                          />
                          <Dropdown.Menu.Item icon={<CopyIcon />} onClick={handleOnCopyClick} label="Copy module" />
                          <Dropdown.Menu.Item icon={<TagIcon />} onClick={handleOnTagClick} label="Tag module" />
                          <Dropdown.Menu.Item
                            icon={<CopyIcon />}
                            onClick={handleOnCopyIdClick}
                            label="Copy module id"
                          />
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
                      <Dropdown.Menu.Item
                        icon={<ExportIcon />}
                        onClick={handleOnExportClick}
                        label="Export module to file"
                      />
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
      <ModuleTagDialog moduleId={mod.id} moduleName={mod.name} open={openTagDialog} onOpenChange={setOpenTagDialog} />
      <ModuleDeleteDialog
        ref={deleteDialogRef}
        moduleId={mod.id}
        moduleName={mod.name}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
      />
      <ModuleCopyDialog mod={mod} open={openCopyDialog} onOpenChange={setOpenCopyDialog} />
      <ModuleExportDialog
        moduleId={mod.id}
        moduleName={mod.name}
        moduleVersions={mod.versions}
        open={openExportDialog}
        onOpenChange={setOpenExportDialog}
      />
    </>
  );
};
