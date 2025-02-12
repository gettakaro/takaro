import { styled } from '@takaro/lib-components';

export const PermissionList = styled.ul`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-direction: column;
  align-items: center;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;
