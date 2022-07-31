import { FC } from 'react';
import { styled } from '../../../styled';

const Container = styled.div`
  margin: 1rem 0;
  text-align: center;
  p {
    color: ${({ theme }) => theme.colors.error};
  }
`;

export interface ErrorMessageProps {
  message?: string;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ message }) => {
  return message ? (
    <Container>
      <p>{message}</p>
    </Container>
  ) : null;
};
