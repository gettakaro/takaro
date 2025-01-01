import { forwardRef, MouseEvent, useImperativeHandle, useState } from 'react';
import { DeleteImperativeHandle, RequiredDialogOptions } from '.';
import { Button, Dialog, FormError, ValueConfirmationField } from '@takaro/lib-components';
import { useGameServerRemove } from 'queries/gameserver';

interface GameServerDeleteDialogProps extends RequiredDialogOptions {
  gameServerName: string;
  gameServerId: string;
}

export const GameServerDeleteDialog = forwardRef<DeleteImperativeHandle, GameServerDeleteDialogProps>(
  ({ gameServerId, gameServerName, ...dialogOptions }, ref) => {
    const [valid, setValid] = useState<boolean>(false);
    const { mutate, isPending: isDeleting, isSuccess, error } = useGameServerRemove();

    useImperativeHandle(ref, () => ({
      triggerDelete: () => mutate({ gameServerId }),
    }));

    const handleOnDelete = (e: MouseEvent) => {
      e.stopPropagation();
      mutate({ gameServerId });
    };

    if (isSuccess) {
      dialogOptions.onOpenChange(false);
    }

    return (
      <Dialog {...dialogOptions}>
        <Dialog.Content>
          <Dialog.Heading>delete: gameserver</Dialog.Heading>
          <Dialog.Body size="medium">
            <p>
              Are you sure you want to delete the gameserver? To confirm, type <strong>{gameServerName}</strong> in the
              field below.
            </p>
            <ValueConfirmationField
              value={gameServerName}
              onValidChange={(v) => setValid(v)}
              label="Game server name"
              id="deleteGameServerConfirmation"
            />
            <Button
              isLoading={isDeleting}
              onClick={handleOnDelete}
              disabled={!valid}
              fullWidth
              text="Delete gameserver"
              color="error"
            />
            {error && <FormError error={error} />}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );
  },
);
