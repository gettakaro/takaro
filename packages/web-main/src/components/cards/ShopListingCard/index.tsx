import { Avatar, Card, Chip, getInitials, Tooltip, Button } from '@takaro/lib-components';
import { FC, useState, useCallback } from 'react';
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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [iconError, setIconError] = useState(false);

  const handleIconError = useCallback(() => {
    setIconError(true);
  }, []);

  const defaultIconPath = `/icons/${gameServerTypeToIconFolderMap[gameServerType]}/${firstItem.code}.png`;

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
                  src={shopListing.icon && !iconError ? shopListing.icon : defaultIconPath}
                  alt={`Icon of ${shopListingName}`}
                  onError={handleIconError}
                />
                <Avatar.FallBack>{getInitials(shopListingName)}</Avatar.FallBack>
              </Avatar>
              <h2>{shopListingName}</h2>
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
              {shopListing.description && (
                <div
                  style={{
                    width: '100%',
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    textAlign: 'left',
                    borderTop: '1px solid var(--color-backgroundAccent)',
                    borderBottom: '1px solid var(--color-backgroundAccent)',
                  }}
                >
                  <p style={{ margin: 0, wordBreak: 'break-word' }}>
                    {showFullDescription || shopListing.description.length <= 150
                      ? shopListing.description
                      : `${shopListing.description.substring(0, 150)}...`}
                  </p>
                  {shopListing.description.length > 150 && (
                    <Button size="tiny" variant="outline" onClick={() => setShowFullDescription(!showFullDescription)}>
                      {showFullDescription ? 'Show less' : 'Show more'}
                    </Button>
                  )}
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
            />
          </CardBody>{' '}
        </Card.Body>
      </Card>
    </>
  );
};
