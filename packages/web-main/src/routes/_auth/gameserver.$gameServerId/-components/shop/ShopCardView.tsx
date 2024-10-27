import { FC, Fragment } from 'react';
import { shopListingInfiniteQueryOptions } from 'queries/shopListing';
import { useHasPermission } from 'hooks/useHasPermission';
import { useInfiniteQuery } from '@tanstack/react-query';
import { CardList } from 'components/cards';
import { ShopListingCard } from 'components/cards/ShopListingCard';

import { Button, Empty, EmptyPage, InfiniteScroll } from '@takaro/lib-components';
import { useNavigate } from '@tanstack/react-router';
import { ShopViewProps } from './ShopView';

export const ShopCardView: FC<ShopViewProps> = ({ gameServerId, currency, currencyName, gameServerType }) => {
  const hasPermission = useHasPermission(['MANAGE_SHOP_LISTINGS']);
  const navigate = useNavigate();

  const onCreateShopListingClicked = () => {
    navigate({ to: '/gameserver/$gameServerId/shop/listing/create', params: { gameServerId } });
  };

  const {
    data: shopListings,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    shopListingInfiniteQueryOptions({
      filters: { gameServerId: [gameServerId] },
      sortBy: 'draft',
      sortDirection: 'desc',
    }),
  );

  if (
    !shopListings ||
    !shopListings.pages ||
    shopListings.pages.length === 0 ||
    shopListings.pages[0].data.length === 0
  ) {
    if (hasPermission) {
      return (
        <EmptyPage>
          <Empty
            header="No shop listings"
            description="Create a shop listing to start selling items."
            actions={[
              <Button key="shop-listing-empty" onClick={onCreateShopListingClicked} text="Create shop listing" />,
            ]}
          />
        </EmptyPage>
      );
    }
    return (
      <EmptyPage>
        <Empty header="No items in shop" description="" actions={[]} />
      </EmptyPage>
    );
  }

  return (
    <Fragment>
      <CardList>
        {shopListings.pages.map((page) =>
          page.data.map((shopListing) => (
            <ShopListingCard
              key={shopListing.id}
              currencyName={currencyName}
              playerCurrencyAmount={currency || 0}
              shopListing={shopListing}
              gameServerId={gameServerId}
              gameServerType={gameServerType}
            />
          )),
        )}
      </CardList>
      {shopListings && shopListings.pages && (
        <InfiniteScroll
          isFetching={isFetching}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
    </Fragment>
  );
};
