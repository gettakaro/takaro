import { FC, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { styled, TextField, Button, Card, SelectField, DrawerSkeleton } from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
// Import removed - DTOs not used directly in this component
import {
  useShopCategories,
  useShopCategory,
  useShopCategoryCreate,
  useShopCategoryUpdate,
} from '../../queries/shopCategories';
import { useSnackbar } from 'notistack';
import { AiOutlineArrowLeft as BackIcon } from 'react-icons/ai';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing['2']};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  margin-bottom: ${({ theme }) => theme.spacing['4']};

  h1 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.large};
  }
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['2']};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing['2']};
`;

const EmojiInput = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
  align-items: flex-end;
`;

const EmojiPreview = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.background};
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
}

export const CategoryForm: FC<CategoryFormProps> = ({ categoryId }) => {
  const navigate = useNavigate();
  const params = useParams({ from: '/_auth/gameserver/$gameServerId/shop/categories/$categoryId/update' });
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!categoryId;

  const { data: categoriesData } = useShopCategories();
  const { data: categoryData, isLoading: isCategoryLoading } = useShopCategory(
    { categoryId: categoryId! },
    { enabled: isEdit },
  );
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
    if (isEdit && categoryData && typeof categoryData === 'object' && 'name' in categoryData) {
      setValue('name', categoryData.name);
      setValue('emoji', categoryData.emoji);
      setValue('parentId', categoryData.parentId ?? null);
    }
  }, [isEdit, categoryData, setValue]);

  const handleBack = () => {
    navigate({ to: '/gameserver/$gameServerId/shop/categories', params: { gameServerId: params.gameServerId } });
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
            handleBack();
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
          parentId: data.parentId,
        },
        {
          onSuccess: () => {
            enqueueSnackbar('Category created successfully', { variant: 'default', type: 'success' });
            handleBack();
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

  return (
    <Container>
      <Header>
        <Button onClick={handleBack} variant="outline" icon={<BackIcon />} size="small">
          Back
        </Button>
        <h1>{isEdit ? 'Edit Category' : 'Create Category'}</h1>
      </Header>

      <Card>
        <Card.Body>
          <FormContainer onSubmit={handleSubmit(onSubmit)}>
            <TextField
              control={control}
              name="name"
              label="Category Name"
              placeholder="e.g., Weapons, Armor, Tools"
              required
            />

            <div>
              <label>Emoji</label>
              <EmojiInput>
                <TextField control={control} name="emoji" placeholder="Enter one emoji" required style={{ flex: 1 }} />
                <EmojiPreview>{watchedEmoji || '?'}</EmojiPreview>
              </EmojiInput>
              <small>Enter exactly one emoji character (e.g., 🗡️, 🛡️, 🔧)</small>
            </div>

            <SelectField control={control} name="parentId" label="Parent Category" options={parentOptions()} />

            <ButtonGroup>
              <Button type="button" onClick={handleBack} variant="outline">
                Cancel
              </Button>
              <Button type="submit" isLoading={isCreating || isUpdating}>
                {isEdit ? 'Update' : 'Create'} Category
              </Button>
            </ButtonGroup>
          </FormContainer>
        </Card.Body>
      </Card>
    </Container>
  );
};
