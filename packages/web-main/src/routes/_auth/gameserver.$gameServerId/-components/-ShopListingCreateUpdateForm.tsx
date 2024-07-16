import { zodResolver } from '@hookform/resolvers/zod';
import { ShopListingOutputDTO } from '@takaro/apiclient';
import { Alert, Button, CollapseList, Drawer, FormError, IconButton, TextField, styled } from '@takaro/lib-components';
import { useRouter } from '@tanstack/react-router';
import { ItemSelect } from 'components/selects/ItemSelectQuery';
import { FC, useEffect, useState } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { z } from 'zod';

import { AiOutlineClose as RemoveFieldIcon, AiOutlinePlus as AddFieldIcon } from 'react-icons/ai';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Field = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

interface ShopListingCreateUpdateFormProps {
  initialData?: ShopListingOutputDTO;
  currencyName: string;
  isLoading?: boolean;
  onSubmit?: SubmitHandler<FormValues>;
  error: string | string[] | null;
  gameServerId: string;
}

const validationSchema = z.object({
  name: z.string().optional(),
  price: z.number().min(0, 'Price is required.'),
  items: z
    .array(
      z.object({
        amount: z.number().min(1, 'Amount must atleast be 1.'),
        quality: z.string().optional(),
        itemId: z.string().min(1, 'Item cannot be empty'),
      })
    )
    .min(1, 'At least one item is required'),
});

export type FormValues = z.infer<typeof validationSchema>;

export const ShopListingCreateUpdateForm: FC<ShopListingCreateUpdateFormProps> = ({
  gameServerId,
  onSubmit,
  initialData,
  isLoading,
  currencyName,
  error,
}) => {
  const formId = 'shopitem-form';
  const [open, setOpen] = useState(true);
  const readOnly = onSubmit === undefined;
  const { history } = useRouter();

  const { control, handleSubmit } = useForm<FormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    ...(initialData && {
      values: {
        name: initialData.name,
        price: initialData.price,
        items: initialData.items.map((shopListingItemMeta) => {
          return {
            amount: shopListingItemMeta.amount,
            itemId: shopListingItemMeta.item.id,
            quality: shopListingItemMeta.quality,
          };
        }),
      },
    }),
  });

  const {
    fields,
    append: addItem,
    remove: removeItem,
  } = useFieldArray({
    control: control,
    name: 'items',
    shouldUnregister: true,
  });

  useEffect(() => {
    if (!open) {
      history.go(-1);
    }
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>{initialData ? (readOnly ? 'View' : 'Update') : 'Create'} Shop item</Drawer.Heading>
        <Drawer.Body>
          <form onSubmit={onSubmit && handleSubmit(onSubmit)} id={formId}>
            <TextField
              readOnly={readOnly}
              control={control}
              name="name"
              label="Friendly name"
              loading={isLoading}
              description="If no friendly name is provided, the name of the first item will be used."
            />
            <TextField
              control={control}
              type="number"
              name="price"
              label="Price"
              readOnly={readOnly}
              loading={isLoading}
              suffix={currencyName}
              required
            />
            <CollapseList>
              <CollapseList.Item title="Items">
                <Alert
                  variant="info"
                  text="Uploading a custom image is not supported yet. For now, the icon of the first item will be used."
                  elevation={3}
                />
                {fields.length > 0 &&
                  fields.map((_field, index) => (
                    <Field key={'shoplistingfield-' + index}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '1rem',
                        }}
                      >
                        <h3>Item {index + 1}</h3>
                        <IconButton
                          size="tiny"
                          onClick={() => !readOnly && removeItem(index)}
                          icon={<RemoveFieldIcon />}
                          ariaLabel="Remove field"
                        />
                      </div>
                      <ItemSelect
                        gameServerId={gameServerId}
                        control={control}
                        name={`items.${index}.itemId`}
                        loading={isLoading}
                        readOnly={readOnly}
                        inPortal
                      />
                      <TextField
                        control={control}
                        type="number"
                        name={`items.${index}.amount`}
                        label="Amount"
                        readOnly={readOnly}
                        loading={isLoading}
                        required
                      />
                      <TextField
                        control={control}
                        type="text"
                        name={`items.${index}.quality`}
                        label="Quality"
                        readOnly={readOnly}
                        loading={isLoading}
                        description="If the item provides a quality grade, it can be provided here."
                      />
                    </Field>
                  ))}
                {!readOnly && (
                  <Button
                    icon={<AddFieldIcon />}
                    onClick={() => {
                      addItem({
                        itemId: '',
                        amount: 1,
                        quality: '',
                      });
                    }}
                    type="button"
                    text="Add item"
                    fullWidth
                  />
                )}
              </CollapseList.Item>
            </CollapseList>

            {error && <FormError error={error} />}
          </form>
        </Drawer.Body>
        <Drawer.Footer>
          {readOnly ? (
            <Button fullWidth text="Close view" />
          ) : (
            <ButtonContainer>
              <Button text="Cancel" onClick={() => setOpen(false)} color="background" type="button" />
              <Button type="submit" fullWidth text="Save changes" form={formId} />
            </ButtonContainer>
          )}
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
