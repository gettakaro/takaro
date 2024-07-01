import { FC, Fragment } from 'react';
import { shopListingInfiniteQueryOptions } from 'queries/shopListing';
import { useHasPermission } from 'hooks/useHasPermission';
import { useInfiniteQuery } from '@tanstack/react-query';
import { CardList } from 'components/cards';
import { ShopListingCard } from 'components/cards/ShopListingCard';

import { AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { Card, Chip, Button, Empty, EmptyPage, InfiniteScroll, styled } from '@takaro/lib-components';
import { useNavigate } from '@tanstack/react-router';
import { GameServerOutputDTOTypeEnum } from '@takaro/apiclient';
import { CardBody } from 'components/cards/ShopListingCard/style';

const Header = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing['2']};
  gap: ${({ theme }) => theme.spacing['2']};

  strong {
    font-size: ${({ theme }) => theme.fontSize['medium']};
    margin-right: ${({ theme }) => theme.spacing['0_5']};
  }
`;

const AddCardBody = styled(CardBody)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

interface ShopCardViewProps {
  gameServerId: string;
  gameServerType: GameServerOutputDTOTypeEnum;
  currencyName: string;
  currency?: number;
}

export const ShopCardView: FC<ShopCardViewProps> = ({ gameServerId, currency, currencyName, gameServerType }) => {
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
    shopListingInfiniteQueryOptions({ extend: ['item'], filters: { gameServerId: [gameServerId] } })
  );

  if (
    !shopListings ||
    !shopListings.pages ||
    shopListings.pages.length === 0 ||
    shopListings.pages[0].data.length === 0
  ) {
    return (
      <EmptyPage>
        <Empty
          header="No shop listings"
          description="Create a shop listing to start selling items."
          actions={[<Button onClick={onCreateShopListingClicked} text="Create shop listing" />]}
        />
      </EmptyPage>
    );
  }

  return (
    <Fragment>
      <Header>
        {currency !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Chip variant="outline" color="primary" label={`${currency} ${currencyName}`} />
          </div>
        )}
      </Header>
      <CardList>
        {shopListings.pages.map((page) =>
          page.data.map((shopListing) => (
            <ShopListingCard
              key={shopListing.id}
              currencyName={currencyName}
              currency={currency || 0}
              shopListing={shopListing}
              gameServerId={gameServerId}
              gameServerType={gameServerType}
            />
          ))
        )}
        {hasPermission && (
          <Card role="link" onClick={onCreateShopListingClicked} variant="outline">
            <AddCardBody>
              <PlusIcon size={24} />
              <h3>new shop listing</h3>
            </AddCardBody>
          </Card>
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
