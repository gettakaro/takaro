import { FC, Fragment } from 'react';
import { Link, LinkProps } from '@tanstack/react-router';
import { NavBar } from './style';

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
        const baseKey = JSON.stringify(to + params);
        return (
          <Link
            key={`${baseKey}-link`}
            to={to}
            params={{ params }}
            activeOptions={{ exact: true }}
            activeProps={{ className: 'active' }}
          >
            <Fragment key={`${baseKey}-container`}>
              <span key={`${baseKey}-text`}>{text}</span>
            </Fragment>
          </Link>
        );
      })}
    </NavBar>
  );
};
