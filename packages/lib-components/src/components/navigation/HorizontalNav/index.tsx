import { FC } from 'react';
import { Link, LinkProps } from '@tanstack/react-router';
import { Block, NavBar, Underline } from './style';

export type HorizontalNavVariant = 'underline' | 'block';

export type HorizontalNavLink = Partial<LinkProps> & {
  text: string;
<<<<<<< HEAD
=======
  to: string;
  params?: Record<string, string>;
>>>>>>> origin/main
};

export interface HorizontalNavProps {
  links: HorizontalNavLink[];
  variant: HorizontalNavVariant;
}

export const HorizontalNav: FC<HorizontalNavProps> = ({ links, variant }) => {
  return (
    <NavBar variant={variant}>
<<<<<<< HEAD
      {links.map(({ text, ...rest }) => (
        <Link key={`${rest.to}-${text}`} {...rest}>
          {({ isActive }) => (
            <>
              {isActive && variant === 'block' && <Block layoutId="block" />}
              {isActive && variant === 'underline' && <Underline layoutId="underline" />}
              <span>{text}</span>
            </>
          )}
        </Link>
      ))}
=======
      {links.map(({ text, ...rest }) => {
        return (
          <>
            {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
            {/*@ts-ignore reusable link*/}
            <Link key={`${rest.to}-${text}`} {...rest}>
              {({ isActive }) => (
                <>
                  {isActive && variant === 'block' && <Block layoutId="block" />}
                  {isActive && variant === 'underline' && <Underline layoutId="underline" />}
                  <span>{text}</span>
                </>
              )}
            </Link>
          </>
        );
      })}
>>>>>>> origin/main
    </NavBar>
  );
};
