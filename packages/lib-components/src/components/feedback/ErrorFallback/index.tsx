import { FC } from 'react';
import { styled } from '../../../styled';
import { AiOutlineCrown as ErrorIcon } from 'react-icons/ai';

const Wrapper = styled.div`
  display: grid;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 600px;
  align-items: center;
  text-align: center;
  p {
    margin-bottom: ${({ theme }) => theme.spacing['1_5']};
  }
`;

export interface ErrorFallbackProps {
  title?: string;
  description?: string;
  showIcon?: boolean;
}

// This should be used as a fallback component for error boundaries.
export const ErrorFallback: FC<ErrorFallbackProps> = ({
  title = 'Sorry king, we ran into an error!',
  description = 'But thank you for giving us extra work.',
  showIcon = true,
}) => {
  return (
    <Wrapper>
      <Container>
        {showIcon && <ErrorIcon size={80} />}
        <h2>{title}</h2>
        <p>{description}</p>
      </Container>
    </Wrapper>
  );
};
