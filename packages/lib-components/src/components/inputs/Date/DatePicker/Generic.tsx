import { FC, useState } from 'react';
import { Button, Popover } from '../../../../components';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import { dateFormats, timeFormats } from './formats';
import { TimePicker } from '../subcomponents/TimePicker';
import { Calendar } from '../subcomponents/Calendar';
import { GenericInputProps } from 'components/inputs/InputProps';

export interface DatePickerProps {
  format?: DateTimeFormatOptions;
}

export type GenericDatePickerProps = GenericInputProps<string, HTMLInputElement> & DatePickerProps;

export const GenericDatePicker: FC<GenericDatePickerProps> = ({
  value,
  id,
  readOnly,
  // TODOhasError
  onChange,
  format = DateTime.DATE_SHORT,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<DateTime | null>(null);

  const isDateOnly = !timeFormats.includes(format);
  const isTimeOnly = !dateFormats.includes(format);

  const handleOnChange = (dateTime: DateTime) => {
    const dateTimeString = dateTime.toISO();
    if (dateTimeString == null) {
      throw new Error('Could not convert DateTime to ISO');
    }

    // Create an object that mimics the structure of a React ChangeEvent
    const event = {
      target: { value: dateTimeString, name },
      preventDefault: () => {},
      stopPropagation: () => {},
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        !readOnly && setOpen(!open);
      }}
      placement="bottom"
    >
      <Popover.Trigger>
        <div></div>
      </Popover.Trigger>
      <Popover.Content>
        {dateFormats.includes(format) && (
          <Calendar
            id={`calendar-${id}`}
            selectedDate={value ? DateTime.fromISO(value) : DateTime.now()}
            onDateClick={(date) => {
              setSelectedDateTime(date);
              // if only a date needs to be selected, close the popover
              if (isDateOnly) {
                handleOnChange(date);
                setOpen(false);
              }
            }}
          />
        )}
        {timeFormats.includes(format) && (
          <TimePicker
            selectedDate={selectedDateTime || (value ? DateTime.fromISO(value) : DateTime.now())}
            onChange={(newTime) => {
              if (isTimeOnly) {
                handleOnChange(newTime);
                setOpen(false);
              }
            }}
          />
        )}
        <Button
          onClick={() => {
            setOpen(false);
          }}
          text="Cancel"
        />
        <Button
          onClick={() => {
            handleOnChange(selectedDateTime!);
          }}
          text="Select"
        />
      </Popover.Content>
    </Popover>
  );
};
