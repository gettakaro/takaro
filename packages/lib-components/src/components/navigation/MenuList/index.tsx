import { FC, PropsWithChildren } from 'react';
import { styled } from '../../../styled';

export const MenuList: FC<PropsWithChildren> & { item: typeof MenuItem } = ({
  children,
}) => {
  return <ul>{children}</ul>;
};

const MenuItem = styled.li`
  padding: ${({ theme }) => theme.spacing['1']};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSize.medium};
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
`;

MenuList.item = MenuItem;
