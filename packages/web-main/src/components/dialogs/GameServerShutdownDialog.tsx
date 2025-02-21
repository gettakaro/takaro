import { Button, Dialog } from '@takaro/lib-components';
import { RequiredDialogOptions } from '.';
import { useGameServerShutdown } from '../../queries/gameserver';

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

  const handleOnShutdown = () => {
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
          <Button
            isLoading={isShuttingDown}
            onClick={handleOnShutdown}
            fullWidth
            text="Shutdown gameserver"
            color="error"
          />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
