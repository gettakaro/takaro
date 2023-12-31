import { styled } from '@takaro/lib-components';

export const StyledTest = styled.div`
  width: 100%;
  display: flex;
`;

export const ArgumentList = styled.ul`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-direction: column;
  align-items: center;
`;

export const ArgumentCard = styled.li`
  width: 100%;
  display: flex;
  align-items: center;
`;

export const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[1]};
  gap: ${({ theme }) => theme.spacing[4]};
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

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;
