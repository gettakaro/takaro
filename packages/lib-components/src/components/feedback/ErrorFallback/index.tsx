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
    margin-bottom: ${({ theme }) => theme.spacing['1_5']};
    font-size: 2rem;
  }
`;

export interface ErrorFallbackProps {
  message?: string;
  showIcon?: boolean;
}

// This should be used as a fallback component for error boundaries.
export const ErrorFallback: FC<ErrorFallbackProps> = ({
  message = 'Something went wrong.',
  showIcon = true,
}) => {
  return (
    <Container>
      {showIcon && <GhostIcon size={80} />}
      <h3>{message}</h3>
    </Container>
  );
};
