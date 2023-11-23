import { FC, useLayoutEffect } from 'react';
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
  let date = selectedDate.startOf('day');

  // calculate number of slots
  const numberOfSlots = Math.floor((24 * 60) / interval);

  // scroll selected time into view using ref
  useLayoutEffect(() => {}, [selectedDate]);

  return (
    <List role="listbox">
      {Array.from({ length: numberOfSlots }).map(() => {
        const nextTime = date.plus({ minutes: interval });
        const formattedTime = date.toFormat('HH:mm');
        const isSelected = date.hasSame(selectedDate, 'hour') && date.hasSame(selectedDate, 'minute');
        const returnValue = date;
        date = nextTime;
        return (
          <Item role="option" isSelected={isSelected} key={formattedTime} onClick={() => onChange(returnValue)}>
            {formattedTime}
          </Item>
        );
      })}
    </List>
  );
};
