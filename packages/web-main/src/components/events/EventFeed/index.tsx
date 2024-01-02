import { FC, PropsWithChildren } from 'react';
import { styled } from '@takaro/lib-components';

const List = styled.ol`
  position: relative;
  padding: 0;
  border-left: 1px solid ${({ theme }) => theme.colors.textAlt};
  margin: 0;
  /* The dots from the list items exceeds this container, so we add a margin to the left to compensate */
  margin-left: 5px;
`;

export const EventFeed: FC<PropsWithChildren> = ({ children }) => {
  return <List>{children}</List>;
};

export { EventItem } from './EventItem';
export type { EventItemProps } from './EventItem';
