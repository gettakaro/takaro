import { FC } from 'react';
import { styled } from '../../../styled';

const Container = styled.div`
  margin: ${({ theme }) => `${theme.spacing['0_75']} 0`};
  text-align: center;
  p {
    color: ${({ theme }) => theme.colors.error};
  }
`;

export interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ message }) => {
  return (
    <Container>
      <p>{message}</p>
    </Container>
  );
};
