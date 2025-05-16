import { Button, Dialog, FormError, styled, TextField } from '@takaro/lib-components';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTeleportPlayer } from '../../queries/gameserver';
import { RequiredDialogOptions } from '.';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[1]};
`;

interface PlayerTeleportDialogProps extends RequiredDialogOptions {
  gameServerId: string;
  playerId: string;
}

export const PlayerTeleportDialog: FC<PlayerTeleportDialogProps> = ({ gameServerId, playerId, ...dialogOptions }) => {
  const onSuccess = () => {
    dialogOptions.onOpenChange(false);
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>
          <strong>Teleport player:</strong>
        </Dialog.Heading>
        <Dialog.Body>
          <TeleportPlayerForm gameServerId={gameServerId} playerId={playerId} onSuccess={onSuccess} />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};

interface TeleportPlayerForm {
  playerId: string;
  gameServerId: string;
  onSuccess: () => void;
}
const TeleportPlayerForm: FC<TeleportPlayerForm> = ({ gameServerId, playerId, onSuccess }) => {
  const validationSchema = z.object({
    x: z.number({ required_error: 'x coordinate is required' }).int(),
    y: z.number({ required_error: 'y coordinate is required' }).int(),
    z: z.number({ required_error: 'z coordinate is required' }).int(),
  });
  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });
  const { mutate, error } = useTeleportPlayer();

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ x, y, z }) => {
    try {
      mutate({ playerId, gameServerId, x, y, z });
      onSuccess();
    } catch {
      /* noop */
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Container>
        <TextField type="number" label="X coordinate" name="x" control={control} placeholder="100" />
        <TextField type="number" label="Y coordinate" name="y" control={control} placeholder="100" />
        <TextField type="number" label="Z coordinate" name="z" control={control} placeholder="100" />
      </Container>
      {error && <FormError error={error} />}
      <Button type="submit" fullWidth>
        Teleport player
      </Button>
    </form>
  );
};
