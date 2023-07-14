import { FC, MouseEvent, useState } from 'react';
import { Button, Dialog, Dropdown, MenuList, IconButton, Tooltip } from '@takaro/lib-components';
import { Body, Header, Container, EmptyContainer, TitleContainer, StyledDialogBody } from './style';
import { useNavigate } from 'react-router-dom';

import { AiOutlineMenu as MenuIcon, AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { PATHS } from 'paths';
import { useRoleRemove } from 'queries/roles/queries';
import { RoleOutputDTO } from '@takaro/apiclient';

export const RoleCard: FC<RoleOutputDTO> = ({ id, name }) => {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  const { mutate, isLoading: isDeleting } = useRoleRemove();

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    navigate(PATHS.roles.update(id));
    setOpenDropdown(false);
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenDialog(true);
    setOpenDropdown(false);
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
            {/* TODO: add featuere to enable/disable roles*/}
            <>enabled</>
            <Dropdown
              open={openDropdown}
              setOpen={setOpenDropdown}
              renderReference={
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <IconButton icon={<MenuIcon />} ariaLabel="Actions" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>Actions</Tooltip.Content>
                </Tooltip>
              }
              renderFloating={
                <MenuList>
                  <MenuList.Item onClick={handleOnEditClick}>Edit role</MenuList.Item>
                  <MenuList.Item onClick={handleOnDeleteClick}>Delete role</MenuList.Item>
                </MenuList>
              }
            />
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
              text={`Delete role`}
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
