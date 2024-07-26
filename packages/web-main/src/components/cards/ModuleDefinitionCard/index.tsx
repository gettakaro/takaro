import { ModuleOutputDTO } from '@takaro/apiclient';
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
  styled,
  Spinner,
} from '@takaro/lib-components';
import { PERMISSIONS } from '@takaro/apiclient';
import { moduleExportOptions, useModuleRemove } from 'queries/module';
import { FC, useState, MouseEvent, useEffect } from 'react';
import { AiOutlineMenu as MenuIcon } from 'react-icons/ai';
import { useNavigate } from '@tanstack/react-router';
import { SpacedRow, ActionIconsContainer } from '../style';
import { CardBody } from '../style';
import { PermissionsGuard } from 'components/PermissionsGuard';
import {
  AiOutlineEdit as EditIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineLink as LinkIcon,
  AiOutlineEye as ViewIcon,
  AiOutlineCopy as CopyIcon,
  AiOutlineExport as ExportIcon,
} from 'react-icons/ai';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

const DownloadLink = styled.a`
  display: block;
  padding: ${({ theme }) => theme.spacing['0_75']};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

interface IModuleCardProps {
  mod: ModuleOutputDTO;
}

export const ModuleDefinitionCard: FC<IModuleCardProps> = ({ mod }) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openExportDialog, setOpenExportDialog] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const { mutate, isPending: isDeleting, isSuccess } = useModuleRemove();
  const { data: exported, isPending: isExporting } = useQuery(moduleExportOptions(mod.id, openExportDialog));
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();
  const navigate = useNavigate();

  const handleOnDelete = (e: MouseEvent) => {
    e.stopPropagation();
    mutate({ moduleId: mod.id });
  };

  if (isSuccess) {
    enqueueSnackbar('Module successfully deleted!', { variant: 'default' });
    setOpenDeleteDialog(false);
  }

  useEffect(() => {
    if (!isExporting && exported) {
      const blob = new Blob([JSON.stringify(exported)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      setDownloadLink(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [isExporting, exported]);

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
    e.shiftKey ? handleOnDelete(e) : setOpenDeleteDialog(true);
  };

  const handleOnCopyClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/modules/$moduleId/copy', params: { moduleId: mod.id } });
  };

  const handleOnOpenClick = (e: MouseEvent) => {
    e.stopPropagation();
    window.open(`/studio/${mod.id}`, '_blank');
  };

  const handleOnExportClick = async (e: MouseEvent) => {
    e.stopPropagation();
    setOpenExportDialog(true);
  };

  return (
    <>
      <Card data-testid={`${mod.name}`}>
        <CardBody>
          <SpacedRow>
            <h2>{mod.name}</h2>
            <ActionIconsContainer>
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
                  {!mod.builtin && (
                    <Dropdown.Menu.Group label="Actions">
                      <PermissionsGuard requiredPermissions={[[PERMISSIONS.ManageModules]]}>
                        <Dropdown.Menu.Item icon={<ViewIcon />} onClick={handleOnViewClick} label="View module" />
                        <Dropdown.Menu.Item icon={<EditIcon />} onClick={handleOnEditClick} label="Edit module" />
                        <Dropdown.Menu.Item
                          icon={<DeleteIcon fill={theme.colors.error} />}
                          onClick={handleOnDeleteClick}
                          label="Delete module"
                        />
                      </PermissionsGuard>
                    </Dropdown.Menu.Group>
                  )}
                  <Dropdown.Menu.Group>
                    <Dropdown.Menu.Item icon={<CopyIcon />} onClick={handleOnCopyClick} label="Copy module" />
                    <Dropdown.Menu.Item icon={<LinkIcon />} onClick={handleOnOpenClick} label="Open in Studio" />
                    <Dropdown.Menu.Item icon={<ExportIcon />} onClick={handleOnExportClick} label="Export to file" />
                  </Dropdown.Menu.Group>
                </Dropdown.Menu>
              </Dropdown>
            </ActionIconsContainer>
          </SpacedRow>
          <p>{mod.description}</p>
          <span style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {mod.commands.length > 0 && <p>Commands: {mod.commands.length}</p>}
            {mod.hooks.length > 0 && <p>Hooks: {mod.hooks.length}</p>}
            {mod.cronJobs.length > 0 && <p>Cronjobs: {mod.cronJobs.length}</p>}
            {mod.permissions.length > 0 && <p>Permissions: {mod.permissions.length}</p>}
          </span>
        </CardBody>
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
      <Dialog open={openExportDialog} onOpenChange={setOpenExportDialog}>
        <Dialog.Content>
          <Dialog.Heading size={4}>
            Module: <span style={{ textTransform: 'capitalize' }}>{mod.name}</span>
          </Dialog.Heading>
          <Dialog.Body>
            {isExporting && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p>preparing {mod.name}.json</p>
                <Spinner size="tiny" />
              </div>
            )}

            {!isExporting && downloadLink && (
              <DownloadLink
                href={downloadLink}
                download={`${mod.name}.json`}
                onClick={() => {
                  setOpenExportDialog(false);
                }}
              >
                Download {mod.name}.json
              </DownloadLink>
            )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
