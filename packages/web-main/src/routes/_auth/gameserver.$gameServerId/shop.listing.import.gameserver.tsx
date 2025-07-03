import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Drawer, DrawerSkeleton, FormError, SelectQueryField, styled, Switch } from '@takaro/lib-components';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { GameServerSelectQueryField } from '../../../components/selects';
import { hasPermission } from '../../../hooks/useHasPermission';
import { gameServerQueryOptions } from '../../../queries/gameserver';
import { shopListingInfiniteQueryOptions, useShopListingImport } from '../../../queries/shopListing';
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

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/listing/import/gameserver')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_SHOP_LISTINGS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId));
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

const validationSchema = z.object({
  replaceShopListing: z.boolean().optional(),
  shopListingIds: z.array(z.string()).min(1),
  gameServerId: z.string().optional(),
});

function Component() {
  const formId = 'import-shoplistings-form';
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState<boolean>(true);
  const { control, watch, handleSubmit, reset, formState } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    mode: 'onSubmit',
  });
  const { mutate, error } = useShopListingImport();
  const { gameServerId } = Route.useParams();
  const gameServer = Route.useLoaderData();
  const selectedGameServerId = watch('gameServerId');

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery(
    shopListingInfiniteQueryOptions({
      filters: selectedGameServerId ? { gameServerId: [selectedGameServerId] } : {},
    }),
  );

  useEffect(() => {
    const { unsubscribe } = watch((_, { name }) => {
      if (name === 'gameServerId') {
        reset({ shopListingIds: [] });
      }
    });
    return () => unsubscribe();
  }, [watch]);

  const shopListings = data?.pages.flatMap((page) => page.data) ?? [];

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ shopListingIds, replaceShopListing }) => {
    const selectedShopListings = shopListings.filter((shopListing) => shopListingIds.includes(shopListing.id));
    try {
      mutate({ gameServerId, shopListings: selectedShopListings, replace: replaceShopListing });
      setOpen(false);
    } catch {
      enqueueSnackbar({ variant: 'default', type: 'error', message: 'Failed to import shoplistings!' });
    }
  };

  useEffect(() => {
    if (!open) {
      history.go(-1);
    }
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={setOpen} promptCloseConfirmation={formState.isDirty}>
      <Drawer.Content>
        <Drawer.Heading>Import Shop Listings</Drawer.Heading>
        <Drawer.Body>
          <form onSubmit={handleSubmit(onSubmit)} id={formId}>
            <GameServerSelectQueryField
              name="gameServerId"
              required={false}
              control={control}
              filters={{ type: [gameServer.type] }}
              description="Filter shopListings below by a specific gameserver"
            />
            <SelectQueryField
              required={true}
              label="Shop listings"
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isFetching={isFetching}
              fetchNextPage={fetchNextPage}
              name="shopListingIds"
              canClear
              description="Shoplistings that will be copied to this game server"
              control={control}
              multiple
              render={(selectedShopListings) => {
                if (selectedShopListings.length === 0) {
                  return <p>Select shop listing</p>;
                }
                return selectedShopListings.map((shopListing) => shopListing.label).join(', ');
              }}
            >
              <SelectQueryField.OptionGroup>
                {shopListings.map(({ name, id }) => (
                  <SelectQueryField.Option
                    key={`select-shopListingIds-${id}`}
                    value={id}
                    label={name ?? 'Shop listing'}
                  >
                    <span>{name}</span>
                  </SelectQueryField.Option>
                ))}
              </SelectQueryField.OptionGroup>
            </SelectQueryField>
            <Switch
              label="Replace shop listings"
              name="replaceShopListing"
              control={control}
              description="Remove existing shop listings and replace with selected listings. If false the shop listings are appended."
            />
            {error && <FormError error={error} />}
          </form>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button onClick={() => setOpen(false)} color="background" type="button">
              Cancel
            </Button>
            <Button type="submit" fullWidth form={formId}>
              Save changes
            </Button>
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
