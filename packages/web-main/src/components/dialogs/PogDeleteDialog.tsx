import { Button, Dialog, FormError } from '@takaro/lib-components';
import { usePogRemove } from '../../queries/pog';
import { FC } from 'react';
import { RequiredDialogOptions } from '.';

interface PogDeleteDialogProps extends RequiredDialogOptions {
  playerId: string;
  gameServerId: string;
  playerName: string;
  gameServerName: string;
}

export const PogDeleteDialog: FC<PogDeleteDialogProps> = ({
  playerId,
  gameServerId,
  playerName,
  gameServerName,
  ...dialogOptions
}) => {
  const { mutateAsync, isPending: isDeleting, error } = usePogRemove();

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    await mutateAsync({ playerId, gameServerId });
    dialogOptions.onOpenChange(false);
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>Remove player from game server</span>
        </Dialog.Heading>
        <Dialog.Body>
          <p>
            Are you sure you want to remove <strong>{playerName}</strong> from <strong>{gameServerName}</strong>? This
            will delete all tracking data for this player on this server. The player record will remain intact.
          </p>
          {error && <FormError error={error} />}
          <Button isLoading={isDeleting} onClick={(e) => handleOnDelete(e)} fullWidth color="error">
            Remove from server
          </Button>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
