import { FC, useState, createRef } from 'react';
import { useLocation } from 'react-router-dom';
import { styled, getInitials, useOutsideAlerter } from '@takaro/lib-components';
import { useUser } from 'hooks/useUser';
import { UserDropDown } from './UserDropdown';

const Container = styled.header`
  height: 80px;
  padding: 0 5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  h2 {
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: capitalize;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSize.mediumLarge};

    svg {
      margin-right: 2rem;
    }
  }
`;

const User = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const InitialsBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  margin-right: 0.5rem;
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-weight: 800;
  text-transform: uppercase;
`;

const Name = styled.div`
  display: flex;
  flex-direction: column;
  h4 {
    color: ${({ theme }) => theme.colors.secondary};
    font-weight: 600;
    margin-bottom: 5px;
    text-transform: capitalize;
  }
  p {
    opacity: 0.5;
  }
`;

export const Header: FC = () => {
  const { userData } = useUser();
  const location = useLocation();
  const containerRef = createRef<HTMLDivElement>();
  const [showUserDropDown, setUserDropDownVisibility] = useState(false);
  useOutsideAlerter(containerRef, (): void => {
    setUserDropDownVisibility(false);
  });
  return (
    <Container>
      <h2>{location.pathname.split('/')[1] || 'dashboard'}</h2>
      <User
        onClick={() => setUserDropDownVisibility(!showUserDropDown)}
        ref={containerRef}
      >
        <InitialsBlock>
          {getInitials(userData.name ? userData.name : 'u u')}
        </InitialsBlock>
        <Name>
          <h4>{userData.name ? userData.name : 'unknown user'}</h4>
          <p>{userData.email ? userData.email : 'unknown email'}</p>
        </Name>
        {showUserDropDown && <UserDropDown />}
      </User>
    </Container>
  );
};
