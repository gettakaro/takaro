import { Divider } from '../../components';
import { FC } from 'react';
import { styled } from '../../styled';

interface TileProps {
  game: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  -moz-box-pack: end;
  justify-content: space-between;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  border: 2px solid rgba(0, 0, 0, 0);
  box-shadow: rgba(3, 27, 78, 0.15) 0 6px 20px -5px;
  background-color: #ffffff;
  outline: currentColor none medium;
  cursor: pointer;
  font-family: unset;
  font-size: unset;
  padding: 2rem 2.5rem 2rem 2.5rem;
  min-width: 265px;
  height: 196px;
  transition: all 0.25 cubic-bezier(0.645, 0.045, 0.355, 1) 0s;

  img {
    width: 50px;
    height: 50px;
  }

  &:hover {
    &::after {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }
`;

export const Tile: FC<TileProps> = ({ game }) => {
  return (
    <Container>
      {/* <img alt={`${game} logo`} src={`images/${game.replaceAll(' ', '-')}/logo.png`} /> */}
      <h3>{game}</h3>
      <div>
        <Divider spacing="small" />
        <p>
          From <strong>€5/month</strong>
        </p>
      </div>
    </Container>
  );
};
