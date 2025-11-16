import { ModuleOutputDTO, PERMISSIONS } from '@takaro/apiclient';
import { Dropdown, IconButton, useTheme } from '@takaro/lib-components';
import { useNavigate } from '@tanstack/react-router';
import { ModuleCopyDialog } from '../../../../components/dialogs/ModuleCopyDialog';
import { ModuleDeleteDialog } from '../../../../components/dialogs/ModuleDeleteDialog';
import { ModuleExportDialog } from '../../../../components/dialogs/ModuleExportDialog';
import { ModuleTagDialog } from '../../../../components/dialogs/ModuleTagDialog';
import { FC, useState, MouseEvent, useRef } from 'react';
import {
  AiOutlineCopy as CopyIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineDownload as ExportIcon,
  AiOutlineEye as ViewIcon,
  AiOutlineTag as TagIcon,
  AiOutlineMenu as ActionsIcon,
  AiOutlineLink as LinkIcon,
  AiOutlineBook as DocumentationIcon,
} from 'react-icons/ai';
import { DeleteImperativeHandle } from '../../../../components/dialogs';
import { PermissionsGuard } from '../../../../components/PermissionsGuard';

interface ModuleActionsProps {
  mod: ModuleOutputDTO;
  /// A user can only create x amount of modules within a plan
  canCreateModule: boolean;
}

export const ModuleActions: FC<ModuleActionsProps> = ({ mod, canCreateModule }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [openCopyDialog, setOpenCopyDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openExportDialog, setOpenExportDialog] = useState<boolean>(false);
  const [openTagDialog, setOpenTagDialog] = useState<boolean>(false);
  const deleteDialogRef = useRef<DeleteImperativeHandle>(null);

  const handleOnEditBuilderClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/modules/$moduleId/update', params: { moduleId: mod.id }, search: { view: 'builder' } });
  };
  const handleOnEditManualClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/modules/$moduleId/update', params: { moduleId: mod.id }, search: { view: 'manual' } });
  };

  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      deleteDialogRef.current?.triggerDelete();
    } else {
      setOpenDeleteDialog(true);
    }
  };

  const handleOnCopyIdClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(mod.id);
  };

  const handleOnCopyClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenCopyDialog(true);
  };

  const handleOnOpenInModuleBuilderClick = (e: MouseEvent) => {
    e.stopPropagation();
    window.open(`/module-builder/${mod.id}`, '_blank');
  };
  const handleOnOpenInDocumentationClick = (e: MouseEvent) => {
    e.stopPropagation();
    window.open('https://docs.takaro.io/advanced/modules', '_blank');
  };

  const handleOnTagClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenTagDialog(true);
  };
  const handleOnViewClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/modules/$moduleId/view', params: { moduleId: mod.id } });
  };

  return (
    <>
      <>
        {/* Dialogs */}
        <ModuleCopyDialog mod={mod} open={openCopyDialog} onOpenChange={setOpenCopyDialog} />
        <ModuleDeleteDialog
          moduleId={mod.id}
          moduleName={mod.name}
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          ref={deleteDialogRef}
        />
        <ModuleExportDialog
          moduleId={mod.id}
          moduleName={mod.name}
          open={openExportDialog}
          onOpenChange={setOpenExportDialog}
        />
        <ModuleTagDialog moduleId={mod.id} moduleName={mod.name} open={openTagDialog} onOpenChange={setOpenTagDialog} />
      </>

      <Dropdown placement="left-start">
        <Dropdown.Trigger asChild>
          <IconButton icon={<ActionsIcon />} ariaLabel="Module actions" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          {mod.builtin && (
            <Dropdown.Menu.Group label="Actions">
              <Dropdown.Menu.Item icon={<ViewIcon />} onClick={handleOnViewClick} label="View module" />
              <Dropdown.Menu.Item
                icon={<CopyIcon />}
                onClick={handleOnCopyClick}
                label="Copy module"
                disabled={!canCreateModule}
              />
              <Dropdown.Menu.Item icon={<CopyIcon />} onClick={handleOnCopyIdClick} label="Copy module id" />
            </Dropdown.Menu.Group>
          )}

          {!mod.builtin && (
            <>
              <Dropdown.Menu.Group label="Actions">
                <PermissionsGuard requiredPermissions={[[PERMISSIONS.ManageModules]]}>
                  <Dropdown.Menu.Item label="View module" icon={<ViewIcon />} onClick={handleOnViewClick} />
                  <Dropdown.Menu.Item
                    label="Edit module (builder)"
                    icon={<EditIcon />}
                    onClick={handleOnEditBuilderClick}
                  />
                  <Dropdown.Menu.Item
                    label="Edit module (manual)"
                    icon={<EditIcon />}
                    onClick={handleOnEditManualClick}
                  />
                  <Dropdown.Menu.Item
                    label="Copy module"
                    icon={<CopyIcon />}
                    onClick={handleOnCopyClick}
                    disabled={!canCreateModule}
                  />
                  <Dropdown.Menu.Item label="Create module tag" icon={<TagIcon />} onClick={handleOnTagClick} />
                  <Dropdown.Menu.Item icon={<CopyIcon />} onClick={handleOnCopyIdClick} label="Copy module id" />

                  <Dropdown.Menu.Item
                    label="Delete module"
                    icon={<DeleteIcon fill={theme.colors.error} />}
                    onClick={handleOnDeleteClick}
                  />
                </PermissionsGuard>
              </Dropdown.Menu.Group>
              <Dropdown.Menu.Group>
                <Dropdown.Menu.Item
                  label="Module documentation"
                  icon={<DocumentationIcon />}
                  onClick={handleOnOpenInDocumentationClick}
                />
                <Dropdown.Menu.Item
                  label="Open in Module Builder"
                  icon={<LinkIcon />}
                  onClick={handleOnOpenInModuleBuilderClick}
                />
                <Dropdown.Menu.Item
                  label="Export module"
                  icon={<ExportIcon />}
                  onClick={() => {
                    setOpenExportDialog(true);
                  }}
                />
              </Dropdown.Menu.Group>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};
