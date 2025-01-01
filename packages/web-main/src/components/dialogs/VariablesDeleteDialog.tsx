import { Button, Dialog, FormError } from '@takaro/lib-components';
import { useVariableDelete } from 'queries/variable';
import { FC } from 'react';
import { RequiredDialogOptions } from '.';

interface VariablesDeleteProps extends RequiredDialogOptions {
  variableIds: string[];
}

export const VariablesDeleteDialog: FC<VariablesDeleteProps> = ({ variableIds, ...dialogOptions }) => {
  const { mutateAsync, isPending: isDeleting, error } = useVariableDelete();

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    const deletePromises = variableIds.map((id) => mutateAsync({ variableId: id }));
    await Promise.all(deletePromises);
    dialogOptions.onOpenChange(false);
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>Delete: variables</span>
        </Dialog.Heading>
        <Dialog.Body>
          <p>
            Are you sure you want to delete <strong>{variableIds.length} variables</strong>?{' '}
          </p>
          <Button
            isLoading={isDeleting}
            onClick={(e) => handleOnDelete(e)}
            fullWidth
            text={'Delete variables'}
            color="error"
          />
        </Dialog.Body>
        {error && <FormError error={error} />}
      </Dialog.Content>
    </Dialog>
  );
};
