import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, FormError, SelectField, TextField } from '@takaro/lib-components';
import { useDeductCurrency } from '../../queries/pog';
import { useAddCurrency } from '../../queries/pog';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { RequiredDialogOptions } from '.';

const currencySchema = z.object({
  currency: z.number().positive({ message: 'Currency must be greater than 0' }),
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

  const { handleSubmit, control, watch } = useForm<z.infer<typeof currencySchema>>({
    resolver: zodResolver(currencySchema),
    values: {
      variant: 'add',
      currency: 0,
    },
  });

  const submit: SubmitHandler<z.infer<typeof currencySchema>> = async ({ currency, variant }) => {
    try {
      if (variant === 'add') {
        await addCurrency({ playerId, gameServerId, currency });
      } else if (variant === 'deduct') {
        await deductCurrency({ playerId, gameServerId, currency });
      }
      dialogOptions.onOpenChange(false);
    } catch {
      // no op
    }
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
            <TextField placeholder="200" control={control} type="number" name="currency" label="Currency" />
            {addCurrencyError && <FormError error={addCurrencyError} />}
            {deductCurrencyError && <FormError error={deductCurrencyError} />}

            <Button
              fullWidth
              isLoading={isAddingCurrency || isDeductingCurrency}
              type="submit"
              text={`${watch('variant')} currency`}
            />
          </form>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
