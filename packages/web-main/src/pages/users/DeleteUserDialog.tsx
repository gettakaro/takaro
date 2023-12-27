import { UserOutputWithRolesDTO } from '@takaro/apiclient';
import { Button, Dialog, errors, FormError } from '@takaro/lib-components';
import { useUserRemove } from 'queries/users';
import { FC, useMemo } from 'react';

interface VariableDeleteProps {
  user: UserOutputWithRolesDTO;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

export const UserDeleteDialog: FC<VariableDeleteProps> = ({ user, openDialog, setOpenDialog }) => {
  const { mutateAsync, isLoading: isDeleting, error } = useUserRemove();

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    await mutateAsync({ id: user.id });
    setOpenDialog(false);
  };

  const errorMessage = useMemo(() => {
    if (!error) return null;

    const err = errors.defineErrorType(error);

    if (err instanceof errors.InternalServerError) {
      return 'Something went wrong. Please try again later.';
    }
    if (err instanceof errors.NotAuthorizedError) {
      return 'You are not authorized to perform this action.';
    }
  }, [error]);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>Delete User</span>
        </Dialog.Heading>
        <Dialog.Body>
          <h2>Delete variable</h2>
          <p>
            Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone!
          </p>
          <FormError error={errorMessage} />
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
