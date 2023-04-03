import { FC } from 'react';
import { styled } from '../../../styled';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const NavBar = styled.nav`
  display: flex;
  position: relative;
  flex-direction: row;
  gap: 1rem;
  width: 100%;
  padding-bottom: ${({ theme }) => theme.spacing[1]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAlt};

  a {
    position: relative;
    padding: ${({ theme }) => theme.spacing['1']};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    &:hover {
      background-color: ${({ theme }) => theme.colors.backgroundAlt};
    }
  }
`;

export const Underline = styled(motion.div)`
  position: absolute;
  bottom: -${({ theme }) => theme.spacing[1]};
  left: 0px;
  display: block;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.primary};
  content: '';
  width: 100%;
`;

interface NavLink {
  to: string;
  text: string;
}

export interface HorizontalNavProps {
  items: NavLink[];
}

export const HorizontalNav: FC<HorizontalNavProps> = ({ items }) => {
  return (
    <NavBar>
      {items.map(({ to, text }) => (
        <NavLink key={to} to={to}>
          {({ isActive }) => (
            <>
              {text}
              {isActive && <Underline layoutId="underline" />}
            </>
          )}
        </NavLink>
      ))}
    </NavBar>
  );
};
