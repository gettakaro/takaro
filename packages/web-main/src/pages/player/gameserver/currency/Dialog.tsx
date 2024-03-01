import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, TextField } from '@takaro/lib-components';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

const currencySchema = z.object({
  currency: z.number().nonnegative(),
});

interface CurrencyDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (currency: number) => void;
  variant: 'add' | 'deduct';
}

export const CurrencyDialog: FC<CurrencyDialogProps> = ({ onSubmit, variant, open, setOpen }) => {
  const { handleSubmit, control } = useForm<z.infer<typeof currencySchema>>({
    resolver: zodResolver(currencySchema),
  });

  const submit: SubmitHandler<z.infer<typeof currencySchema>> = ({ currency }) => {
    onSubmit(currency);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Heading>
        <span>{variant}: currency</span>
      </Dialog.Heading>
      <Dialog.Body>
        <p></p>
        <form onSubmit={handleSubmit(submit)}>
          <TextField control={control} type="number" name="currency" label="Currency" />
        </form>
        <Button type="submit" text={`${variant} currency`} />
      </Dialog.Body>
    </Dialog>
  );
};
