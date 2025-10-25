import { FC, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { styled, TextField, Button, SelectField, Drawer, CollapseList } from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useShopCategories } from '../../queries/shopCategories';
import { ShopCategoryOutputDTO } from '@takaro/apiclient';

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

export type FormFields = z.infer<typeof validationSchema>;

interface CategoryFormProps {
  gameServerId: string;
  initialData?: ShopCategoryOutputDTO;
  onSubmit: SubmitHandler<FormFields>;
  isPending: boolean;
}

export const CategoryForm: FC<CategoryFormProps> = ({ gameServerId, initialData, onSubmit, isPending }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const isEdit = Boolean(initialData);
  const { data: categoriesData } = useShopCategories();

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
    ...(initialData && {
      values: {
        name: initialData.name,
        emoji: initialData.emoji,
        parentId: initialData.parentId ?? null,
      },
    }),
  });

  // Remove manual field controllers since we'll use the control prop directly
  const watchedEmoji = watch('emoji');

  useEffect(() => {
    if (!open) {
      navigate({ to: '/gameserver/$gameServerId/shop/categories', params: { gameServerId } });
    }
  }, [open, navigate, gameServerId]);

  const handleClose = () => {
    setOpen(false);
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
          if (cat.id === initialData!.id) return false;

          // Don't allow selecting descendants (simplified check - in real app would need recursive check)
          if (cat.parentId === initialData!.id) return false;

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
            <Button type="submit" form={formId} fullWidth isLoading={isPending}>
              Save changes
            </Button>
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
