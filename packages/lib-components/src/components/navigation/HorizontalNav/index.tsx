import { FC, ReactNode } from 'react';
import { NavBar } from './style';

export type HorizontalNavVariant = 'underline' | 'block' | 'clear';

export interface HorizontalNavProps {
  children: ReactNode;
  variant: HorizontalNavVariant;
}

export const HorizontalNav: FC<HorizontalNavProps> = ({ children, variant }) => {
  return <NavBar variant={variant}>{children}</NavBar>;
};
