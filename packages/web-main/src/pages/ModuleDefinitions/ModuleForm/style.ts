import { styled } from '@takaro/lib-components';

export const PermissionList = styled.ul`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-direction: column;
  align-items: center;
`;

export const PermissionCard = styled.li`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[1]};
  gap: ${({ theme }) => theme.spacing[4]};
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

export const Flex = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[1]};
  justify-content: space-between;
  /* first item takes available width*/
  & > *:first-child {
    flex-grow: 1;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;
