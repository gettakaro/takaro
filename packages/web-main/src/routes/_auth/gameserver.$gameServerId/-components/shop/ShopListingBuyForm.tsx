import { Button, TextField } from '@takaro/lib-components';
import { useShopOrderCreate } from 'queries/shopOrder';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import { z } from 'zod';

interface ShopListingBuyFormProps {
  playerCurrencyAmount: number;
  shopListingId: string;
  price: number;
  currencyName: string;
  isDraft: boolean;
}

const validationSchema = z.object({
  amount: z.number().int().positive().min(1),
});

export const ShopListingBuyForm: FC<ShopListingBuyFormProps> = ({
  shopListingId,
  playerCurrencyAmount,
  price,
  isDraft,
  currencyName,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createShopOrderMutate, isPending: isPendingShopOrderCreate } = useShopOrderCreate();
  const { handleSubmit, control, watch } = useForm<z.infer<typeof validationSchema>>({
    mode: 'onSubmit',
    defaultValues: {
      amount: 1,
    },
  });

  const handleOnBuyClick: SubmitHandler<z.infer<typeof validationSchema>> = async ({ amount }) => {
    try {
      await createShopOrderMutate({
        amount,
        listingId: shopListingId,
      });

      enqueueSnackbar({
        variant: 'default',
        type: 'success',
        message: `successfully bought listing for ! ${price} ${currencyName}`,
      });
    } catch {
      enqueueSnackbar({ variant: 'default', type: 'error', message: 'Failed to buy listing ${}' });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleOnBuyClick)}>
      <TextField
        loading={isPendingShopOrderCreate}
        control={control}
        name="amount"
        label="Amount"
        type="number"
        placeholder="Enter amount"
      />
      <Button
        isLoading={isPendingShopOrderCreate}
        fullWidth
        type="submit"
        disabled={playerCurrencyAmount < price || isDraft}
        text={`Buy for ${price * watch('amount')} ${currencyName}`}
      />
    </form>
  );
};
