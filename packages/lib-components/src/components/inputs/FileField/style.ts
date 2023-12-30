import { styled } from '../../../styled';

export const Container = styled.div`
  width: 100%;
  position: relative;
`;

export const InputContainer = styled.div``;

export const ContentContainer = styled.div<{ hasError: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  border: 1px solid ${({ theme, hasError }): string => (hasError ? theme.colors.error : theme.colors.backgroundAlt)};
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
  border-width: 0.1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: ${({ theme }) => theme.fontSize.small};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.textAlt};

  &:focus {
    border: 1px solid ${({ theme, hasError }): string => (hasError ? theme.colors.error : theme.colors.primary)};
  }

  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;
