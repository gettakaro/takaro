import { styled } from '../../../styled';

export const Container = styled.div``;

export const DurationContainer = styled.div<{ hasError: boolean; disabled: boolean; readOnly: boolean }>`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing['0_75']};
  width: 100%;
  border: 1px solid ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.backgroundAccent)};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  display: flex;
  align-items: center;
  cursor: ${({ disabled, readOnly }) => (disabled || readOnly ? 'default' : 'pointer')};
`;

export const InnerContent = styled.div`
  padding: ${({ theme }) => theme.spacing['0_75']};

  h2 {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }
`;

export const FieldContainer = styled.div<{ hasMultipleFields: boolean }>`
  display: grid;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_75']};
  grid-template-columns: 120px 200px 30px ${({ hasMultipleFields }) => (hasMultipleFields ? '30px' : '0px')};
  margin-bottom: ${({ theme }) => theme.spacing['1']};

  div {
    margin-bottom: 0;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;
