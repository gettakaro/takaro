import { Dialog, Button, FormError } from '@takaro/lib-components';
import { useRoleRemove } from 'queries/role';
import { FC } from 'react';

interface RolesDeleteProps {
  roleIds: string[];
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

export const RolesDeleteDialog: FC<RolesDeleteProps> = ({ roleIds, openDialog, setOpenDialog }) => {
  const { mutate, isPending: isDeleting, error } = useRoleRemove();

  const handleOnDelete = async (e) => {
    e.preventDefault();
    const deletePromises = roleIds.map((id) => mutate({ roleId: id }));
    await Promise.all(deletePromises);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>Delete: Roles</span>
        </Dialog.Heading>
        <Dialog.Body>
          <p>
            Are you sure you want to delete <strong>{roleIds.length} roles</strong>?{' '}
          </p>
          <Button
            isLoading={isDeleting}
            onClick={(e) => handleOnDelete(e)}
            fullWidth
            text={'Delete roles'}
            color="error"
          />
        </Dialog.Body>
        {error && <FormError error={error} />}
      </Dialog.Content>
    </Dialog>
  );
};
