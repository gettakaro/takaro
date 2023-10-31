import { styled } from '@takaro/lib-components';
import { FC, PropsWithChildren } from 'react';

const List = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing['1']};
  width: 100%;
`;

export const EventFilterTagList: FC<PropsWithChildren> = ({ children }) => {
  return <List>{children}</List>;
};
