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
  TextAreaField,
  Tooltip,
  styled,
} from '@takaro/lib-components';
import { useRouter } from '@tanstack/react-router';
import { ItemSelectQueryField } from '../../../../components/selects/ItemSelectQueryField';
import { CategorySelector } from '../../../../components/shop/CategorySelector';
import { FC, useEffect, useState, useCallback } from 'react';
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
  price: z.number().min(0, 'Price is required.'),
  draft: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
  icon: z.string().optional().nullable(),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().nullable(),
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
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconSize, setIconSize] = useState<number>(0);
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
      icon: undefined,
      description: undefined,
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
        icon: initialData.icon,
        description: initialData.description,
        items: initialData.items.map((shopListingItemMeta) => {
          return {
            amount: shopListingItemMeta.amount,
            itemId: shopListingItemMeta.item.id,
            quality: shopListingItemMeta.quality,
          };
        }),
      });
      if (initialData.icon) {
        setIconPreview(initialData.icon);
      }
    }
  }, [initialData, reset]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        setIconPreview(null);
        setIconSize(0);
        setValue('icon', undefined);
        return;
      }

      // Check file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PNG, JPG, JPEG, or WEBP image.');
        e.target.value = '';
        return;
      }

      // Store file size for warning
      setIconSize(file.size);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setIconPreview(base64String);
        setValue('icon', base64String);
      };
      reader.readAsDataURL(file);
    },
    [setValue],
  );

  const descriptionValue = watch('description');
  const charactersRemaining = 500 - (descriptionValue?.length || 0);

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
              description="The shop listing cannot be bought and will not be shown to users who don't have MANAGE_SHOP_LISTINGS permissions."
            />
            <CategorySelector
              selectedCategoryIds={watch('categoryIds') || []}
              onChange={(categoryIds) => setValue('categoryIds', categoryIds)}
              label="Categories"
              placeholder="Search categories..."
            />
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Shop Listing Icon</label>
              {!readOnly && (
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  style={{ marginBottom: '0.5rem' }}
                />
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0.5rem 0' }}>
                Upload a custom icon for this shop listing. Supported formats: PNG, JPG, WEBP. The image will be resized
                to 256x256 pixels.
              </p>
            </div>
            {iconSize > 5 * 1024 * 1024 && (
              <Alert
                variant="warning"
                text="Warning: The selected image is larger than 5MB. It will be compressed, but upload may take longer."
                elevation={2}
              />
            )}
            {iconPreview && (
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <img
                  src={iconPreview}
                  alt="Icon preview"
                  style={{
                    maxWidth: '128px',
                    maxHeight: '128px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-backgroundAccent)',
                  }}
                />
              </div>
            )}
            <TextAreaField
              control={control}
              name="description"
              label="Description"
              readOnly={readOnly}
              loading={isLoading}
              description={`A brief description of this shop listing. ${charactersRemaining} characters remaining.`}
              placeholder="Enter a description for this shop listing..."
            />
            <CollapseList>
              <CollapseList.Item title="Items">
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
