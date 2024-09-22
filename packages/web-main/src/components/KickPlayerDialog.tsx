import { Button, Dialog, TextAreaField } from '@takaro/lib-components';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useKickPlayerOnGameServer } from 'queries/gameserver';

interface KickPlayerDialogProps {
  gameServerId: string;
  playerId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const validationSchema = z.object({
  reason: z.string().min(1),
});

export const KickPlayerDialog: FC<KickPlayerDialogProps> = ({ gameServerId, playerId, open, setOpen }) => {
  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });
  const { mutate } = useKickPlayerOnGameServer();

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ reason }) => {
    mutate({ playerId, gameServerId, reason });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Content>
        <Dialog.Heading>
          <strong>Kick player: </strong>
        </Dialog.Heading>
        <Dialog.Body>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextAreaField label="Kick reason" name="reason" control={control} />
            <Button type="submit" fullWidth text="Kick player" />
          </form>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
