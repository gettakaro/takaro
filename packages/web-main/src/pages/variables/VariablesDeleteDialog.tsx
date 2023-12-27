import { Button, Dialog } from '@takaro/lib-components';
import { useVariableDelete } from 'queries/variables';
import { FC } from 'react';

interface VariablesDeleteProps {
  variableIds: string[];
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

export const VariablesDeleteDialog: FC<VariablesDeleteProps> = ({ variableIds, openDialog, setOpenDialog }) => {
  const { mutateAsync, isLoading: isDeleting } = useVariableDelete();

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    const deletePromises = variableIds.map((id) => mutateAsync(id));
    await Promise.all(deletePromises);
    setOpenDialog(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>Delete variables</span>
        </Dialog.Heading>
        <Dialog.Body>
          <h2>Delete variables</h2>
          <p>Are you sure you want to delete {variableIds.length} variables? This action cannot be undone.</p>
          <Button
            isLoading={isDeleting}
            onClick={(e) => handleOnDelete(e)}
            fullWidth
            text={'Delete variables'}
            color="error"
          />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
