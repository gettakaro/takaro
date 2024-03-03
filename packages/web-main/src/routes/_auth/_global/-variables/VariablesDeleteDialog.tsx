import { Button, Dialog, FormError } from '@takaro/lib-components';
import { useVariableDelete } from 'queries/variables';
import { FC } from 'react';

interface VariablesDeleteProps {
  variableIds: string[];
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

export const VariablesDeleteDialog: FC<VariablesDeleteProps> = ({ variableIds, openDialog, setOpenDialog }) => {
  const { mutateAsync, isPending: isDeleting, error } = useVariableDelete();

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    const deletePromises = variableIds.map((id) => mutateAsync({ variableId: id }));
    await Promise.all(deletePromises);
    setOpenDialog(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
