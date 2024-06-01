import { FC, MouseEvent, useState } from 'react';
import { Card, Dropdown, Button, Dialog, TextField } from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { useAddCurrency, useDeductCurrency } from 'queries/pogs';

interface CurrencyProps {
  playerId: string;
  gameServerId: string;
  currency: number;
}

export const Currency: FC<CurrencyProps> = ({ currency }) => {
  const [openAddCurrencyDialog, setOpenAddCurrencyDialog] = useState<boolean>(false);
  const [openRemoveCurrencyDialog, setOpenRemoveCurrencyDialog] = useState<boolean>(false);

  const {} = useAddCurrency();
  const {} = useDeductCurrency();

  const handleAddCurrencyClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenAddCurrencyDialog(true);
  };
  const handleAddCurrency = (currency: number) => {
    console.log(currency);
  };
  const handleRemoveCurrency = (currency: number) => {
    console.log(currency);
  };

  const handleRemoveCurrencyClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenRemoveCurrencyDialog(true);
  };

  return (
    <>
      <Card variant="outline">
        <h2>Currency: {currency}</h2>
        <Dropdown>
          <Dropdown.Trigger asChild>
            <Button text="actions" />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Menu.Item onClick={handleAddCurrencyClick} label="Add currency" />
            <Dropdown.Menu.Item onClick={handleRemoveCurrencyClick} label="Remove currency" />
          </Dropdown.Menu>
        </Dropdown>
        <Card variant="default">Currency Graph placeholder</Card>
      </Card>
      <CurrencyDialog
        variant="add"
        open={openAddCurrencyDialog}
        setOpen={setOpenAddCurrencyDialog}
        onSubmit={handleAddCurrency}
      />
      <CurrencyDialog
        variant="deduct"
        open={openRemoveCurrencyDialog}
        setOpen={setOpenRemoveCurrencyDialog}
        onSubmit={handleRemoveCurrency}
      />
    </>
  );
};

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
