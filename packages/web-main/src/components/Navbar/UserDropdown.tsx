import { Dropdown, styled, getInitials, useThemeSwitcher } from '@takaro/lib-components';
import { useAuth } from '../../hooks/useAuth';
import {
  AiOutlineUser as ProfileIcon,
  AiOutlineLogout as LogoutIcon,
  AiOutlineDown as ArrowDownIcon,
  AiOutlineSun as LightThemeIcon,
  AiOutlineMoon as DarkThemeIcon,
} from 'react-icons/ai';
import { IoSwapHorizontal as SwitchDomainIcon } from 'react-icons/io5';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { userMeQueryOptions } from '../../queries/user';
import { setLastUsedDomainId } from '../../util/lastUsedDomain';

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
  border: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
  border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
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
  }
  p {
    opacity: 0.8;
  }
`;

export const UserDropdown = () => {
  const { logOut } = useAuth();
  const navigate = useNavigate();
  const { data, isPending } = useQuery(userMeQueryOptions());
  const { setTheme, theme } = useThemeSwitcher();

  const hasMultipleDomains = isPending === false && data && data.domains && data.domains.length > 1 ? true : false;

  if (!data) return <div>could not get user information</div>;

  const { name, email } = data.user;
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
        <Dropdown.Menu.Item
          onClick={() => navigate({ to: '/account/profile' })}
          label="Profile"
          icon={<ProfileIcon />}
        />
        <Dropdown.Menu.Item
          onClick={() => {
            // Save current domain as last used before switching
            if (data.domain) {
              setLastUsedDomainId(data.domain);
            }
            navigate({ to: '/domain/select' });
          }}
          label="Switch domain"
          disabled={!hasMultipleDomains}
          icon={<SwitchDomainIcon />}
        />
        <Dropdown.Menu.Item
          icon={theme === 'dark' ? <LightThemeIcon /> : <DarkThemeIcon />}
          onClick={() => {
            setTheme(theme === 'dark' ? 'light' : 'dark');
          }}
          label={`Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`}
        />
        <Dropdown.Menu.Item onClick={async () => await logOut()} label="Logout" icon={<LogoutIcon />} />
      </Dropdown.Menu>
    </Dropdown>
  );
};
