import { styled } from '@takaro/lib-components';

export const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[1]};
  gap: ${({ theme }) => theme.spacing[4]};
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
