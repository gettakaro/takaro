import { zodResolver } from '@hookform/resolvers/zod';
import { ShopListingOutputDTO } from '@takaro/apiclient';
import {
  Alert,
  Button,
  CollapseList,
  Drawer,
  FormError,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  styled,
} from '@takaro/lib-components';
import { useRouter } from '@tanstack/react-router';
import { ItemSelectQueryField } from '../selects/ItemSelectQueryField';
import { CategorySelector } from './CategorySelector';
import { FC, useEffect, useState } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { z } from 'zod';

import {
  AiOutlineClose as RemoveFieldIcon,
  AiOutlinePlus as AddFieldIcon,
  AiOutlineCaretUp as FieldUpIcon,
  AiOutlineCaretDown as FieldDownIcon,
} from 'react-icons/ai';

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
  name: z.string().optional().nullable(),
  price: z.number().min(1, 'Price must be at least 1 coin'),
  draft: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
  items: z
    .array(
      z.object({
        amount: z.number().min(1, 'Amount must atleast be 1.'),
        quality: z.string().optional(),
        itemId: z.string().min(1, 'Item cannot be empty'),
      }),
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

  const { control, handleSubmit, formState, watch, setValue, reset } = useForm<FormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: undefined,
      price: 0,
      draft: undefined,
      categoryIds: [],
      items: [{ itemId: '', amount: 1, quality: '' }],
    },
  });

  const {
    fields,
    append: addItem,
    remove: removeItem,
    swap: moveItem,
  } = useFieldArray({
    control: control,
    name: 'items',
  });

  useEffect(() => {
    if (!open) {
      history.go(-1);
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name ? initialData.name : undefined,
        price: initialData.price,
        draft: initialData.draft !== undefined ? initialData.draft : undefined,
        categoryIds: initialData.categories ? initialData.categories.map((cat) => cat.id) : [],
        items: initialData.items.map((shopListingItemMeta) => {
          return {
            amount: shopListingItemMeta.amount,
            itemId: shopListingItemMeta.item.id,
            quality: shopListingItemMeta.quality,
          };
        }),
      });
    }
  }, [initialData, reset]);

  return (
    <Drawer open={open} onOpenChange={setOpen} promptCloseConfirmation={readOnly === false && formState.isDirty}>
      <Drawer.Content>
        <Drawer.Heading>{initialData ? (readOnly ? 'View' : 'Update') : 'Create'} Shop listing</Drawer.Heading>
        <Drawer.Body>
          <form onSubmit={onSubmit && handleSubmit(onSubmit)} id={formId}>
            <TextField
              readOnly={readOnly}
              control={control}
              name="name"
              label="Friendly name"
              loading={isLoading}
              description="This is the name shown shown on the item in the shop. If no friendly name is provided, the name of the first item will be used."
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
            <Switch
              readOnly={readOnly}
              control={control}
              name="draft"
              label="Draft"
              loading={isLoading}
              description="The shop listing cannot be bought and will not be shown to users who don't have `MANAGE_SHOP_LISTINGS` permissions."
            />
            <CategorySelector
              selectedCategoryIds={watch('categoryIds') || []}
              onChange={(categoryIds) => setValue('categoryIds', categoryIds)}
              label="Categories"
              placeholder="Search categories..."
            />
            <CollapseList>
              <CollapseList.Item title="Items">
                <Alert
                  variant="info"
                  text="Uploading a custom image is not supported yet. For now, the icon of the first item will be used."
                  elevation={3}
                />
                {fields.length > 0 &&
                  fields.map((field, index) => (
                    <Field key={field.id}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '1rem',
                        }}
                      >
                        <h3>Item {index + 1}</h3>

                        <div>
                          <Tooltip placement="top">
                            <Tooltip.Trigger asChild>
                              <IconButton
                                disabled={readOnly || index === fields.length - 1}
                                onClick={() => moveItem(index, index + 1)}
                                icon={<FieldDownIcon size={16} cursor="pointer" />}
                                ariaLabel="Move down"
                              />
                            </Tooltip.Trigger>
                            <Tooltip.Content>Move down</Tooltip.Content>
                          </Tooltip>

                          <Tooltip placement="top">
                            <Tooltip.Trigger asChild>
                              <IconButton
                                disabled={readOnly || index === 0}
                                onClick={() => {
                                  moveItem(index, index - 1);
                                }}
                                icon={<FieldUpIcon size={16} cursor="pointer" />}
                                ariaLabel="Move up"
                              />
                            </Tooltip.Trigger>
                            <Tooltip.Content>Move up</Tooltip.Content>
                          </Tooltip>
                          <Tooltip placement="top">
                            <Tooltip.Trigger asChild>
                              <IconButton
                                size="tiny"
                                onClick={() => removeItem(index)}
                                icon={<RemoveFieldIcon />}
                                disabled={readOnly}
                                ariaLabel="Remove field"
                              />
                            </Tooltip.Trigger>
                            <Tooltip.Content>Remove item</Tooltip.Content>
                          </Tooltip>
                        </div>
                      </div>
                      <ItemSelectQueryField
                        gameServerId={gameServerId}
                        control={control}
                        name={`items.${index}.itemId`}
                        loading={isLoading}
                        readOnly={readOnly}
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
                    fullWidth
                  >
                    Add item
                  </Button>
                )}
              </CollapseList.Item>
            </CollapseList>

            {error && <FormError error={error} />}
          </form>
        </Drawer.Body>
        <Drawer.Footer>
          {readOnly ? (
            <Button fullWidth>Close view</Button>
          ) : (
            <ButtonContainer>
              <Button onClick={() => setOpen(false)} color="background" type="button">
                Cancel
              </Button>
              <Button type="submit" fullWidth form={formId}>
                Save changes
              </Button>
            </ButtonContainer>
          )}
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
