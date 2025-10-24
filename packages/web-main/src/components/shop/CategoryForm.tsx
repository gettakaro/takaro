import { FC, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { styled, TextField, Button, SelectField, DrawerSkeleton, Drawer, CollapseList } from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
// Import removed - DTOs not used directly in this component
import {
  useShopCategories,
  useShopCategory,
  useShopCategoryCreate,
  useShopCategoryUpdate,
} from '../../queries/shopCategories';
import { ShopCategoryOutputDTO } from '@takaro/apiclient';
import { useSnackbar } from 'notistack';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const EmojiSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['4']};
`;

const EmojiInputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
`;

const EmojiTrigger = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  border: 2px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.background};
  flex-shrink: 0;
`;

const EmojiPickerContainer = styled.div`
  width: 352px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;

  em-emoji-picker {
    --rgb-background: ${({ theme }) => theme.colors.background};
    --rgb-input: ${({ theme }) => theme.colors.backgroundAccent};
    --rgb-color: ${({ theme }) => theme.colors.text};
    --rgb-accent: ${({ theme }) => theme.colors.primary};
    width: 100%;
    height: 435px;
  }
`;

const validationSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .regex(
      /^[a-zA-Z0-9\s\-_&]+$/,
      'Name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands',
    ),
  emoji: z
    .string()
    .min(1, 'Emoji is required')
    .regex(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u, 'Must be exactly one emoji character'),
  parentId: z.string().nullable(),
});

type FormFields = z.infer<typeof validationSchema>;

interface CategoryFormProps {
  categoryId?: string;
  gameServerId: string;
}

export const CategoryForm: FC<CategoryFormProps> = ({ categoryId, gameServerId }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!categoryId;
  const [open, setOpen] = useState(true);

  const { data: categoriesData } = useShopCategories();
  const { data: categoryData, isLoading: isCategoryLoading } = useShopCategory(
    { categoryId: categoryId! },
    { enabled: isEdit },
  );

  // Type assertion to ensure TypeScript knows the shape
  const typedCategoryData = categoryData as ShopCategoryOutputDTO | undefined;
  const { mutate: createCategory, isPending: isCreating } = useShopCategoryCreate();
  const { mutate: updateCategory, isPending: isUpdating } = useShopCategoryUpdate();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors: _errors },
  } = useForm<FormFields>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: '',
      emoji: '',
      parentId: null,
    },
  });

  // Remove manual field controllers since we'll use the control prop directly

  const watchedEmoji = watch('emoji');

  // Load existing category data for edit mode
  useEffect(() => {
    if (isEdit && typedCategoryData) {
      setValue('name', typedCategoryData.name);
      setValue('emoji', typedCategoryData.emoji);
      setValue('parentId', typedCategoryData.parentId ?? null);
    }
  }, [isEdit, typedCategoryData, setValue]);

  useEffect(() => {
    if (!open) {
      navigate({ to: '/gameserver/$gameServerId/shop/categories', params: { gameServerId } });
    }
  }, [open, navigate, gameServerId]);

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (isEdit) {
      updateCategory(
        {
          shopCategoryId: categoryId!,
          shopCategoryDetails: {
            name: data.name,
            emoji: data.emoji,
            parentId: data.parentId ?? undefined,
          },
        },
        {
          onSuccess: () => {
            enqueueSnackbar('Category updated successfully', { variant: 'default', type: 'success' });
            handleClose();
          },
          onError: (error: any) => {
            const message = error?.response?.data?.meta?.error?.message || 'Failed to update category';
            enqueueSnackbar(message, { variant: 'default', type: 'error' });
          },
        },
      );
    } else {
      createCategory(
        {
          name: data.name,
          emoji: data.emoji,
          parentId: data.parentId ?? undefined,
        },
        {
          onSuccess: () => {
            enqueueSnackbar('Category created successfully', { variant: 'default', type: 'success' });
            handleClose();
          },
          onError: (error: any) => {
            const message = error?.response?.data?.meta?.error?.message || 'Failed to create category';
            enqueueSnackbar(message, { variant: 'default', type: 'error' });
          },
        },
      );
    }
  };

  // Build parent category options
  const parentOptions = () => {
    if (!categoriesData) return [{ value: '', label: 'None (Root Category)' }];

    const options = [{ value: '', label: 'None (Root Category)' }];
    const categories = categoriesData.data || [];

    // Filter out the current category and its descendants in edit mode
    const filteredCategories = isEdit
      ? categories.filter((cat) => {
          // Don't allow selecting self as parent
          if (cat.id === categoryId) return false;

          // Don't allow selecting descendants (simplified check - in real app would need recursive check)
          if (cat.parentId === categoryId) return false;

          return true;
        })
      : categories;

    filteredCategories.forEach((cat) => {
      // Build hierarchical label
      let label = `${cat.emoji} ${cat.name}`;
      if (cat.parentId) {
        const parent = categories.find((p) => p.id === cat.parentId);
        if (parent) {
          label = `${parent.emoji} ${parent.name} > ${cat.emoji} ${cat.name}`;
        }
      }
      options.push({ value: cat.id, label });
    });

    return options;
  };

  if (isEdit && isCategoryLoading) {
    return <DrawerSkeleton />;
  }

  const formId = 'category-form';

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>
          <h1>{isEdit ? 'Edit Category' : 'Create Category'}</h1>
        </Drawer.Heading>
        <Drawer.Body>
          <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <CollapseList>
              <CollapseList.Item title="Category Details">
                <TextField
                  control={control}
                  name="name"
                  label="Category Name"
                  placeholder="e.g., Weapons, Armor, Tools"
                  required
                />

                <EmojiSection>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Emoji *</label>
                  <EmojiInputWrapper>
                    <EmojiTrigger>{watchedEmoji || '❓'}</EmojiTrigger>
                    <EmojiPickerContainer>
                      <Picker
                        data={data}
                        onEmojiSelect={(emoji: any) => {
                          setValue('emoji', emoji.native);
                        }}
                        theme="dark"
                        previewPosition="none"
                        skinTonePosition="none"
                      />
                    </EmojiPickerContainer>
                  </EmojiInputWrapper>
                </EmojiSection>

                <SelectField
                  control={control}
                  name="parentId"
                  label="Parent Category"
                  render={(selectedItems) => {
                    if (selectedItems.length === 0) {
                      return <div>No parent (root category)</div>;
                    }
                    return <div>{selectedItems[0].label}</div>;
                  }}
                >
                  <SelectField.OptionGroup>
                    {parentOptions().map((option) => (
                      <SelectField.Option key={option.value} value={option.value} label={option.label}>
                        <div>{option.label}</div>
                      </SelectField.Option>
                    ))}
                  </SelectField.OptionGroup>
                </SelectField>
              </CollapseList.Item>
            </CollapseList>
          </form>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button type="button" color="background" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" form={formId} fullWidth isLoading={isCreating || isUpdating}>
              Save changes
            </Button>
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
