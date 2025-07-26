import { Avatar, Card, Chip, getInitials, Tooltip, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { Header, CardBody } from './style';
import { GameServerOutputDTOTypeEnum, ShopListingOutputDTO } from '@takaro/apiclient';
import { useHasPermission } from '../../../hooks/useHasPermission';
import { ShopListingActions } from '../../../routes/_auth/gameserver.$gameServerId/-components/shop/ShopListingActions';
import { ShopListingBuyForm } from '../../../routes/_auth/gameserver.$gameServerId/-components/shop/ShopListingBuyForm';
import { CategoryBadge } from '../../shop/CategoryBadge';

const gameServerTypeToIconFolderMap = {
  [GameServerOutputDTOTypeEnum.Mock]: 'rust',
  [GameServerOutputDTOTypeEnum.Rust]: 'rust',
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: '7d2d',
  [GameServerOutputDTOTypeEnum.Generic]: 'generic',
};

const StockDisplay = styled.div<{ $status: 'unlimited' | 'in-stock' | 'low-stock' | 'out-of-stock' }>`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0.5rem 0;
  color: ${({ theme, $status }) => {
    switch ($status) {
      case 'unlimited':
        return theme.colors.textAlt;
      case 'in-stock':
        return theme.colors.success;
      case 'low-stock':
        return theme.colors.warning;
      case 'out-of-stock':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  }};
`;

interface ShopListingCard {
  shopListing: ShopListingOutputDTO;
  currencyName: string;
  gameServerId: string;
  gameServerType: GameServerOutputDTOTypeEnum;
  playerCurrencyAmount: number;
  onCategoryClick?: (categoryId: string) => void;
}

export const ShopListingCard: FC<ShopListingCard> = ({
  currencyName,
  gameServerId,
  shopListing,
  gameServerType,
  playerCurrencyAmount,
  onCategoryClick,
}) => {
  const firstItem = shopListing.items[0]?.item || { name: 'Unknown', code: 'unknown' };
  const shopListingName = shopListing.name || firstItem.name;
  const hasPermission = useHasPermission(['MANAGE_SHOP_LISTINGS']);

  const getStockStatus = () => {
    if (!shopListing.stockEnabled) {
      return { status: 'unlimited' as const, text: 'Unlimited stock' };
    }
    const stock = shopListing.stock ?? 0;
    if (stock === 0) {
      return { status: 'out-of-stock' as const, text: 'Out of stock' };
    }
    if (stock <= 5) {
      return { status: 'low-stock' as const, text: `Low stock: ${stock} left` };
    }
    return { status: 'in-stock' as const, text: `In stock: ${stock}` };
  };

  const stockInfo = getStockStatus();

  return (
    <>
      <Card data-testid={`shoplisting-${shopListing.id}-card`}>
        <Card.Body>
          <CardBody>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Header hasMultipleChildren={shopListing.draft}>
                {hasPermission && shopListing.draft && <Chip color="primary" label="Draft" />}
                {hasPermission && (
                  <ShopListingActions
                    shopListingName={shopListingName}
                    shopListingId={shopListing.id}
                    gameServerId={gameServerId}
                  />
                )}
              </Header>
              <Avatar size="huge">
                <Avatar.Image
                  src={`/icons/${gameServerTypeToIconFolderMap[gameServerType]}/${firstItem.code}.png`}
                  alt={`Item icon of ${firstItem.name}`}
                />
                <Avatar.FallBack>{getInitials(shopListingName)}</Avatar.FallBack>
              </Avatar>
              <h2>{shopListingName}</h2>
              <StockDisplay $status={stockInfo.status}>{stockInfo.text}</StockDisplay>
              {shopListing.categories && shopListing.categories.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {shopListing.categories.map((category) => (
                    <CategoryBadge
                      key={category.id}
                      category={category}
                      onClick={onCategoryClick ? () => onCategoryClick(category.id) : undefined}
                    />
                  ))}
                </div>
              )}
              <div
                style={{ display: 'flex', flexWrap: 'wrap', textAlign: 'left', width: '100%', marginBottom: '1.5rem' }}
              >
                {shopListing.items.map((itemMeta) => {
                  return (
                    <Tooltip key={itemMeta.id}>
                      <Tooltip.Trigger>
                        <Avatar size="small">
                          <Avatar.Image
                            src={`/icons/${gameServerTypeToIconFolderMap[gameServerType]}/${itemMeta.item.code}.png`}
                            alt={`Item icon of ${itemMeta.item.name}`}
                          />
                          <Avatar.FallBack>{getInitials(shopListingName)}</Avatar.FallBack>
                        </Avatar>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        {itemMeta.amount} of {itemMeta.item.name}
                        {itemMeta.quality && itemMeta.quality !== '0' ? `, quality: ${itemMeta.quality}` : ''}
                      </Tooltip.Content>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
            <ShopListingBuyForm
              isDraft={shopListing.draft}
              currencyName={currencyName}
              shopListingId={shopListing.id}
              playerCurrencyAmount={playerCurrencyAmount}
              price={shopListing.price}
              stock={shopListing.stock}
              stockEnabled={shopListing.stockEnabled}
            />
          </CardBody>{' '}
        </Card.Body>
      </Card>
    </>
  );
};
