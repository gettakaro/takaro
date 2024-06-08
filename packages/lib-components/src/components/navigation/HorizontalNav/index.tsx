import { FC } from 'react';
import { Link, LinkProps } from '@tanstack/react-router';
import { Block, NavBar, Underline } from './style';

export type HorizontalNavVariant = 'underline' | 'block';

export type HorizontalNavLink = Partial<LinkProps> & {
  text: string;
  to: string;
  params?: Record<string, string>;
};

export interface HorizontalNavProps {
  links: HorizontalNavLink[];
  variant: HorizontalNavVariant;
}

export const HorizontalNav: FC<HorizontalNavProps> = ({ links, variant }) => {
  return (
    <NavBar variant={variant}>
      {links.map(({ text, to, params }) => {
        return (
          <Link to={to} params={{ params }}>
            {({ isActive }) => (
              <>
                {isActive && variant === 'block' && <Block layoutId="block" />}
                {isActive && variant === 'underline' && <Underline layoutId="underline" />}
                <span>{text}</span>
              </>
            )}
          </Link>
        );
      })}
    </NavBar>
  );
};
