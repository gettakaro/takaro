import { FC, PropsWithChildren } from 'react';
import { styled } from '@takaro/lib-components';

const List = styled.ol`
  position: relative;
  padding: 0;
  border-left: 1px solid ${({ theme }) => theme.colors.textAlt};
  width: 100%;
  height: fit-content;
`;

export const EventFeed: FC<PropsWithChildren> = ({ children }) => {
  return <List>{children}</List>;
};

export { EventItem } from './EventItem';
export type { EventItemProps } from './EventItem';
