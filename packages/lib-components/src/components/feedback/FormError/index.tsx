import { FC, useEffect, useRef } from 'react';
import { styled } from '../../../styled';

const Container = styled.div<{ hasMultiple: boolean }>`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  background-color: ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  p,
  li {
    color: ${({ theme }) => theme.colors.white};
    list-style: ${({ hasMultiple }) => (hasMultiple ? 'disc inside' : 'none')};
    display: list-item;

    &:first-letter {
      text-transform: uppercase;
    }
  }
`;

export interface FormErrorProps {
  /// Message for each type of error
  error?: string | string[] | null;
}

export const FormError: FC<FormErrorProps> = ({ error = 'Something went wrong.' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [containerRef]);

  if (error === null) {
    return 'Something went wrong.';
  }

  if (error.constructor === String) {
    error = [error];
  }

  return (
    <Container ref={containerRef} autoFocus hasMultiple={error.length > 1}>
      <ul>
        {(error as string[]).map((m, i) => (
          <li key={`form-error-message-${i}`}>{m}</li>
        ))}
      </ul>
    </Container>
  );
};
