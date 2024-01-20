import { styled } from '../../../styled';

export const Container = styled.div``;

export const DurationContainer = styled.div<{ hasError: boolean }>`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing['0_75']};
  width: 100%;
  border: 1px solid ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.backgroundAccent)};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  display: flex;
  align-items: center;
`;

export const InnerContent = styled.div`
  padding: ${({ theme }) => theme.spacing['0_75']};
`;

export const FieldContainer = styled.div`
  display: grid;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
  grid-template-columns: 50px 200px 30px 30px;
`;
