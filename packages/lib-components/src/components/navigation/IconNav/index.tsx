import { FC, cloneElement } from 'react';
import { styled } from '../../../styled';
import { Link } from 'react-router-dom';
import { lighten } from 'polished';

const Container = styled.nav`
  width: 6rem;
  background-color: ${({ theme }) => theme.colors.white};
  height: 100vh;
  padding: .5rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 5rem;
      &:hover {
        background-color: ${({ theme }) => lighten(0.3,theme.colors.primary)}
      }
  }
`;

export interface IconNavProps {
  items: { icon: JSX.Element, to: string, title: string }[]
}

export const IconNav: FC<IconNavProps> = ({ items }) => {
  // TODO: add tooltip with floating ui (after merge)
  return (
    <Container>
      { 
      items.map(({ to, icon, title }) => (
        <Link to={to}>
          { cloneElement(icon, { size: 25 })} 
        </Link>
      ))}
    </Container>
  );
};
