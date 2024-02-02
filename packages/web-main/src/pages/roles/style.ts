import { styled } from '@takaro/lib-components';

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const PermissionContainer = styled.div<{ hasCount: boolean }>`
  ${({ hasCount, theme }) => hasCount && `border: 1px solid ${theme.colors.backgroundAccent}`};
  padding: ${({ theme }) => ` ${theme.spacing[1]} ${theme.spacing[1]} ${theme.spacing[0]} ${theme.spacing[1]}`};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin-bottom: ${({ theme }) => theme.spacing[1]};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
