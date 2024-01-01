import { DateTime, DateTimeFormatOptions } from 'luxon';
import { FC } from 'react';

export interface DateFormatterProps {
  ISODate: string;
  format?: DateTimeFormatOptions;
}

export const DateFormatter: FC<DateFormatterProps> = ({ ISODate, format }) => {
  return format ? (
    <>{DateTime.fromISO(ISODate).toLocaleString(format)}</>
  ) : (
    <>{DateTime.fromISO(ISODate).toLocaleString(DateTime.DATETIME_SHORT)}</>
  );
};
