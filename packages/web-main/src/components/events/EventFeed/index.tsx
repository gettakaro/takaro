import { FC, PropsWithChildren } from 'react';
import { styled } from '@takaro/lib-components';

const TimelineContainer = styled.div`
  width: 100%;
  position: relative;
  padding: 0;
  margin: 0;
  height: fit-content;
  padding-left: ${({ theme }) => theme.spacing['6']};
  
  &::before {
    content: '';
    position: absolute;
    left: ${({ theme }) => theme.spacing['3']};
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${({ theme }) => theme.colors.backgroundAccent};
    z-index: 1;
  }
`;

// Keep EventFeed as alias for backward compatibility during transition
export const EventFeed: FC<PropsWithChildren> = ({ children }) => {
  return <TimelineContainer>{children}</TimelineContainer>;
};

// Export Timeline as the new preferred component name
export const Timeline: FC<PropsWithChildren> = ({ children }) => {
  return <TimelineContainer>{children}</TimelineContainer>;
};

export { EventItem } from './EventItem';
export type { EventItemProps } from './EventItem';

// Export TimelineItem as alias for backward compatibility during transition
export { EventItem as TimelineItem } from './EventItem';
export type { EventItemProps as TimelineItemProps } from './EventItem';
