import { FC, useEffect, useRef } from 'react';

import { styled } from '../../../styled';

const Container = styled.div`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
  background-color: ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  p,
  li {
    color: ${({ theme }) => theme.colors.white};
  }
`;

export interface FormErrorProps {
  message: string | string[];
}

export const FormError: FC<FormErrorProps> = ({ message }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [containerRef, message]);

  return (
    <Container ref={containerRef} autoFocus>
      {typeof message === 'string' ? (
        <p>{message}</p>
      ) : (
        <ul>
          {message.map((m, i) => (
            <li key={`form-error-message-${i}`}>{m}</li>
          ))}
        </ul>
      )}
    </Container>
  );
};
