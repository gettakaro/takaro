import { EventOutputDTO, EventOutputDTOEventNameEnum as EventName } from '@takaro/apiclient';
import { Filter, Operator } from './types';
import { DateTime } from 'luxon';
import _ from 'lodash';

interface ClientSideFilterOptions {
  eventTypes: EventName[];
  filters: Filter[];
  startDate: DateTime | null;
  endDate: DateTime | null;
}

export function ShouldIncludeEvent(event: EventOutputDTO, opts: ClientSideFilterOptions) {
  const createdAt = DateTime.fromISO(event.createdAt);
  if ((opts.startDate && createdAt < opts.startDate) || (opts.endDate && createdAt > opts.endDate)) {
    return false;
  }

  // '[]' means all event types
  if (opts.eventTypes.length > 0 && !opts.eventTypes.includes(event.eventName)) {
    return false;
  }

  if (opts.filters.length > 0) {
    return opts.filters.every((filter) => {
      const value = _.get(event, filter.field);
      switch (filter.operator) {
        case Operator.is:
          return filter.value === value;
        default:
          return false;
      }
    });
  }
  return true;
}
