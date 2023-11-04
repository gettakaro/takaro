import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { styled } from '@takaro/lib-components';

const Container = styled.header`
  height: 80px;
  padding: ${({ theme }) => {
    return `0 ${theme.spacing[7]}`;
  }};
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  text-transform: capitalize;
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

export const Header: FC<HeaderProps> = ({}) => {
  const location = useLocation();

  const pathArr = location.pathname.split('/');
  let serverName = pathArr.at(pathArr.length - 1);

  if (pathArr.at(pathArr.length - 2) === 'settings') {
    serverName = 'settings';
  }

  return (
    <Container>
      <Left>
        <h1>{serverName || 'dashboard'}</h1>
      </Left>
    </Container>
  );
};
