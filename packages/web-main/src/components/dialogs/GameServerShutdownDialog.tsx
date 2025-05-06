import { Button, Dialog } from '@takaro/lib-components';
import { RequiredDialogOptions } from '.';
import { useGameServerShutdown } from '../../queries/gameserver';
import { MouseEvent } from 'react';

interface GameServerShutdownDialogProps extends RequiredDialogOptions {
  gameServerId: string;
  gameServerName: string;
}

export const GameServerShutdownDialog = ({
  gameServerId,
  gameServerName,
  ...dialogOptions
}: GameServerShutdownDialogProps) => {
  const { mutate: shutdownGameServer, isPending: isShuttingDown } = useGameServerShutdown();

  const handleOnShutdown = (e: MouseEvent) => {
    e.stopPropagation();
    shutdownGameServer(gameServerId);
    dialogOptions.onOpenChange(false);
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>shutdown: gameserver</Dialog.Heading>
        <Dialog.Body size="medium">
          <p>
            The gameserver will be stopped gracefully. If the gameserver is not reachable, this will have no effect.
            Note that most hosting providers will automatically restart the gameserver after a shutdown, which makes
            this operator act as a restart instead. <br />
            <br /> Are you sure you want to <strong>shutdown</strong> <strong>{gameServerName}</strong>?
          </p>
          <p></p>
          <Button isLoading={isShuttingDown} onClick={handleOnShutdown} fullWidth color="error">
            Shutdown gameserver
          </Button>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
