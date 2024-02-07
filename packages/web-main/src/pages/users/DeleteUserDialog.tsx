import { UserOutputWithRolesDTO } from '@takaro/apiclient';
import { Button, Dialog, FormError } from '@takaro/lib-components';
import { useUserRemove } from 'queries/users';
import { FC } from 'react';

interface VariableDeleteProps {
  user: UserOutputWithRolesDTO;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

export const UserDeleteDialog: FC<VariableDeleteProps> = ({ user, openDialog, setOpenDialog }) => {
  const { mutateAsync, isPending: isDeleting, error } = useUserRemove();

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    await mutateAsync({ id: user.id });
    setOpenDialog(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>Delete: user</span>
        </Dialog.Heading>
        <Dialog.Body>
          <p>
            Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone!
            <br />
          </p>
          {error && <FormError error={error} />}
          <Button
            isLoading={isDeleting}
            onClick={(e) => handleOnDelete(e)}
            fullWidth
            text={'Delete user'}
            color="error"
          />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
