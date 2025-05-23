import { Button, Dialog, Alert } from '@takaro/lib-components';
import { RequiredDialogOptions } from '.';
import { useGameServerResetToken } from '../../queries/gameserver';
import { MouseEvent } from 'react';

export const GameServerResetTokenDialog = ({ ...dialogOptions }: RequiredDialogOptions) => {
  const { mutate: resetToken, isPending: isResetting } = useGameServerResetToken();

  const handleOnResetToken = (e: MouseEvent) => {
    e.stopPropagation();
    resetToken();
    dialogOptions.onOpenChange(false);
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>reset registration token</Dialog.Heading>
        <Dialog.Body size="medium">
          <Alert
            variant="warning"
            text="Resetting the registration token will disconnect all currently connected servers. They will need to be reconfigured with the new token to reconnect."
          />
          <p>
            Are you sure you want to <strong>reset the registration token</strong>?
          </p>
          <Button isLoading={isResetting} onClick={handleOnResetToken} fullWidth color="error">
            Reset registration token
          </Button>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
