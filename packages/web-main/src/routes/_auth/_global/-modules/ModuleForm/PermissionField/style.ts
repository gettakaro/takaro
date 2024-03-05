import { styled } from '@takaro/lib-components';

export const PermissionCard = styled.li`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const Title = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing['0_5']};

  .inner {
    display: flex;
    gap: ${({ theme }) => theme.spacing['0_5']};
  }
`;

export const Fields = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;
