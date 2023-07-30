import { FC, PropsWithChildren } from 'react';
import { styled } from '@takaro/lib-components';

const List = styled.ol`
  position: relative;
  border-left: 1px solid ${({ theme }) => theme.colors.textAlt};
`;

export const EventFeed: FC<PropsWithChildren> = ({ children }) => {
  return <List>{children}</List>;
};
