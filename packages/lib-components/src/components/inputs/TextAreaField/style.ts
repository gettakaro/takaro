import { styled } from '../../../styled';

export const Container = styled.div`
  width: 100%;
  position: relative;

  p {
    margin-top: ${({ theme }) => theme.spacing['1']};
    color: ${({ theme }) => theme.colors.textAlt};
    white-space: pre-wrap;
    line-height: 1.5;
  }
`;

export const TextAreaContainer = styled.div``;

export const TextArea = styled.textarea<{ hasError: boolean }>`
  width: 100%;
  border: 0.1rem solid ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.backgroundAccent)};

  &:focus {
    border-color: ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.primary)};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textAlt};
  }
`;
