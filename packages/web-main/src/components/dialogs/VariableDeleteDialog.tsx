import { Button, Dialog, FormError } from '@takaro/lib-components';
import { useVariableDelete } from '../../queries/variable';
import { FC } from 'react';
import { RequiredDialogOptions } from '.';

interface VariableDeleteProps extends RequiredDialogOptions {
  variableId: string;
  variableKey: string;
  moduleName?: string;
  gameServerName?: string;
  playerName?: string;
}

export const VariableDeleteDialog: FC<VariableDeleteProps> = ({
  variableId,
  variableKey,
  moduleName,
  gameServerName,
  playerName,
  ...dialogOptions
}) => {
  const { mutate, isPending, isSuccess, error } = useVariableDelete();

  if (isSuccess) {
    dialogOptions.onOpenChange(false);
  }

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    mutate({ variableId });
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>Delete: variable</span>
        </Dialog.Heading>
        <Dialog.Body>
          <p>Are you sure you want to delete the following variable? This action cannot be undone.</p>
          <ul style={{ width: '100%', marginBottom: '1.2rem' }}>
            {variableKey && (
              <li>
                <strong>Key:</strong> {variableKey}
              </li>
            )}
            {moduleName && (
              <li>
                <strong>Module:</strong> {moduleName}
              </li>
            )}
            {gameServerName && (
              <li>
                <strong>Game Server:</strong> {gameServerName}
              </li>
            )}
            {playerName && (
              <li>
                <strong>Player Name:</strong> {playerName}
              </li>
            )}
          </ul>
          <Button isLoading={isPending} onClick={(e) => handleOnDelete(e)} fullWidth color="error">
            Delete variable
          </Button>
          {error && <FormError error={error} />}
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
