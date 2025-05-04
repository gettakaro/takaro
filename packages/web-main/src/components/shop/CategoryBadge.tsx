import { FC } from 'react';
import { styled, Chip } from '@takaro/lib-components';
import { ShopCategoryOutputDTO } from '@takaro/apiclient';

const Badge = styled(Chip)`
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

interface CategoryBadgeProps {
  category: ShopCategoryOutputDTO;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const CategoryBadge: FC<CategoryBadgeProps> = ({ category, onClick, size = 'small' }) => {
  // Abbreviate long category names
  const maxLength = size === 'small' ? 10 : size === 'medium' ? 15 : 20;
  const displayName = category.name.length > maxLength ? `${category.name.substring(0, maxLength)}...` : category.name;

  return <Badge label={`${category.emoji} ${displayName}`} color="primary" onClick={onClick} />;
};
