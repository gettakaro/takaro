import { FC, cloneElement, ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Company, styled, Tooltip } from '@takaro/lib-components';
import { GameServerSelectNav } from '../GameServerSelectNav';
import { UserDropdown } from './UserDropdown';
import { PATHS } from 'paths';

import { AiOutlineBook as DocumentationIcon, AiOutlineGithub as GithubIcon } from 'react-icons/ai';
import { FaDiscord as DiscordIcon } from 'react-icons/fa';

const Container = styled(motion.div)`
  width: 0;
  position: relative;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing[4]} ${theme.spacing[1]} ${theme.spacing['1_5']} ${theme.spacing[1]}`};

  .company-icon {
    margin: 0 auto;
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
  margin-top: ${({ theme }) => theme.spacing[8]};

  a {
    width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['1']}`};
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: 0.2s transform ease-in-out;
    font-weight: 500;
    white-space: nowrap;

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
      svg {
        fill: ${({ theme }) => theme.colors.primary};
      }
      p {
        color: white;
      }
    }
  }
`;

const IconNav = styled.nav`
  display: flex;
  flex-direction: row;
  margin-top: ${({ theme }) => theme.spacing['1']};
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[1]};

  a {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export interface NavbarLink {
  path: string;
  label: string;
  icon: ReactElement;
  end?: boolean;
}

interface NavbarProps {
  links: NavbarLink[];
  gameServerNav?: boolean;
}

export const Navbar: FC<NavbarProps> = ({ links, gameServerNav = false }) => {
  const renderLink = ({ path, icon, label, end }: NavbarLink) => (
    <div>
      <NavLink to={path} key={path} end={end}>
        <span>
          {cloneElement(icon, { size: 20 })}
          <p>{label}</p>
        </span>
      </NavLink>
    </div>
  );

  return (
    <Container animate={{ width: 325 }} transition={{ duration: 1, type: 'spring', bounce: 0.5 }}>
      <div style={{ width: '100%' }}>
        <Link className="company-icon" to={PATHS.home()}>
          <Company />
        </Link>
        {gameServerNav && <GameServerSelectNav />}
        <Nav>{links.map((link) => renderLink(link))}</Nav>
      </div>
      <div style={{ width: '100%' }}>
        <UserDropdown />
        <IconNav>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <a href="https://github.com/gettakaro/takaro" target="_blank" rel="noreferrer">
                <GithubIcon size={18} />
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content>Github</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <a href="https://docs.takaro.io" target="_blank" rel="noreferrer">
                <DocumentationIcon size={18} />
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content>Documentation</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <a href="https://catalysm.net/discord/" target="_blank" rel="noreferrer">
                <DiscordIcon size={18} />
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content>Discord</Tooltip.Content>
          </Tooltip>
        </IconNav>
      </div>
    </Container>
  );
};
