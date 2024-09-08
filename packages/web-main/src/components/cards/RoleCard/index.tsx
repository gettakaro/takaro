import { FC, MouseEvent, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Chip,
  Dialog,
  Dropdown,
  IconButton,
  Tooltip,
  ValueConfirmationField,
  useTheme,
} from '@takaro/lib-components';
import { Header, TitleContainer } from './style';
import { useNavigate } from '@tanstack/react-router';
import { useRoleRemove } from 'queries/role';
import { RoleOutputDTO } from '@takaro/apiclient';
import { CardBody } from '../style';

import {
  AiOutlineMenu as MenuIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineEye as ViewIcon,
  AiOutlineUserSwitch as ManagePlayersIcon,
} from 'react-icons/ai';
import { useHasPermission } from 'hooks/useHasPermission';

export const RoleCard: FC<RoleOutputDTO> = ({ id, name, system }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [valid, setValid] = useState<boolean>(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const { mutate, isPending: isDeleting, isSuccess } = useRoleRemove();
  const hasRequiredManagePlayersPermission = useHasPermission(['READ_ROLES', 'READ_PLAYERS', 'READ_USERS']);

  const isUserRole = name === 'User';
  const isPlayerRole = name === 'Player';

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    navigate({ to: '/roles/$roleId/update', params: { roleId: id } });
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();

    if (e.shiftKey) {
      handleOnDelete(e);
    } else {
      setOpenDialog(true);
    }
  };

  const handleOnViewClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/roles/$roleId/view', params: { roleId: id } });
  };

  const handleOnManagePlayersClicked = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/roles/$roleId/players', params: { roleId: id } });
  };

  const handleOnManageUsersClicked = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/roles/$roleId/users', params: { roleId: id } });
  };

  const handleOnDelete = (e: MouseEvent) => {
    e.stopPropagation();
    mutate({ roleId: id });
  };

  useEffect(() => {
    if (isSuccess) {
      setOpenDialog(false);
    }
  }, []);

  return (
    <>
      <Card data-testid={`role-${name}`}>
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
                  <Dropdown.Menu.Item
                    icon={<ManagePlayersIcon />}
                    onClick={handleOnManagePlayersClicked}
                    label="Manage players"
                    disabled={!hasRequiredManagePlayersPermission || isPlayerRole || isUserRole}
                  />
                  <Dropdown.Menu.Item
                    icon={<ManagePlayersIcon />}
                    onClick={handleOnManageUsersClicked}
                    label="Manage Users"
                    disabled={!hasRequiredManagePlayersPermission || isPlayerRole || isUserRole}
                  />
                  {!system && (
                    <Dropdown.Menu.Item
                      onClick={handleOnDeleteClick}
                      icon={<DeleteIcon fill={theme.colors.error} />}
                      label="Delete role"
                    />
                  )}
                </Dropdown.Menu.Group>
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
              Are you sure you want to delete the role? To confirm, type <strong>{name}</strong>.
            </p>
            <ValueConfirmationField
              value={name}
              onValidChange={(v) => setValid(v)}
              label="Role name"
              id="deleteRoleConfirmation"
            />
            <Button
              isLoading={isDeleting}
              onClick={handleOnDelete}
              disabled={!valid}
              fullWidth
              text="Delete role"
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
