import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { styled, BreadCrumbs } from '@takaro/lib-components';

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
  const location = useLocation();

  return (
    <Container>
      <Left>
        <h2>{location.pathname.split('/')[1] || 'dashboard'}</h2>
        {!isLoading && <BreadCrumbs idToNameMap={idToNameMap} />}
      </Left>
    </Container>
  );
};
