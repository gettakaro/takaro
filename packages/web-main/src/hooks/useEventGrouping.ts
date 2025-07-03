import { useMemo } from 'react';
import { EventOutputDTO } from '@takaro/apiclient';

interface EventGroup {
  playerId: string;
  playerName: string;
  events: EventOutputDTO[];
  startTime: Date;
  endTime: Date;
}

export function useEventGrouping(events: EventOutputDTO[], windowSizeMs = 30000): (EventOutputDTO | EventGroup)[] {
  return useMemo(() => {
    if (!events || events.length === 0) return [];

    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const result: (EventOutputDTO | EventGroup)[] = [];
    const playerGroups = new Map<string, EventOutputDTO[]>();

    for (const event of sortedEvents) {
      if (!event.playerId) {
        // Non-player events are not grouped
        result.push(event);
        continue;
      }

      const eventTime = new Date(event.createdAt).getTime();
      const playerGroup = playerGroups.get(event.playerId);

      if (playerGroup && playerGroup.length > 0) {
        const lastEventTime = new Date(playerGroup[playerGroup.length - 1].createdAt).getTime();
        
        if (eventTime - lastEventTime <= windowSizeMs) {
          // Add to existing group
          playerGroup.push(event);
        } else {
          // Create a new group from the existing events
          if (playerGroup.length > 1) {
            result.push({
              playerId: event.playerId,
              playerName: event.player?.name || 'Unknown Player',
              events: [...playerGroup],
              startTime: new Date(playerGroup[0].createdAt),
              endTime: new Date(playerGroup[playerGroup.length - 1].createdAt),
            });
          } else {
            // Single event, don't group
            result.push(playerGroup[0]);
          }
          
          // Start new group
          playerGroups.set(event.playerId, [event]);
        }
      } else {
        // First event for this player
        playerGroups.set(event.playerId, [event]);
      }
    }

    // Process remaining groups
    playerGroups.forEach((group, playerId) => {
      if (group.length > 1) {
        result.push({
          playerId,
          playerName: group[0].player?.name || 'Unknown Player',
          events: group,
          startTime: new Date(group[0].createdAt),
          endTime: new Date(group[group.length - 1].createdAt),
        });
      } else if (group.length === 1) {
        result.push(group[0]);
      }
    });

    // Sort by most recent first
    return result.sort((a, b) => {
      const aTime = 'createdAt' in a ? new Date(a.createdAt).getTime() : a.endTime.getTime();
      const bTime = 'createdAt' in b ? new Date(b.createdAt).getTime() : b.endTime.getTime();
      return bTime - aTime;
    });
  }, [events, windowSizeMs]);
}

export function isEventGroup(item: EventOutputDTO | EventGroup): item is EventGroup {
  return 'events' in item;
}