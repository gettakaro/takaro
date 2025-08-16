import { Button, Dialog, FormError } from '@takaro/lib-components';
import { usePlayerRemove } from '../../queries/player';
import { FC } from 'react';
import { RequiredDialogOptions } from '.';

interface PlayerDeleteDialogProps extends RequiredDialogOptions {
  playerId: string;
  playerName: string;
}

export const PlayerDeleteDialog: FC<PlayerDeleteDialogProps> = ({ playerId, playerName, ...dialogOptions }) => {
  const { mutateAsync, isPending: isDeleting, error } = usePlayerRemove();

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    await mutateAsync({ playerId });
    dialogOptions.onOpenChange(false);
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>Delete player</span>
        </Dialog.Heading>
        <Dialog.Body>
          <p>
            Are you sure you want to delete <strong>{playerName}</strong>? This will remove the player from all game
            servers and delete all associated data. This action cannot be undone!
          </p>
          {error && <FormError error={error} />}
          <Button isLoading={isDeleting} onClick={(e) => handleOnDelete(e)} fullWidth color="error">
            Delete player
          </Button>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
