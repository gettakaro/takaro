import { EventOutputDTO } from '@takaro/apiclient';
import { DateTime } from 'luxon';

export function formatEventTimestamp(timestamp: string): {
  relative: string;
  absolute: string;
  time: string;
} {
  const date = DateTime.fromISO(timestamp);
  return {
    relative: date.toRelative() || 'Unknown time',
    absolute: date.toLocaleString(DateTime.DATETIME_FULL),
    time: date.toLocaleString(DateTime.TIME_WITH_SECONDS),
  };
}

export function formatEventDescription(event: EventOutputDTO): string {
  const meta = event.meta as any;
  
  switch (event.eventName) {
    case 'server-status-changed':
      return `Server status changed to ${meta?.status}`;
    case 'chat-message':
      return `${event.player?.name}: ${meta?.msg}`;
    case 'command-executed':
      return `${event.player?.name} executed /${meta?.command?.name}`;
    case 'player-connected':
      return `${event.player?.name} connected`;
    case 'player-disconnected':
      return `${event.player?.name} disconnected`;
    case 'currency-added':
      return `${event.player?.name} received ${meta?.amount} currency`;
    case 'currency-deducted':
      return `${event.player?.name} spent ${meta?.amount} currency`;
    default:
      return event.eventName;
  }
}

export function getEventSeverity(eventName: string): 'info' | 'warning' | 'error' | 'success' {
  if (eventName.includes('error') || eventName.includes('failed')) {
    return 'error';
  }
  if (eventName.includes('warning') || eventName.includes('alert')) {
    return 'warning';
  }
  if (eventName.includes('success') || eventName.includes('completed')) {
    return 'success';
  }
  return 'info';
}