import { FC } from 'react';
import { styled } from '../../../styled';
import { BiGhost as GhostIcon } from 'react-icons/bi';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  h3 {
    font-size: 2rem;
    font-weight: 500;
  }
  p {
    margin-bottom: 1.5rem;
    font-size: 2rem;
  }
`;

export interface ErrorProps {
  message?: string;
  actionMessage?: string;
  actionTo?: string;
  showIcon?: boolean;
}

export const Error: FC<ErrorProps> = ({ message = 'Something went wrong.', showIcon = true }) => {
  return (
    <Container>
      {showIcon && <GhostIcon size={80} />}
      <h3>{message}</h3>
    </Container>
  );
};
