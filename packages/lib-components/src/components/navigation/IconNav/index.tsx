import { FC, cloneElement } from 'react';
import { styled } from '../../../styled';
import { Link } from 'react-router-dom';
import { Tooltip } from '../../../components';

const Container = styled.nav`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid ${({ theme }) => theme.colors.background};
  a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: ${({ theme }) => theme.spacing[1]};
    border: 1px solid transparent;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryShade};
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

export interface IconNavProps {
  items: { icon: JSX.Element; to: string; title: string }[];
}

export const IconNav: FC<IconNavProps> = ({ items }) => {
  return (
    <Container>
      {items.map(({ to, icon, title }, index) => (
        <Tooltip placement="right" key={`icon-${title}-${index}`}>
          <Tooltip.Trigger asChild>
            <Link key={`icon-nav-${title}`} to={to}>
              {cloneElement(icon, { size: 24 })}
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Content>{title}</Tooltip.Content>
        </Tooltip>
      ))}
    </Container>
  );
};
