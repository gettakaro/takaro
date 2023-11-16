import { FC, useLayoutEffect, useMemo, useState } from 'react';
import { Button, Popover } from '../../../../components';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import { dateFormats, timeFormats } from './formats';
import { TimePicker } from '../subcomponents/TimePicker';
import { Calendar } from '../subcomponents/Calendar';
import { GenericInputProps } from '../../InputProps';
import { ResultContainer, ContentContainer, InnerContainer, ButtonContainer } from './style';

interface TimePickerOptions {
  interval?: number;
}

export interface DatePickerProps {
  format?: DateTimeFormatOptions;
  timePickerOptions?: TimePickerOptions;
  placeholder?: string;
}

export type GenericDatePickerProps = GenericInputProps<string, HTMLInputElement> & DatePickerProps;

export const GenericDatePicker: FC<GenericDatePickerProps> = ({
  value,
  id,
  readOnly = false,
  hasError,
  onChange,
  onFocus,
  onBlur,
  timePickerOptions,
  placeholder,
  format = DateTime.DATE_SHORT,
}) => {
  const [open, setOpen] = useState<boolean>(false);
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

  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    if (isTimeOnly) {
      return 'Select a time';
    }
    return 'Select a date';
  };

  const event = useMemo(() => {
    return {
      // value does not matter I think
      target: { value: '' },
      preventDefault: () => {},
      stopPropagation: () => {},
    } as unknown as React.FocusEvent<HTMLInputElement>;
  }, []);

  useLayoutEffect(() => {
    if (onFocus && onBlur) {
      // consider open to be a focus event
      open ? onFocus(event) : onBlur(event);
    }
  }, [open]);

  return (
    <Popover placement="bottom" open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <ResultContainer readOnly={readOnly} hasError={hasError} onClick={() => setOpen(!open)}>
          {value ? DateTime.fromISO(value).toLocaleString(format) : renderPlaceholder()}
        </ResultContainer>
      </Popover.Trigger>
      <Popover.Content>
        <ContentContainer>
          <InnerContainer>
            {dateFormats.includes(format) && (
              <Calendar
                id={`calendar-${id}`}
                // should be start of day to not update the time when only selecting a date
                selectedDate={value ? DateTime.fromISO(value) : DateTime.now().startOf('day')}
                onDateClick={(date) => {
                  setSelectedDateTime(date);

                  // we cannot add this to the `if` because the state depends on the value from the parent component
                  handleOnChange(date);
                  // we cannot close the popover if we are only selecting a date
                  if (isDateOnly) {
                    setOpen(false);
                  }
                }}
              />
            )}
            {timeFormats.includes(format) && (
              <TimePicker
                selectedDate={selectedDateTime || (value ? DateTime.fromISO(value) : DateTime.now().startOf('day'))}
                interval={timePickerOptions?.interval}
                onChange={(newTime) => {
                  setSelectedDateTime(newTime);

                  // see notes above
                  handleOnChange(newTime);

                  if (isTimeOnly) {
                    setOpen(false);
                  }
                }}
              />
            )}
          </InnerContainer>

          {!isDateOnly && !isTimeOnly && (
            <ButtonContainer>
              <Button
                onClick={() => {
                  setOpen(false);
                }}
                variant="clear"
                color="secondary"
                text="Cancel"
              />
              <Button
                onClick={() => {
                  handleOnChange(selectedDateTime!);
                  setOpen(false);
                }}
                text="Select"
              />
            </ButtonContainer>
          )}
        </ContentContainer>
      </Popover.Content>
    </Popover>
  );
};
