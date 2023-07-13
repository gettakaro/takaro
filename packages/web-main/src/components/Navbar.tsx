import { FC, cloneElement, ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import { darken } from 'polished';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Company, styled, Dropdown, getInitials } from '@takaro/lib-components';
import { AiOutlineLink as ExternalLinkIcon } from 'react-icons/ai';
import { GameServerSelectNav } from './GameServerSelectNav';
import { useUser } from 'hooks/useUser';
import { useAuth } from 'hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { AiOutlineUser as ProfileIcon, AiOutlineLogout as LogoutIcon } from 'react-icons/ai';

const Container = styled(motion.div)`
  width: 0;
  position: relative;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing[4]} ${theme.spacing[1]}`};

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

const InitialsBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  margin-right: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colors.background};
  color: white;
  font-weight: 800;
  text-transform: uppercase;
`;

const User = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.background};
  padding-right: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  &:hover {
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const Name = styled.div`
  display: flex;
  flex-direction: column;
  h4 {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
    text-transform: capitalize;
  }
  p {
    opacity: 0.8;
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
  end?: boolean;
}

interface NavbarProps {
  links: NavbarLink[];
  gameServerNav?: boolean;
}

export const Navbar: FC<NavbarProps> = ({ links, gameServerNav = false }) => {
  const { userData } = useUser();
  const { logOut } = useAuth();
  const navigate = useNavigate();

  return (
    <Container animate={{ width: 325 }} transition={{ duration: 1, type: 'spring', bounce: 0.5 }}>
      <div style={{ width: '100%' }}>
        <Link className="company-icon" to={PATHS.home()}>
          <Company />
        </Link>

        {gameServerNav && <GameServerSelectNav />}

        <Nav>
          {links.map(({ path, label, icon, external = false, end = true }) =>
            external ? (
              <a key={path} target="_blank" rel="noopener noreferrer" href={path}>
                <span>
                  {cloneElement(icon, { size: 20 })}
                  <p>{label}</p>
                </span>
                <ExternalLinkIcon size={16} />
              </a>
            ) : (
              <NavLink to={path} key={path} end={end}>
                <span>
                  {cloneElement(icon, { size: 20 })}
                  <p>{label}</p>
                </span>
              </NavLink>
            )
          )}
        </Nav>
      </div>
      <Dropdown placement="top">
        <Dropdown.Trigger asChild>
          <User role="button">
            <InitialsBlock>{getInitials(userData.name ? userData.name : 'u u')}</InitialsBlock>
            <Name>
              <h4>{userData.name ? userData.name : 'unknown user'}</h4>
              <p>{userData.email ? userData.email : 'unknown email'}</p>
            </Name>
          </User>
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Item onClick={() => navigate(PATHS.login())} label="Profile" icon={<ProfileIcon />} />
          <Dropdown.Menu.Item onClick={async () => await logOut()} label="Logout" icon={<LogoutIcon />} />
        </Dropdown.Menu>
      </Dropdown>
    </Container>
  );
};
