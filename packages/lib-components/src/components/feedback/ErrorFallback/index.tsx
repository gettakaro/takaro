import { FC } from 'react';
import { styled } from '../../../styled';
import { shade } from 'polished';

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
  width: 100%;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing[2]};
  background-color: ${({ theme }) => shade(0.5, theme.colors.error)};
  text-align: center;

  h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${({ theme }) => theme.fontSize.mediumLarge};
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
    color: ${({ theme }) => theme.colors.text};

    svg {
      margin-right: ${({ theme }) => theme.spacing['0_75']};
    }
  }
`;

// This should be used as a fallback component for error boundaries.
export const ErrorFallback: FC = () => {
  return (
    <Wrapper>
      <Container>
        <h1>Oops, that's our bad!</h1>
        <p>We are not exactly sure what happened, but something went wrong. </p>
        <p>If you need immediate help, please let us know.</p>
      </Container>
    </Wrapper>
  );
};
