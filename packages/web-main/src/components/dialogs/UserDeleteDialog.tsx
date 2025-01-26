import { Button, Dialog, FormError } from '@takaro/lib-components';
import { useUserRemove } from 'queries/user';
import { FC } from 'react';
import { RequiredDialogOptions } from '.';

interface VariableDeleteProps extends RequiredDialogOptions {
  userId: string;
  userName: string;
}

export const UserDeleteDialog: FC<VariableDeleteProps> = ({ userId, userName, ...dialogOptions }) => {
  const { mutateAsync, isPending: isDeleting, error } = useUserRemove();

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    await mutateAsync({ userId });
    dialogOptions.onOpenChange(false);
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>Delete: user</span>
        </Dialog.Heading>
        <Dialog.Body>
          <p>
            Are you sure you want to delete <strong>{userName}</strong>? This action cannot be undone!
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
