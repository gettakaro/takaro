import { Button, Dialog, TextAreaField } from '@takaro/lib-components';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useKickPlayerOnGameServer } from '../../queries/gameserver';
import { RequiredDialogOptions } from '.';

interface PlayerKickDialogProps extends RequiredDialogOptions {
  gameServerId: string;
  playerId: string;
}

const validationSchema = z.object({
  reason: z.string().min(1),
});

export const PlayerKickDialog: FC<PlayerKickDialogProps> = ({ gameServerId, playerId, ...dialogOptions }) => {
  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });
  const { mutate } = useKickPlayerOnGameServer();

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ reason }) => {
    mutate({ playerId, gameServerId, reason });
    dialogOptions.onOpenChange(false);
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>
          <strong>Kick player: </strong>
        </Dialog.Heading>
        <Dialog.Body>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextAreaField label="Kick reason" name="reason" control={control} />
            <Button type="submit" fullWidth>
              Kick player
            </Button>
          </form>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
