import { FC, MouseEvent, useState } from 'react';
import { Button, Card, Chip, Dialog, Dropdown, IconButton, Tooltip, useTheme } from '@takaro/lib-components';
import { Header, TitleContainer } from './style';
import { useNavigate } from 'react-router-dom';

import { AiOutlineMenu as MenuIcon } from 'react-icons/ai';
import { PATHS } from 'paths';
import { useRoleRemove } from 'queries/roles/queries';
import { RoleOutputDTO } from '@takaro/apiclient';
import { CardBody } from '../style';

import { AiOutlineEdit as EditIcon, AiOutlineDelete as DeleteIcon, AiOutlineEye as ViewIcon } from 'react-icons/ai';

export const RoleCard: FC<RoleOutputDTO> = ({ id, name, system }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const { mutate, isPending: isDeleting } = useRoleRemove();

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    navigate(PATHS.roles.update(id));
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenDialog(true);
  };

  const handleOnViewClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate(PATHS.roles.view(id));
  };

  const handleOnDelete = (e: MouseEvent) => {
    e.stopPropagation();
    mutate({ id });
    setOpenDialog(false);
  };

  return (
    <>
      <Card>
        <CardBody>
          <Header>
            {system ? (
              <Tooltip placement="top">
                <Tooltip.Trigger asChild>
                  <Chip label="system" color="backgroundAccent" variant="outline" />
                </Tooltip.Trigger>
                <Tooltip.Content>System roles are managed by Takaro and cannot be deleted.</Tooltip.Content>
              </Tooltip>
            ) : (
              <span />
            )}

            <Dropdown>
              <Dropdown.Trigger asChild>
                <IconButton icon={<MenuIcon />} ariaLabel="Settings" />
              </Dropdown.Trigger>
              <Dropdown.Menu>
                <Dropdown.Menu.Group label="Actions">
                  <Dropdown.Menu.Item onClick={handleOnViewClick} icon={<ViewIcon />} label="View role" />
                  {name !== 'root' && (
                    <Dropdown.Menu.Item onClick={handleOnEditClick} icon={<EditIcon />} label="Edit role" />
                  )}
                  {!system && (
                    <Dropdown.Menu.Item
                      onClick={handleOnDeleteClick}
                      icon={<DeleteIcon fill={theme.colors.error} />}
                      label="Delete role"
                    />
                  )}
                </Dropdown.Menu.Group>

                <Dropdown.Menu.Item onClick={() => {}} label="Manage users (coming soon)" disabled />
                <Dropdown.Menu.Item onClick={() => {}} label="Manage players (coming soon)" disabled />
              </Dropdown.Menu>
            </Dropdown>
          </Header>
          <TitleContainer>
            <h3>Role: {name}</h3>
          </TitleContainer>
        </CardBody>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading>Delete role</Dialog.Heading>
          <Dialog.Body size="medium">
            <p>
              Are you sure you want to delete <strong>{name}</strong>?
            </p>
            <Button
              isLoading={isDeleting}
              onClick={(e) => handleOnDelete(e)}
              fullWidth
              text={'Delete role'}
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
