import { Alert, Button, Dialog, TextField } from '@takaro/lib-components';
import { ItemSelectQueryField } from '../../components/selects/ItemSelectQueryField';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useGiveItem } from '../../queries/pog';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { RequiredDialogOptions } from '.';

interface PlayerGiveItemDialogProps extends RequiredDialogOptions {
  gameServerId: string;
  playerId: string;
}

const validationSchema = z.object({
  itemId: z.string().min(1),
  amount: z.number().positive().min(1),
  quality: z.string().optional(),
});

export const PlayerGiveItemDialog: FC<PlayerGiveItemDialogProps> = ({ gameServerId, playerId, ...dialogOptions }) => {
  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      amount: 1,
    },
  });
  const { mutate } = useGiveItem();

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ itemId, amount, quality }) => {
    mutate({ playerId, gameServerId, name: itemId, amount, quality: quality ?? '0' });
    dialogOptions.onOpenChange(false);
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>
          <strong> Give item: </strong>
        </Dialog.Heading>
        <Dialog.Body>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Alert
              variant="warning"
              text="Takaro currently cannot detetermine whether an item supports quality. If you assign a quality to an item that doesn't support it,
              the item will not be given."
            />
            <ItemSelectQueryField name="itemId" control={control} gameServerId={gameServerId} />
            <TextField label="Amount" name="amount" type="number" control={control} required />
            <TextField label="Quality" name="quality" control={control} />
            <Button type="submit" fullWidth>
              Give item
            </Button>
          </form>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
