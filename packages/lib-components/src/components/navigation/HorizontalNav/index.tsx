import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { Block, NavBar, Underline } from './style';

export type HorizontalNavVariant = 'underline' | 'block';

export interface HorizontalNavLink {
  to: string;
  text: string;
}

export interface HorizontalNavProps {
  items: HorizontalNavLink[];
  variant: HorizontalNavVariant;
}

export const HorizontalNav: FC<HorizontalNavProps> = ({ items, variant }) => {
  return (
    <NavBar variant={variant}>
      {items.map(({ to, text }) => (
        <NavLink key={to} to={to}>
          {({ isActive }) => (
            <>
              {isActive && variant === 'block' && <Block layoutId="block" />}
              {isActive && variant === 'underline' && <Underline layoutId="underline" />}
              <span>{text}</span>
            </>
          )}
        </NavLink>
      ))}
    </NavBar>
  );
};
