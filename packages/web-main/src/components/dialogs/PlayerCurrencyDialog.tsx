import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, FormError, SelectField, TextField } from '@takaro/lib-components';
import { useDeductCurrency } from '../../queries/pog';
import { useAddCurrency } from '../../queries/pog';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { RequiredDialogOptions } from '.';
import { useQuery } from '@tanstack/react-query';
import { gameServerSettingQueryOptions } from '../../queries/setting';

const currencySchema = z.object({
  currency: z.number().min(0, { message: 'Currency must be 0 or greater' }),
  variant: z.enum(['add', 'deduct']).default('add'),
});

interface CurrencyDialogProps extends RequiredDialogOptions {
  playerId: string;
  gameServerId: string;
}

export const PlayerCurrencyDialog: FC<CurrencyDialogProps> = ({ playerId, gameServerId, ...dialogOptions }) => {
  const { mutateAsync: addCurrency, isPending: isAddingCurrency, error: addCurrencyError } = useAddCurrency();
  const {
    mutateAsync: deductCurrency,
    isPending: isDeductingCurrency,
    error: deductCurrencyError,
  } = useDeductCurrency();

  const { data, isPending } = useQuery(gameServerSettingQueryOptions('currencyName', gameServerId));

  const { handleSubmit, control, watch } = useForm<z.infer<typeof currencySchema>>({
    resolver: zodResolver(currencySchema),
    values: {
      variant: 'add',
      currency: 0,
    },
  });

  const submit: SubmitHandler<z.infer<typeof currencySchema>> = async ({ currency, variant }) => {
    if (variant === 'add') {
      await addCurrency({ playerId, gameServerId, currency });
    } else if (variant === 'deduct') {
      await deductCurrency({ playerId, gameServerId, currency });
    }
    dialogOptions.onOpenChange(false);
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading>Currency: </Dialog.Heading>
        <Dialog.Body>
          <form onSubmit={handleSubmit(submit)}>
            <SelectField
              control={control}
              name="variant"
              label="Action"
              multiple={false}
              render={(selectedItems) => {
                if (selectedItems.length === 0) {
                  return <div>select variant</div>;
                }
                return <div>{selectedItems[0].label}</div>;
              }}
            >
              <SelectField.OptionGroup>
                <SelectField.Option key={'currency-add'} value="add" label="Add currency">
                  Add Currency
                </SelectField.Option>
                <SelectField.Option key={'currency-deduct'} value="deduct" label="Deduct currency">
                  Deduct Currency
                </SelectField.Option>
              </SelectField.OptionGroup>
            </SelectField>
            <TextField
              placeholder="200"
              control={control}
              type="number"
              name="currency"
              label="Currency"
              suffix={isPending ? '' : data?.value}
            />
            {addCurrencyError && <FormError error={addCurrencyError} />}
            {deductCurrencyError && <FormError error={deductCurrencyError} />}
            <Button fullWidth isLoading={isAddingCurrency || isDeductingCurrency} type="submit">
              {watch('variant')} currency
            </Button>
          </form>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
