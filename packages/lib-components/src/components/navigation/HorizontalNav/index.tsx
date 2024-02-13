import { FC } from 'react';
import { Link, LinkProps } from '@tanstack/react-router';
import { Block, NavBar, Underline } from './style';

export type HorizontalNavVariant = 'underline' | 'block';

export type HorizontalNavLink = Partial<LinkProps> & {
  text: string;
};

export interface HorizontalNavProps {
  links: HorizontalNavLink[];
  variant: HorizontalNavVariant;
}

export const HorizontalNav: FC<HorizontalNavProps> = ({ links, variant }) => {
  return (
    <NavBar variant={variant}>
      {links.map(({ text, ...rest }) => (
        <Link {...rest}>
          {/* TODO: add link props back*/}
          {({ isActive }) => (
            <>
              {isActive && variant === 'block' && <Block layoutId="block" />}
              {isActive && variant === 'underline' && <Underline layoutId="underline" />}
              <span>{text}</span>
            </>
          )}
        </Link>
      ))}
    </NavBar>
  );
};
