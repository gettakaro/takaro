import { FC, MouseEvent, useLayoutEffect, useMemo, useState } from 'react';
import { Button, IconButton, Popover } from '../../../../components';
import { DateTime, DateTimeFormatOptions, Settings } from 'luxon';
import { dateFormats, timeFormats } from './formats';
import { GenericInputProps } from '../../InputProps';
import { ResultContainer, ContentContainer, InnerContainer, ButtonContainer } from './style';
import { TimePicker } from '../subcomponents/TimePicker';
import { Calendar } from '../subcomponents/Calendar';
import { RelativePicker, timeDirection } from '../subcomponents/RelativePicker';
import { Placement } from '@floating-ui/react';
import { AiOutlineClose as ClearIcon } from 'react-icons/ai';

interface TimePickerOptions {
  /// Determines the interval between time options
  /// Default: 30
  interval?: number;
}

interface RelativePickerOptions {
  /// Determines if the relative picker should be able to show filters to the past, future, or pastAndFuture
  // Default: pastAndFuture
  timeDirection?: timeDirection;
  showFriendlyName?: boolean;
}

Settings.throwOnInvalid = true;

export interface DatePickerProps {
  /// Determines if the date picker is in absolute or relative mode
  /// Absolute mode is a calendar and time picker
  /// Relative mode is a relative picker
  mode: 'relative' | 'absolute';

  popOverPlacement?: Placement;

  customDateFilter?: (date: DateTime) => boolean;

  /// Allow date selection in the past
  allowPastDates?: boolean;

  /// Allow date selection in the future
  allowFutureDates?: boolean;

  /// Determines the format of the selected date/time
  format?: DateTimeFormatOptions;

  /// Options specific for the time picker
  timePickerOptions?: TimePickerOptions;

  /// Options specific for the relative picker
  relativePickerOptions?: RelativePickerOptions;

  /// Placeholder text for the input
  placeholder?: string;

  /// Can set field back to undefined
  canClear?: boolean;
}

export type GenericDatePickerProps = GenericInputProps<string, HTMLInputElement> & DatePickerProps;

export const GenericDatePicker: FC<GenericDatePickerProps> = ({
  value,
  id,
  readOnly = false,
  hasError,
  onChange,
  name,
  onFocus,
  onBlur,
  timePickerOptions,
  relativePickerOptions = { showFriendlyName: true, timeDirection: 'future' },
  placeholder,
  popOverPlacement = 'bottom',
  format = DateTime.DATE_SHORT,
  allowPastDates = true,
  allowFutureDates = true,
  canClear = false,
  customDateFilter,
  mode,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  // Function to determine if a date is allowed
  const isDateAllowed = (date: DateTime) => {
    const isPastAllowed = allowPastDates ? true : date >= DateTime.local().startOf('day');
    const isFutureAllowed = allowFutureDates ? true : date <= DateTime.local().startOf('day');
    const isCustomFilterPassed = customDateFilter ? customDateFilter(date) : true;
    return isPastAllowed && isFutureAllowed && isCustomFilterPassed;
  };

  // Function to find the first allowed date
  const findFirstAllowedDate = () => {
    let dateToCheck = DateTime.local().startOf('day');
    while (!isDateAllowed(dateToCheck)) {
      dateToCheck = dateToCheck.plus({ days: 1 });
    }
    return dateToCheck;
  };

  // Initialize the selectedDateTime with either today's date or the first allowed date
  const initialSelectedDateTime = value
    ? DateTime.fromISO(value)
    : isDateAllowed(DateTime.local().startOf('day'))
      ? DateTime.local().startOf('day')
      : findFirstAllowedDate();

  const [selectedDateTime, setSelectedDateTime] = useState<DateTime>(initialSelectedDateTime);
  const [friendlyName, setFriendlyName] = useState<string | undefined>(undefined);

  const isFormatInTimeFormats = timeFormats.includes(JSON.stringify(format));
  const isFormatInDateFormats = dateFormats.includes(JSON.stringify(format));
  const isDateOnly = !isFormatInTimeFormats;
  const isTimeOnly = !isFormatInDateFormats;
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
      if (open) {
        onFocus(event);
      } else {
        onBlur(event);
      }
    }
  }, [open]);

  const renderResult = () => {
    if (friendlyName) {
      return (
        <>
          {DateTime.fromISO(value).toLocaleString(format)} <span>({friendlyName})</span>
        </>
      );
    }
    if (value) {
      return DateTime.fromISO(value).toLocaleString(format);
    }
    return renderPlaceholder();
  };

  const handleClear = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onChange) {
      onChange(null as any);
    }
  };

  return (
    <Popover placement={popOverPlacement} open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild readOnly={readOnly}>
        <ResultContainer readOnly={readOnly} hasError={hasError} onClick={() => setOpen(!open)}>
          <span>{renderResult()}</span>
          {!readOnly && canClear && value && !open && (
            <IconButton size="tiny" icon={<ClearIcon />} ariaLabel="clear" onClick={handleClear} />
          )}
        </ResultContainer>
      </Popover.Trigger>
      <Popover.Content>
        <ContentContainer>
          {isAbsolute && (
            <InnerContainer>
              {isFormatInDateFormats && (
                <Calendar
                  id={`calendar-${id}`}
                  // should be start of day to not update the time when only selecting a date
                  selectedDate={selectedDateTime}
                  allowedFutureDates={allowFutureDates}
                  allowedPastDates={allowPastDates}
                  customDateFilter={customDateFilter}
                  onDateClick={(date) => {
                    setSelectedDateTime(date);
                    if (relativePickerOptions?.showFriendlyName) {
                      setFriendlyName(undefined);
                    }
                    if (isDateOnly) {
                      handleOnChange(date);
                    }
                  }}
                />
              )}
              {isFormatInTimeFormats && (
                <TimePicker
                  selectedDate={selectedDateTime}
                  interval={timePickerOptions?.interval}
                  onChange={(newTime) => {
                    setSelectedDateTime(newTime);
                    if (relativePickerOptions?.showFriendlyName) {
                      setFriendlyName(undefined);
                    }
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
              <RelativePicker
                id={id}
                timeDirection={relativePickerOptions?.timeDirection}
                onChange={(newDate, friendlyName) => {
                  if (relativePickerOptions?.showFriendlyName) {
                    setFriendlyName(friendlyName);
                  }
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
                fullWidth
                variant="default"
                color="secondary"
                text="Cancel"
              />
              <Button
                fullWidth
                onClick={() => {
                  handleOnChange(selectedDateTime);
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
