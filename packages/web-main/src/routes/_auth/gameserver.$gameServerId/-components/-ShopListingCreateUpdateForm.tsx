import { zodResolver } from '@hookform/resolvers/zod';
import { ShopListingOutputDTO } from '@takaro/apiclient';
import { Button, Drawer, TextField, styled } from '@takaro/lib-components';
import { useNavigate } from '@tanstack/react-router';
import { ItemSelect } from 'components/selects/ItemSelectQuery';
import { FC, useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
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
  price: z.number().min(0),
  itemId: z.string().min(1),
  //items: z.array(z.string()).min(1, 'At least one item is required'),
  //roleIds: z.array(z.string()).optional(),
});

export type FormValues = z.infer<typeof validationSchema>;

export const ShopListingCreateUpdateForm: FC<ShopListingCreateUpdateFormProps> = ({
  gameServerId,
  onSubmit,
  initialData,
  isLoading,
  currencyName,
}) => {
  const formId = 'shopitem-form';
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const readOnly = onSubmit === undefined;

  const { control, handleSubmit } = useForm<FormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),

    ...(initialData && {
      values: {
        name: initialData.name,
        price: initialData.price,
        itemId: initialData.itemId!,
        //roleIds: [],
      },
    }),
  });

  useEffect(() => {
    if (!open) {
      navigate({
        to: '/gameserver/$gameServerId/shop',
        params: { gameServerId },
      });
    }
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>{initialData ? 'Update' : 'Create'} Shop item</Drawer.Heading>
        <Drawer.Body>
          <form onSubmit={onSubmit && handleSubmit(onSubmit)} id={formId}>
            <ItemSelect
              gameServerId={gameServerId}
              control={control}
              name="itemId"
              label="Item"
              description="The items that will be given to the player when they buy this item"
              readOnly={readOnly}
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
            {/*
            <RoleSelect
              multiple
              control={control}
              name="roleIds"
              label="Roles"
              description="The roles that can buy this item. If empty, everyone can buy it"
              loading={isLoading}
              canClear
            />
              */}
            <TextField readOnly={readOnly} control={control} name="name" label="Name" loading={isLoading} />
          </form>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" type="button" />
            <Button type="submit" fullWidth text="Save changes" form={formId} />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
