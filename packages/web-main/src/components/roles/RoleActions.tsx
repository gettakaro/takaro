import { Dropdown, IconButton, useTheme } from '@takaro/lib-components';
import { useNavigate } from '@tanstack/react-router';
import { FC, useRef, useState, MouseEvent } from 'react';
import {
  AiOutlineMenu as MenuIcon,
  AiOutlineEdit as EditRoleIcon,
  AiOutlineDelete as DeleteRoleIcon,
  AiOutlineEye as ViewRoleIcon,
} from 'react-icons/ai';

import { DeleteImperativeHandle } from '../dialogs';
import { RoleDeleteDialog } from '../dialogs/RoleDeleteDialog';

interface RoleActionsProps {
  roleId: string;
  roleName: string;
  isSystem: boolean;
}

export const RoleActions: FC<RoleActionsProps> = ({ roleId, roleName, isSystem }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const roleDialogDeleteRef = useRef<DeleteImperativeHandle>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    navigate({ to: '/roles/update/$roleId', params: { roleId } });
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();

    if (e.shiftKey) {
      roleDialogDeleteRef.current?.triggerDelete();
    } else {
      setOpenDeleteDialog(true);
    }
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
      <RoleDeleteDialog
        ref={roleDialogDeleteRef}
        roleId={roleId}
        roleName={roleName}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
      />
    </>
  );
};
