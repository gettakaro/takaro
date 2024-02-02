import { ModuleOutputDTO } from '@takaro/apiclient';
import { Company, Tooltip, Dialog, Button, IconButton, Card, Dropdown } from '@takaro/lib-components';
import { PERMISSIONS } from '@takaro/apiclient';
import { PATHS } from 'paths';
import { useModuleRemove } from 'queries/modules';
import { FC, useState, MouseEvent } from 'react';
import { AiOutlineMenu as MenuIcon } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { SpacedRow, ActionIconsContainer } from '../style';
import { CardBody } from '../style';
import { PermissionsGuard } from 'components/PermissionsGuard';
import {
  AiOutlineEdit as EditIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineLink as LinkIcon,
  AiOutlineEye as ViewIcon,
} from 'react-icons/ai';

interface IModuleCardProps {
  mod: ModuleOutputDTO;
}

export const ModuleDefinitionCard: FC<IModuleCardProps> = ({ mod }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { mutateAsync, isPending: isDeleting } = useModuleRemove();
  const navigate = useNavigate();

  const handleOnDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    await mutateAsync({ id: mod.id });
    setOpenDialog(false);
  };

  const handleOnEditClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate(PATHS.modules.update(mod.id));
  };

  const handleOnViewClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate(PATHS.modules.view(mod.id));
  };

  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenDialog(true);
  };

  const handleOnOpenClick = () => {
    window.open(PATHS.studio.module(mod.id));
  };

  return (
    <>
      <Card role="link">
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
                  <PermissionsGuard requiredPermissions={[[PERMISSIONS.ManageModules]]}>
                    {!mod.builtin && (
                      <Dropdown.Menu.Item icon={<ViewIcon />} onClick={handleOnViewClick} label="View module" />
                    )}
                    {!mod.builtin && (
                      <Dropdown.Menu.Item icon={<EditIcon />} onClick={handleOnEditClick} label="Edit module" />
                    )}
                    {!mod.builtin && (
                      <Dropdown.Menu.Item icon={<DeleteIcon />} onClick={handleOnDeleteClick} label="Delete module" />
                    )}
                  </PermissionsGuard>
                  <Dropdown.Menu.Item icon={<LinkIcon />} onClick={handleOnOpenClick} label="Open in studio" />
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
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading size={4}>
            Module: <span style={{ textTransform: 'capitalize' }}>{mod.name}</span>{' '}
          </Dialog.Heading>
          <Dialog.Body>
            <h2>Delete module</h2>
            <p>
              Are you sure you want to delete the module <strong>{mod.name}</strong>? This action is irreversible!{' '}
            </p>
            <Button
              isLoading={isDeleting}
              onClick={(e) => handleOnDelete(e)}
              fullWidth
              text={'Delete module'}
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
