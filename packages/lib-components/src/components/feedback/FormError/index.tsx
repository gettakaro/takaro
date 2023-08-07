import { FC, useEffect, useRef } from 'react';

import { styled } from '../../../styled';
import axios from 'axios';

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

const extractConstraints = (detail: any) => {
  const constraints: any[] = [];

  if (detail.constraints) {
    constraints.push(...Object.values(detail.constraints));
  }

  if (Array.isArray(detail.children)) {
    for (const child of detail.children) {
      constraints.push(...extractConstraints(child));
    }
  }

  return constraints;
};

export interface FormErrorProps {
  message?: string | string[];
  error?: unknown;
}

export const FormError: FC<FormErrorProps> = ({ message, error }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [containerRef, message]);

  // If error provided and no custom message
  // Try to parse error message from error object
  if (error && !message) {
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.meta.error.message ?? error.response?.data?.meta.error.code;

      if (error.response?.data?.meta.error.code === 'ValidationError') {
        const details = error.response?.data?.meta.error.details;
        if (Array.isArray(details)) {
          // Map over details array and extract the constraints from each children recursively
          message = details.flatMap((detail) => extractConstraints(detail));
        }
      }
    }
  }

  if (!message) {
    message = ['Something went wrong'];
  }

  if (!Array.isArray(message)) {
    message = [message];
  }

  return (
    <Container ref={containerRef} autoFocus hasMultiple={message.length > 1}>
      <ul>
        {message.map((m, i) => (
          <li key={`form-error-message-${i}`}>{m}</li>
        ))}
      </ul>
    </Container>
  );
};
