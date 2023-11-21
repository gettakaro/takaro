import { FC, MouseEvent, useState } from 'react';
import { Button, Chip, Dialog, Dropdown, IconButton, Tooltip } from '@takaro/lib-components';
import { Body, Header, Container, EmptyContainer, TitleContainer, StyledDialogBody } from './style';
import { useNavigate } from 'react-router-dom';

import { AiOutlinePlus as PlusIcon, AiOutlineMenu as MenuIcon } from 'react-icons/ai';
import { PATHS } from 'paths';
import { useRoleRemove } from 'queries/roles/queries';
import { RoleOutputDTO } from '@takaro/apiclient';

export const RoleCard: FC<RoleOutputDTO> = ({ id, name, system }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  const { mutate, isLoading: isDeleting } = useRoleRemove();

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    navigate(PATHS.roles.update(id));
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenDialog(true);
  };

  const handleOnDelete = (e: MouseEvent) => {
    e.stopPropagation();
    mutate({ id });
    setOpenDialog(false);
  };

  return (
    <>
      {/* TODO: we might want to add a click event here that when card is clicked user is navigated to list of player or users that have this role active */}
      <Container>
        <Body>
          <Header>
            <Dropdown>
              <Dropdown.Trigger asChild>
                <IconButton icon={<MenuIcon />} ariaLabel="Settings" />
              </Dropdown.Trigger>
              <Dropdown.Menu>
                {name !== 'root' ? <Dropdown.Menu.Item onClick={handleOnEditClick} label="Edit role" /> : null}
                {!system ? <Dropdown.Menu.Item onClick={handleOnDeleteClick} label="Delete role" /> : null}
                <Dropdown.Menu.Item onClick={() => {}} label="Manage users" />
                <Dropdown.Menu.Item onClick={() => {}} label="Manage players" />
              </Dropdown.Menu>
            </Dropdown>
            {system ? (
              <Tooltip placement="top">
                <Tooltip.Trigger asChild>
                  <Chip label="system" color="primary" />
                </Tooltip.Trigger>
                <Tooltip.Content>System roles are managed by Takaro and cannot be deleted</Tooltip.Content>
              </Tooltip>
            ) : null}
          </Header>
          <TitleContainer>
            <h3>Role: {name}</h3>
          </TitleContainer>
        </Body>
      </Container>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading>
            role: <span style={{ textTransform: 'capitalize' }}>{name}</span>{' '}
          </Dialog.Heading>
          <StyledDialogBody size="medium">
            <h2>Delete role</h2>
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
          </StyledDialogBody>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

interface EmptyRolesCardProps {
  onClick: () => void;
}

export const EmptyRolesCard: FC<EmptyRolesCardProps> = ({ onClick }) => {
  return (
    <EmptyContainer onClick={onClick}>
      <PlusIcon size={24} />
      <h3>role</h3>
    </EmptyContainer>
  );
};
