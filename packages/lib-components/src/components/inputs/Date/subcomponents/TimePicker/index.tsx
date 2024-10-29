import { FC, useLayoutEffect, useMemo } from 'react';
import { DateTime } from 'luxon';
import { List, Item } from './style';

export interface TimePickerProps {
  onChange: (date: DateTime) => void;
  selectedDate: DateTime;

  // Interval in minutes between each time slot
  // e.g. interval = 30 means each slot is 30 minutes apart
  // resulting in 48 slots
  interval?: number;
}

export const TimePicker: FC<TimePickerProps> = ({ onChange, selectedDate, interval = 30 }) => {
  const numberOfSlots = useMemo(() => Math.floor((24 * 60) / interval), [interval]);
  useLayoutEffect(() => { }, [selectedDate]);

  const timeSlots = useMemo(() => {
    const startOfDay = selectedDate.startOf('day');
    return Array.from({ length: numberOfSlots }, (_, index) => {
      return startOfDay.plus({ minutes: interval * index });
    });
  }, [selectedDate, interval, numberOfSlots]);

  return (
    <List role="listbox">
      {timeSlots.map((time) => {
        const formattedTime = time.toFormat('HH:mm');
        const isSelected = time.hasSame(selectedDate, 'hour') && time.hasSame(selectedDate, 'minute');
        return (
          <Item role="option" isSelected={isSelected} key={formattedTime} onClick={() => onChange(time)}>
            {formattedTime}
          </Item>
        );
      })}
    </List>
  );
};
