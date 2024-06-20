import { FC, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Drawer, FileField, TextField, styled } from '@takaro/lib-components';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ItemsOutputDTO } from '@takaro/apiclient';

const MAX_FILE_SIZE_MB = 2;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface FormInputs {
  name: string;
  code: string;
  description: string;
  icon: FileList;
}

interface ItemFormProps {
  initialData?: ItemsOutputDTO;
  isLoading?: boolean;
  onSubmit: SubmitHandler<any>;
  gameServerId: string;
}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const ItemCreateUpdateForm: FC<ItemFormProps> = ({ initialData, onSubmit, gameServerId, isLoading }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const formId = 'item-form';

  const { control, handleSubmit } = useForm<FormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        description: z.string().optional(),
        icon: z
          .any()
          .refine((files) => files?.length == 1, 'Import data is required')
          .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE_MB * 100000, 'Max file size is 2MB.')
          .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            'Only .jpg, .jpeg, .png and .webp files are accepted.'
          ),
      })
    ),
  });

  useEffect(() => {
    if (!open) {
      navigate({
        to: '/gameserver/$gameServerId/items',
        params: { gameServerId },
      });
    }
  }, [open]);

  return (
    <Drawer>
      <Drawer.Content>
        <Drawer.Heading>{initialData ? 'Update item' : 'Create item'}</Drawer.Heading>
        <Drawer.Body>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField control={control} name="name" label="Name" required />;
            <TextField control={control} name="code" label="Code" required />;
            <TextField control={control} name="description" label="Description" />
            <FileField control={control} name="icon" label="Icon" />
          </form>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" type="button" />
            <Button type="submit" fullWidth text="Save changes" form={formId} isLoading={isLoading} />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
