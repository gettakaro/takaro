import { Avatar, Card, Chip, getInitials, Tooltip } from '@takaro/lib-components';
import { FC } from 'react';
import { Header, CardBody } from './style';
import { GameServerOutputDTOTypeEnum, ShopListingOutputDTO } from '@takaro/apiclient';
import { useHasPermission } from 'hooks/useHasPermission';
import { ShopListingActions } from 'routes/_auth/gameserver.$gameServerId/-components/shop/ShopListingActions';
import { ShopListingBuyForm } from 'routes/_auth/gameserver.$gameServerId/-components/shop/ShopListingBuyForm';

const gameServerTypeToIconFolderMap = {
  [GameServerOutputDTOTypeEnum.Mock]: 'rust',
  [GameServerOutputDTOTypeEnum.Rust]: 'rust',
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: '7d2d',
};

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
  const shopListingName = shopListing.name || shopListing.items[0].item.name;
  const hasPermission = useHasPermission(['MANAGE_SHOP_LISTINGS']);

  return (
    <>
      <Card>
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
                src={`/icons/${gameServerTypeToIconFolderMap[gameServerType]}/${shopListing.items[0].item.code}.png`}
                alt={`Item icon of ${shopListing.items[0].item.name}`}
              />
              <Avatar.FallBack>{getInitials(shopListingName)}</Avatar.FallBack>
            </Avatar>
            <h2>{shopListingName}</h2>
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
        </CardBody>
      </Card>
    </>
  );
};
