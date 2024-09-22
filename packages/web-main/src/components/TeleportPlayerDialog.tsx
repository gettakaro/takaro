import { Button, Dialog, styled, TextField } from '@takaro/lib-components';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTeleportPlayer } from 'queries/gameserver';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[1]};
`;

interface TeleportPlayerDialogProps {
  gameServerId: string;
  playerId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const TeleportPlayerDialog: FC<TeleportPlayerDialogProps> = ({ gameServerId, playerId, open, setOpen }) => {
  const onSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
    x: z.number(),
    y: z.number(),
    z: z.number(),
  });
  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ x, y, z }) => {
    const { mutate } = useTeleportPlayer();
    try {
      mutate({ playerId, gameServerId, x, y, z });
      onSuccess();
    } catch { }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Container>
        <TextField type="number" label="X coordinate" name="x" control={control} placeholder="100" />
        <TextField type="number" label="Y coordinate" name="y" control={control} placeholder="100" />
        <TextField type="number" label="Z coordinate" name="z" control={control} placeholder="100" />
      </Container>
      <Button type="submit" fullWidth text="Teleport player" />
    </form>
  );
};
