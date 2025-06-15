import { Card, Chip, Tooltip } from '@takaro/lib-components';
import { FC } from 'react';
import { Header, CardBody } from './style';
import { GameServerOutputDTOTypeEnum, ShopListingOutputDTO } from '@takaro/apiclient';
import { useHasPermission } from '../../../hooks/useHasPermission';
import { ShopListingActions } from '../../../routes/_auth/gameserver.$gameServerId/-components/shop/ShopListingActions';
import { ShopListingBuyForm } from '../../../routes/_auth/gameserver.$gameServerId/-components/shop/ShopListingBuyForm';
import { ItemIcon } from '../../ItemIcon';

interface ShopListingCard {
  shopListing: ShopListingOutputDTO;
  currencyName: string;
  gameServerId: string;
  gameServerType: GameServerOutputDTOTypeEnum;
  playerCurrencyAmount: number;
}

export const ShopListingCard: FC<ShopListingCard> = ({
  currencyName,
  gameServerId,
  shopListing,
  gameServerType,
  playerCurrencyAmount,
}) => {
  const firstItem = shopListing.items[0]?.item || { name: 'Unknown', code: 'unknown' };
  const shopListingName = shopListing.name || firstItem.name;
  const hasPermission = useHasPermission(['MANAGE_SHOP_LISTINGS']);

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
              <ItemIcon
                itemIcon={firstItem.icon}
                itemName={firstItem.name}
                itemCode={firstItem.code}
                gameServerType={gameServerType}
                size="huge"
              />
              <h2>{shopListingName}</h2>
              <div
                style={{ display: 'flex', flexWrap: 'wrap', textAlign: 'left', width: '100%', marginBottom: '1.5rem' }}
              >
                {shopListing.items.map((itemMeta) => {
                  return (
                    <Tooltip key={itemMeta.id}>
                      <Tooltip.Trigger>
                        <ItemIcon
                          itemIcon={itemMeta.item.icon}
                          itemName={itemMeta.item.name}
                          itemCode={itemMeta.item.code}
                          gameServerType={gameServerType}
                          size="small"
                        />
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
