import { Button, TextField } from '@takaro/lib-components';
import { useShopOrderCreate } from '../../../../../queries/shopOrder';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ShopListingBuyFormProps {
  playerCurrencyAmount: number;
  shopListingId: string;
  price: number;
  currencyName: string;
  isDraft: boolean;
  stock?: number | null;
  stockEnabled?: boolean;
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
  stock,
  stockEnabled,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createShopOrderMutate, isPending: isPendingShopOrderCreate } = useShopOrderCreate();
  const { handleSubmit, control, watch, setError } = useForm<z.infer<typeof validationSchema>>({
    mode: 'onChange',
    defaultValues: {
      amount: 1,
    },
    resolver: zodResolver(validationSchema),
  });

  const handleOnBuyClick: SubmitHandler<z.infer<typeof validationSchema>> = async ({ amount }) => {
    // Final validation before purchase
    if (stockEnabled && stock !== null && stock !== undefined && amount > stock) {
      setError('amount', { message: `Only ${stock} available` });
      return;
    }

    try {
      await createShopOrderMutate({
        amount,
        listingId: shopListingId,
      });

      enqueueSnackbar({
        variant: 'default',
        type: 'success',
        message: `successfully bought listing for ${amount * price} ${currencyName}!`,
      });
    } catch {
      enqueueSnackbar({ variant: 'default', type: 'error', message: 'Failed to buy listing' });
    }
  };

  const currentAmount = watch('amount');
  const totalPrice = price * currentAmount;
  const isOutOfStock = stockEnabled && stock === 0;
  const exceedsStock = stockEnabled && stock !== null && stock !== undefined && currentAmount > stock;
  const insufficientFunds = playerCurrencyAmount < totalPrice;

  const getButtonText = () => {
    if (isOutOfStock) return 'Out of stock';
    if (exceedsStock) return `Only ${stock} available`;
    if (insufficientFunds) return 'Insufficient funds';
    return `Buy for ${totalPrice} ${currencyName}`;
  };

  const isDisabled = isDraft || isOutOfStock || exceedsStock || insufficientFunds;

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
        disabled={isDisabled}
        color={isOutOfStock ? 'error' : undefined}
      >
        {getButtonText()}
      </Button>
    </form>
  );
};
