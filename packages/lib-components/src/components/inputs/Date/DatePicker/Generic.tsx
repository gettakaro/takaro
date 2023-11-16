import { FC, useLayoutEffect, useMemo, useState } from 'react';
import { Button, Popover } from '../../../../components';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import { dateFormats, timeFormats } from './formats';
import { GenericInputProps } from '../../InputProps';
import { ResultContainer, ContentContainer, InnerContainer, ButtonContainer } from './style';
import { TimePicker } from '../subcomponents/TimePicker';
import { Calendar } from '../subcomponents/Calendar';
import { Relative } from '../subcomponents/Relative';

interface TimePickerOptions {
  interval?: number;
}

export interface DatePickerProps {
  /// Determines if the date picker is in absolute or relative mode
  /// Absolute mode is a calendar and time picker
  /// Relative mode is a relative picker
  mode: 'relative' | 'absolute';

  /// Determines the format of the selected date/time
  format?: DateTimeFormatOptions;

  /// Options specific for the time picker
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
  mode,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedDateTime, setSelectedDateTime] = useState<DateTime>(value ? DateTime.fromISO(value) : DateTime.now());

  const isDateOnly = !timeFormats.includes(format);
  const isTimeOnly = !dateFormats.includes(format);
  const isDateTime = !isDateOnly && !isTimeOnly;

  const isAbsolute = mode === 'absolute';
  const isRelative = mode === 'relative';

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
    setOpen(false);
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
          {isAbsolute && (
            <InnerContainer>
              {dateFormats.includes(format) && (
                <Calendar
                  id={`calendar-${id}`}
                  // should be start of day to not update the time when only selecting a date
                  selectedDate={selectedDateTime}
                  onDateClick={(date) => {
                    setSelectedDateTime(date);
                    if (isDateOnly) {
                      handleOnChange(date);
                    }
                  }}
                />
              )}
              {timeFormats.includes(format) && (
                <TimePicker
                  selectedDate={selectedDateTime}
                  interval={timePickerOptions?.interval}
                  onChange={(newTime) => {
                    setSelectedDateTime(newTime);

                    // see notes above
                    if (isTimeOnly) {
                      handleOnChange(newTime);
                    }
                  }}
                />
              )}
            </InnerContainer>
          )}

          {isRelative && (
            <InnerContainer>
              <Relative
                onChange={(newDate) => {
                  console.log(newDate);
                  setSelectedDateTime(newDate);
                  handleOnChange(newDate);
                }}
              />
            </InnerContainer>
          )}

          {isAbsolute && isDateTime && (
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
