import { FC, Fragment } from 'react';
import { shopListingInfiniteQueryOptions } from '../../queries/shopListing';
import { useHasPermission } from '../../hooks/useHasPermission';
import { useInfiniteQuery } from '@tanstack/react-query';
import { CardList } from '../../components/cards';
import { ShopListingCard } from '../../components/cards/ShopListingCard';

import { Button, Empty, EmptyPage, InfiniteScroll } from '@takaro/lib-components';
import { useNavigate } from '@tanstack/react-router';
import { ShopViewProps } from './ShopView';
import { ShopListingSearchInputDTO } from '@takaro/apiclient';

export const ShopCardView: FC<ShopViewProps> = ({
  gameServerId,
  currency,
  currencyName,
  gameServerType,
  selectedCategories = [],
  showUncategorized = false,
  onCategoryClick,
}) => {
  const hasPermission = useHasPermission(['MANAGE_SHOP_LISTINGS']);
  const navigate = useNavigate();

  const onCreateShopListingClicked = () => {
    navigate({ to: '/gameserver/$gameServerId/shop/listing/create', params: { gameServerId } });
  };

  // Build query filters based on selected categories
  const queryFilters: ShopListingSearchInputDTO = {
    filters: {
      gameServerId: [gameServerId],
      ...(selectedCategories.length > 0 && { categoryIds: selectedCategories }),
      ...(showUncategorized && { uncategorized: true }),
    },
    sortBy: 'draft',
    sortDirection: 'desc',
  };

  const {
    data: shopListings,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(shopListingInfiniteQueryOptions(queryFilters));

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
              <Button key="shop-listing-empty" onClick={onCreateShopListingClicked}>
                Create shop listing
              </Button>,
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
              onCategoryClick={onCategoryClick}
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
