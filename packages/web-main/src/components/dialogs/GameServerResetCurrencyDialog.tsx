import { useState } from 'react';
import { RequiredDialogOptions } from '.';
import { Alert, Button, Dialog, FormError, ValueConfirmationField } from '@takaro/lib-components';
import { useGameServerResetCurrency } from '../../queries/gameserver';

interface GameServerResetCurrencyDialogProps extends RequiredDialogOptions {
  gameServerName: string;
  gameServerId: string;
}

export const GameServerResetCurrencyDialog = ({
  gameServerId,
  gameServerName,
  ...dialogOptions
}: GameServerResetCurrencyDialogProps) => {
  const [valid, setValid] = useState<boolean>(false);
  const { mutate, isPending: isResetting, isSuccess, error } = useGameServerResetCurrency();

  const handleOnReset = () => {
    mutate({ gameServerId });
  };

  if (isSuccess) {
    dialogOptions.onOpenChange(false);
  }

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>reset: all players' currency</Dialog.Heading>
        <Dialog.Body size="medium">
          <Alert
            variant="error"
            text={` This action will permanently reset ALL players' currency to 0 on ${gameServerName}.
            This action cannot be undone.`}
          />
          <p>
            To confirm, type <strong>{gameServerName}</strong> in the field below.
          </p>
          <ValueConfirmationField
            value={gameServerName}
            onValidChange={(v) => setValid(v)}
            id="resetCurrencyConfirmation"
          />
          <Button isLoading={isResetting} onClick={handleOnReset} disabled={!valid} fullWidth color="error">
            Reset all currency
          </Button>
          {error && <FormError error={error} />}
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
