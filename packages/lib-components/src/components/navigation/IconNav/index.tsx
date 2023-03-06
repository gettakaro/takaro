import { FC, cloneElement } from 'react';
import { styled } from '../../../styled';
import { Link } from 'react-router-dom';
import { lighten } from 'polished';
import { FloatingDelayGroup } from '@floating-ui/react';
import { Tooltip } from '../../../components';

const Container = styled.nav`
  min-width: 6rem;
  background-color: ${({ theme }) => theme.colors.white};
  height: 100vh;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid ${({ theme }) => theme.colors.background};
  a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 5rem;
    &:hover {
      background-color: ${({ theme }) => lighten(0.3, theme.colors.primary)};
    }
  }
`;

export interface IconNavProps {
  items: { icon: JSX.Element; to: string; title: string }[];
}

export const IconNav: FC<IconNavProps> = ({ items }) => {
  // TODO: add tooltip with floating ui (after merge)
  return (
    <Container>
      <FloatingDelayGroup delay={{ open: 2000, close: 200 }}>
        {items.map(({ to, icon, title }) => (
          <Tooltip label={title} placement="right">
            <Link key={`icon-nav-${title}`} to={to}>
              {cloneElement(icon, { size: 25 })}
            </Link>
          </Tooltip>
        ))}
      </FloatingDelayGroup>
    </Container>
  );
};
