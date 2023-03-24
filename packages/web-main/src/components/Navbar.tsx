import { FC, cloneElement, ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import { darken } from 'polished';
import { motion } from 'framer-motion';

import { Link } from 'react-router-dom';
import { AiOutlineBook as DocumentationIcon } from 'react-icons/ai';
import { Company, styled } from '@takaro/lib-components';
import { PATHS } from 'paths';

const Nav = styled.nav`
  display: flex;
  width: 100%;
  flex-direction: column;

  a {
    width: 100%;
    border-radius: 0.4rem;
    padding: 15px;
    display: flex;
    align-items: center;
    margin: 8px 0;
    color: ${({ theme }) => theme.colors.secondary};
    transition: 0.2s transform ease-in-out;

    &:hover {
      transform: translateY(-3px);
      background-color: ${({ theme }) => theme.colors.background};
    }

    p {
      margin-left: 10px;
    }

    svg {
      fill: ${({ theme }) => theme.colors.secondary};
    }

    &.active {
      background-color: ${({ theme }) => theme.colors.primary};
      p {
        font-weight: 800;
        display: flex;
        align-items: center;
      }

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

const Container = styled(motion.div)<{ toTop: boolean }>`
  width: 0;
  position: relative;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: ${({ toTop }) => (toTop ? 'flex-start' : 'center')};
  padding: 20px 30px 40px 30px;

  .company-icon {
    margin: 0 auto;
    padding: 3rem 0;
    cursor: pointer;
    margin-bottom: 11rem;
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

export interface NavbarLink {
  path: string;
  label: string;
  icon: ReactElement;
}

interface NavbarProps {
  links: NavbarLink[];
}

export const Navbar: FC<NavbarProps> = ({ links }) => {
  return (
    <Container
      toTop={true}
      animate={{ width: 325 }}
      transition={{ duration: 1, type: 'spring', bounce: 0.6 }}
    >
      <Link className="company-icon" to={PATHS.home()}>
        <Company />
      </Link>

      <Nav>
        {links.map(({ path, label, icon }) => (
          <NavLink to={path} key={path}>
            {cloneElement(icon, { size: 24 })}
            <p>{label}</p>
          </NavLink>
        ))}

        <a
          href="https://docs.takaro.io"
          rel="noopener noreferrer"
          target="_blank"
        >
          <DocumentationIcon size={24} />
          <p>Documentation</p>
        </a>
      </Nav>
    </Container>
  );
};
