import { FC, cloneElement, ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import { darken } from 'polished';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Company, styled } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { AiOutlineLink as ExternalLinkIcon } from 'react-icons/ai';
import { GameServerSelectNav } from './GameServerSelectNav';

const Container = styled(motion.div)`
  width: 0;
  position: relative;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing[8]};
  border-right: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => `${theme.spacing[4]} ${theme.spacing[1]}`};

  .company-icon {
    margin-left: ${({ theme }) => theme.spacing['1_5']};
    cursor: pointer;
  }

  img {
    display: block;
    width: 80px;
    height: auto;
    margin: 0 auto;
    margin-bottom: 20px;
    cursor: pointer;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  width: 100%;
  flex-direction: column;

  a {
    width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    padding: ${({ theme }) => theme.spacing['1_5']};
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: 0.2s transform ease-in-out;
    font-weight: 500;

    span {
      display: flex;
      align-items: center;
    }

    &:hover {
      background-color: ${({ theme }) => theme.colors.background};
    }

    p {
      margin: ${({ theme }) => `0 ${theme.spacing['4']} 0 ${theme.spacing[1]}`};
    }

    svg {
      fill: ${({ theme }) => theme.colors.textAlt};
    }

    &.active {
      background-color: ${({ theme }) => theme.colors.primary};

      &:hover {
        background-color: ${({ theme }) => darken(0.05, theme.colors.primary)};
      }

      svg,
      p {
        fill: white;
        color: white;
      }
    }
  }
`;

export interface NavbarLink {
  path: string;
  label: string;
  icon: ReactElement;
  external?: boolean;
}

interface NavbarProps {
  links: NavbarLink[];
  gameServerNav?: boolean;
}

export const Navbar: FC<NavbarProps> = ({ links, gameServerNav = false }) => {
  return (
    <Container
      animate={{ width: 325 }}
      transition={{ duration: 1, type: 'spring', bounce: 0.5 }}
    >
      <Link className="company-icon" to={PATHS.home()}>
        <Company />
      </Link>

      {gameServerNav && <GameServerSelectNav />}

      <Nav>
        {links.map(({ path, label, icon, external = false }) =>
          external ? (
            <a key={path} target="_blank" rel="noopener noreferrer" href={path}>
              <span>
                {cloneElement(icon, { size: 20 })}
                <p>{label}</p>
              </span>
              <ExternalLinkIcon size={16} />
            </a>
          ) : (
            <NavLink to={path} key={path} end>
              <span>
                {cloneElement(icon, { size: 20 })}
                <p>{label}</p>
              </span>
            </NavLink>
          )
        )}
      </Nav>
    </Container>
  );
};
