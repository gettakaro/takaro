import { zodResolver } from '@hookform/resolvers/zod';
import { ShopListingOutputDTO } from '@takaro/apiclient';
import { Button, Drawer, DrawerSkeleton, FileField, FormError, styled, Switch } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from '../../../hooks/useHasPermission';
import { useShopListingImport } from '../../../queries/shopListing';
import { userMeQueryOptions } from '../../../queries/user';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { useSnackbar } from 'notistack';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/listing/import/file')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_SHOP_LISTINGS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

const MAX_FILE_SIZE = 2500000; // 25MB
const ACCEPTED_IMAGE_TYPES = ['application/json'];
const validationSchema = z.object({
  replace: z.boolean().optional(),
  shopListings: z
    .any()
    .refine((files) => files?.length == 1, 'File is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
    .refine((files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), 'Only json files are accepted.'),
});

type FormFields = {
  shopListings: FileList;
  replace: boolean;
};

function Component() {
  const formId = 'import-shoplistings-file-form';
  const [open, setOpen] = useState<boolean>(true);
  const { mutate, error } = useShopListingImport();
  const { gameServerId } = Route.useParams();
  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit, formState } = useForm<FormFields>({
    resolver: zodResolver(validationSchema),
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!open) {
      history.go(-1);
    }
  }, [open]);

  const onSubmit: SubmitHandler<FormFields> = async ({ shopListings, replace }) => {
    const parsedShopListings: ShopListingOutputDTO[] = JSON.parse(await shopListings[0].text());
    try {
      mutate({ replace, shopListings: parsedShopListings, gameServerId });
      setOpen(false);
    } catch {
      enqueueSnackbar({ variant: 'default', type: 'error', message: 'Failed to import shoplistings!' });
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} promptCloseConfirmation={formState.isDirty}>
      <Drawer.Content>
        <Drawer.Heading>Import Shop Listings</Drawer.Heading>
        <Drawer.Body>
          <form onSubmit={handleSubmit(onSubmit)} id={formId}>
            <FileField
              required
              name="shopListings"
              description="JSON array with objects of type ShopListingOutputDTO"
              placeholder="shopListings.json"
              control={control}
              label="Shop Listings"
            />
            <Switch
              label="Replace shop listings"
              name="replace"
              control={control}
              required={false}
              description="Remove existing shop listings and replace with selected listings. If false the shop listings are appended."
            />
            {error && <FormError error={error} />}
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
}
