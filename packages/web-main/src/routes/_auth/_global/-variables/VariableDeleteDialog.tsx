import { VariableOutputDTO } from '@takaro/apiclient';
import { Button, Dialog } from '@takaro/lib-components';
import { useVariableDelete } from 'queries/variable';
import { FC } from 'react';
import { useNavigate } from '@tanstack/react-router';

interface VariableDeleteProps {
  variable: VariableOutputDTO | null;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

export const VariableDeleteDialog: FC<VariableDeleteProps> = ({ variable, openDialog, setOpenDialog }) => {
  const { mutateAsync, isPending: isDeleting, isSuccess } = useVariableDelete();
  const navigate = useNavigate();

  if (isSuccess) {
    navigate({ to: '/variables' });
  }

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (variable) {
      await mutateAsync({ variableId: variable.id });
      setOpenDialog(false);
    }
  };

  if (!variable) return null;

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>Delete: variable</span>
        </Dialog.Heading>
        <Dialog.Body>
          <p>Are you sure you want to delete the following variable? This action cannot be undone.</p>
          <ul style={{ width: '100%', marginBottom: '1.2rem' }}>
            {variable.key && (
              <li>
                <strong>Key:</strong> {variable.key}
              </li>
            )}
            {variable.module && (
              <li>
                <strong>Module:</strong> {variable.module.name}
              </li>
            )}
            {variable.gameServer && (
              <li>
                <strong>Game Server:</strong> {variable.gameServer.name}
              </li>
            )}
            {variable.player && (
              <li>
                <strong>Player Name:</strong> {variable.player.name}
              </li>
            )}
          </ul>
          <Button
            isLoading={isDeleting}
            onClick={(e) => handleOnDelete(e)}
            fullWidth
            text={'Delete variable'}
            color="error"
          />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
