import { FC, createRef } from 'react';
import { useLocation } from 'react-router-dom';
import { styled, getInitials, BreadCrumbs } from '@takaro/lib-components';
import { useUser } from 'hooks/useUser';

const Container = styled.header`
  height: 80px;
  padding: 0 5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
`;

const User = styled.div`
  display: flex;
  align-items: center;
`;

const InitialsBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  margin-right: 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
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

export const Header: FC = () => {
  const { userData } = useUser();
  const location = useLocation();
  const containerRef = createRef<HTMLDivElement>();

  return (
    <Container>
      <Left>
        <h2>{location.pathname.split('/')[1] || 'dashboard'}</h2>
        <BreadCrumbs />
      </Left>
      <User ref={containerRef}>
        <InitialsBlock>
          {getInitials(userData.name ? userData.name : 'u u')}
        </InitialsBlock>
        <Name>
          <h4>{userData.name ? userData.name : 'unknown user'}</h4>
          <p>{userData.email ? userData.email : 'unknown email'}</p>
        </Name>
      </User>
    </Container>
  );
};
