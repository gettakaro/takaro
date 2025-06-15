import { FC } from 'react';
import { Avatar, getInitials } from '@takaro/lib-components';
import { GameServerOutputDTOTypeEnum } from '@takaro/apiclient';
import { getItemIconSrc } from '../../utils/itemIconUtils';

interface ItemIconProps {
  itemIcon?: string;
  itemName: string;
  itemCode: string;
  gameServerType: GameServerOutputDTOTypeEnum;
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'huge';
}

export const ItemIcon: FC<ItemIconProps> = ({ itemIcon, itemName, itemCode, gameServerType, size = 'small' }) => {
  return (
    <Avatar size={size}>
      <Avatar.Image src={getItemIconSrc(itemIcon, gameServerType, itemCode)} alt={`Item icon of ${itemName}`} />
      <Avatar.FallBack>{getInitials(itemName)}</Avatar.FallBack>
    </Avatar>
  );
};
