import { Button, Dialog, TextField } from '@takaro/lib-components';
import { ItemSelectQueryField } from '../components/selects/ItemSelectQueryField';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useGiveItem } from 'queries/pog';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface GiveItemProps {
  gameServerId: string;
  playerId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const validationSchema = z.object({
  itemId: z.string().min(1),
  amount: z.number().positive(),
  quality: z.string(),
});

export const GiveItemDialog: FC<GiveItemProps> = ({ gameServerId, playerId, open, setOpen }) => {
  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });
  const { mutate } = useGiveItem();

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ itemId, amount, quality }) => {
    mutate({ playerId, gameServerId, name: itemId, amount, quality });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Content>
        <Dialog.Heading>
          <strong> Give item: </strong>
        </Dialog.Heading>
        <Dialog.Body>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ItemSelectQueryField inPortal name="itemId" control={control} gameServerId={gameServerId} />
            <TextField label="Amount" name="amount" type="number" control={control} />
            <TextField label="Quality" name="quality" type="number" control={control} />
            <Button type="submit" fullWidth text="Give item" />
          </form>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
