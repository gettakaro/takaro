import { Dropdown, styled, getInitials } from '@takaro/lib-components';
import { useAuth } from 'hooks/useAuth';
import {
  AiOutlineUser as ProfileIcon,
  AiOutlineLogout as LogoutIcon,
  AiOutlineDown as ArrowDownIcon,
} from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';

const User = styled.div`
  display: grid;
  grid-template-columns: 4.5rem 1fr 1rem;
  cursor: pointer;
  align-items: center;
  width: 100%;
  gap: ${({ theme }) => theme.spacing['0_75']};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  padding-right: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  &:hover {
    border-color: ${({ theme }) => theme.colors.backgroundAccent};
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

const Name = styled.div`
  display: flex;
  flex-direction: column;
  h4 {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing['0_25']};
    text-transform: capitalize;
  }
  p {
    opacity: 0.8;
  }
`;

export const UserDropdown = () => {
  const { isLoadingSession, session, isSessionError } = useAuth();
  const { logOut } = useAuth();
  const navigate = useNavigate();

  // TODO: handle error case
  if (!session || isSessionError) return <></>;

  // TODO: add a loading block
  if (isLoadingSession) return <></>;

  const { name, email } = session;

  return (
    <Dropdown placement="top">
      <Dropdown.Trigger asChild>
        <User role="button">
          <InitialsBlock>{getInitials(name ? name : 'u u')}</InitialsBlock>
          <Name>
            <h4>{name ? name : 'unknown user'}</h4>
            <p>{email ? email : 'unknown email'}</p>
          </Name>
          <ArrowDownIcon />
        </User>
      </Dropdown.Trigger>
      <Dropdown.Menu>
        <Dropdown.Menu.Item onClick={() => navigate(PATHS.auth.profile())} label="Profile" icon={<ProfileIcon />} />
        <Dropdown.Menu.Item onClick={async () => await logOut()} label="Logout" icon={<LogoutIcon />} />
      </Dropdown.Menu>
    </Dropdown>
  );
};
