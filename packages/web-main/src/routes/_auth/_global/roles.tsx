import { Outlet, redirect, createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  EmptyPage,
  Empty,
  Button,
  useLocalStorage,
  useTheme,
  Dropdown,
  Dialog,
  IconButton,
  ValueConfirmationField,
} from '@takaro/lib-components';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { hasPermission } from 'hooks/useHasPermission';
import { userMeQueryOptions } from 'queries/user';
import { TableListToggleButton, ViewType } from 'components/TableListToggleButton';
import { RolesCardView } from './-roles/RolesCardView';
import { RolesTableView } from './-roles/RolesTableView';
import { FC, MouseEvent, useEffect, useState } from 'react';

import {
  AiOutlinePlus as AddRoleIcon,
  AiOutlineMenu as MenuIcon,
  AiOutlineEdit as EditRoleIcon,
  AiOutlineDelete as DeleteRoleIcon,
  AiOutlineEye as ViewRoleIcon,
} from 'react-icons/ai';
import { useRoleRemove } from 'queries/role';

export const Route = createFileRoute('/_auth/_global/roles')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_ROLES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
  notFoundComponent: () => {
    return (
      <EmptyPage>
        <Empty
          header="No roles"
          description="Create a role and assign it to user or players."
          actions={[
            <Button key="create-role-button" text="Create a role" onClick={() => redirect({ to: '/roles/create' })} />,
          ]}
        />
        <Outlet />
      </EmptyPage>
    );
  },
});

function Component() {
  useDocumentTitle('Roles');
  const { setValue: setView, storedValue: view } = useLocalStorage<ViewType>('roles-view-selector', 'list');
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginBottom: '20px',
          gap: theme.spacing[1],
        }}
      >
        <Button icon={<AddRoleIcon />} onClick={() => navigate({ to: '/roles/create' })} text="Create new role" />
        <TableListToggleButton onChange={setView} value={view} />
      </div>
      {view === 'table' && <RolesTableView />}
      {view === 'list' && <RolesCardView />}
      <Outlet />
    </div>
  );
}

interface RoleActionsProps {
  roleId: string;
  roleName: string;
  isSystem: boolean;
}
export const RoleActions: FC<RoleActionsProps> = ({ roleId, roleName, isSystem }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mutate, isPending: isDeleting, isSuccess } = useRoleRemove();
  const [valid, setValid] = useState<boolean>(false);

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  useEffect(() => {
    if (isSuccess) {
      setOpenDialog(false);
    }
  }, []);

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    navigate({ to: '/roles/update/$roleId', params: { roleId } });
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();

    if (e.shiftKey) {
      handleOnDelete(e);
    } else {
      setOpenDialog(true);
    }
  };

  const handleOnDelete = (e: MouseEvent) => {
    e.stopPropagation();
    mutate({ roleId });
  };

  const handleOnViewClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/roles/view/$roleId', params: { roleId } });
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger asChild>
          <IconButton icon={<MenuIcon />} ariaLabel="Settings" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Group label="Actions">
            <Dropdown.Menu.Item onClick={handleOnViewClick} icon={<ViewRoleIcon />} label="View role" />
            {roleName !== 'root' && (
              <Dropdown.Menu.Item onClick={handleOnEditClick} icon={<EditRoleIcon />} label="Edit role" />
            )}
            {!isSystem && (
              <Dropdown.Menu.Item
                onClick={handleOnDeleteClick}
                icon={<DeleteRoleIcon fill={theme.colors.error} />}
                label="Delete role"
              />
            )}
          </Dropdown.Menu.Group>

          <Dropdown.Menu.Item onClick={() => {}} label="Manage users (coming soon)" disabled />
          <Dropdown.Menu.Item onClick={() => {}} label="Manage players (coming soon)" disabled />
        </Dropdown.Menu>
      </Dropdown>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading>Delete role</Dialog.Heading>
          <Dialog.Body size="medium">
            <p>
              Are you sure you want to delete the role? To confirm, type <strong>{roleName}</strong>.
            </p>
            <ValueConfirmationField
              value={roleName}
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
