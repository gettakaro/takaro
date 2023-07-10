import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { styled, getInitials, BreadCrumbs, Dropdown } from '@takaro/lib-components';
import { useUser } from 'hooks/useUser';
import { useAuth } from 'hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { AiOutlineUser as ProfileIcon, AiOutlineLogout as LogoutIcon } from 'react-icons/ai';

const Container = styled.header`
  height: 80px;
  padding: ${({ theme }) => {
    return `0 ${theme.spacing[7]}`;
  }};
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
`;

const InitialsBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  margin-right: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  color: white;
  font-weight: 800;
  text-transform: uppercase;
`;

const User = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
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
    color: ${({ theme }) => theme.colors.secondary};
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
    text-transform: capitalize;
  }
  p {
    opacity: 0.5;
  }
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  h2 {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
    font-size: ${({ theme }) => theme.fontSize.large};
    text-transform: capitalize;
  }
`;

interface HeaderProps {
  isLoading?: boolean;
  idToNameMap?: Record<string, string>;
}

export const Header: FC<HeaderProps> = ({ isLoading, idToNameMap }) => {
  const { userData } = useUser();
  const { logOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Container>
      <Left>
        <h2>{location.pathname.split('/')[1] || 'dashboard'}</h2>
        {!isLoading && <BreadCrumbs idToNameMap={idToNameMap} />}
      </Left>
      <Dropdown>
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
