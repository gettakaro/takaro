import { Button, EmptyPage, InfiniteScroll } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { CardList } from 'components/cards';
import { ShopListingCard } from 'components/cards/ShopListingCard';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { shopListingInfiniteQueryOptions } from 'queries/shopListing';
import { Fragment } from 'react/jsx-runtime';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/')({
  loader: async ({ context, params }) => {
    const [currencyName, shopListings] = await Promise.all([
      context.queryClient.ensureQueryData(gameServerSettingQueryOptions('currencyName', params.gameServerId)),
      context.queryClient.ensureQueryData(shopListingInfiniteQueryOptions()),
    ]);

    return {
      currencyName: currencyName.value,
      shopListings,
    };
  },
  component: Component,
});

function Component() {
  const { gameServerId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const onCreateItemClicked = () => {
    navigate({ to: '/gameserver/$gameServerId/shop/listing/create', params: { gameServerId } });
  };

  const {
    data: shopListings,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...shopListingInfiniteQueryOptions(),
    initialData: loaderData.shopListings,
  });

  if (!shopListings || shopListings.pages.length === 0) {
    return <EmptyPage>no shop listings</EmptyPage>;
  }

  return (
    <Fragment>
      <Button onClick={onCreateItemClicked} text="Create shop listing" />
      <CardList>
        {shopListings.pages.map((page) =>
          page.data.map((shopListing) => (
            <ShopListingCard
              key={shopListing.id}
              currencyName={loaderData.currencyName}
              name={shopListing.name}
              price={shopListing.price}
            />
          ))
        )}
        <ShopListingCard name="Test Item" price={100} currencyName={loaderData.currencyName} />
      </CardList>
      <InfiniteScroll
        isFetching={isFetching}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </Fragment>
  );
}
