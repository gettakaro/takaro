import { DateTime, Interval } from 'luxon';
import { FC, useCallback, useState } from 'react';
import { Header, Wrapper, DaysGrid, DayButton, DayWrapper, DayOfWeekGrid } from './style';
import { IconButton, Tooltip } from '../../../../../components';
import {
  MdOutlineKeyboardArrowRight as ChevronRightIcon,
  MdOutlineKeyboardArrowLeft as ChevronLeftIcon,
  MdOutlineKeyboardDoubleArrowLeft as DoubleChevronLeftIcon,
  MdOutlineKeyboardDoubleArrowRight as DoubleChevronRightIcon,
} from 'react-icons/md';

interface CalendarProps {
  onDateClick: (date: DateTime) => void;
  selectedDate: DateTime;
  id: string;
  allowedPastDates?: boolean;
  allowedFutureDates?: boolean;
  customDateFilter?: (date: DateTime) => boolean;
}

export const Calendar: FC<CalendarProps> = ({
  onDateClick,
  selectedDate,
  id,
  allowedPastDates = true,
  allowedFutureDates = true,
  customDateFilter,
}) => {
  const today = DateTime.local().startOf('day');
  const [currentMonth, setCurrentMonth] = useState<DateTime>(selectedDate.startOf('month'));

  // days of month
  const days = Interval.fromDateTimes(currentMonth, currentMonth.endOf('month'))
    .splitBy({ days: 1 })
    .map((day) => day.start!);

  const isDateSelectable = useCallback(
    (date: DateTime) => {
      // If past dates are allowed, then all dates up to today are acceptable.
      // If not, then only dates from today onwards are acceptable.
      const isPastAllowed = allowedPastDates ? true : date >= today;

      // If future dates are allowed, then all dates from today onwards are acceptable.
      // If not, then only dates up to today are acceptable.
      const isFutureAllowed = allowedFutureDates ? true : date <= today;

      // Check if the date passes the custom filter, if provided.
      const isCustomFilterPassed = customDateFilter ? customDateFilter(date) : true;

      return isPastAllowed && isFutureAllowed && isCustomFilterPassed;
    },
    [allowedPastDates, allowedFutureDates, customDateFilter, today],
  );

  const previousMonth = useCallback(() => {
    const firstDayPreviousMonth = currentMonth.minus({ months: 1 });
    setCurrentMonth(firstDayPreviousMonth);
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    const firstDayNextMonth = currentMonth.plus({ months: 1 });
    setCurrentMonth(firstDayNextMonth);
  }, [currentMonth]);

  const nextYear = useCallback(() => {
    const firstDayNextMonth = currentMonth.plus({ year: 1 });
    setCurrentMonth(firstDayNextMonth);
  }, [currentMonth]);

  const previousYear = useCallback(() => {
    const firstDayPreviousMonth = currentMonth.minus({ year: 1 });
    setCurrentMonth(firstDayPreviousMonth);
  }, [currentMonth]);

  return (
    <Wrapper>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip>
          <Tooltip.Trigger>
            <IconButton onClick={previousYear} icon={<DoubleChevronLeftIcon />} ariaLabel="Previous year" />
          </Tooltip.Trigger>
          <Tooltip.Content>Previous year</Tooltip.Content>
        </Tooltip>

        <Tooltip>
          <Tooltip.Trigger>
            <IconButton onClick={previousMonth} icon={<ChevronLeftIcon />} ariaLabel="Previous month" />
          </Tooltip.Trigger>
          <Tooltip.Content>Previous month</Tooltip.Content>
        </Tooltip>

        <h2 style={{ flex: '1 1 auto', textAlign: 'center' }}>{currentMonth.toFormat('MMMM yyyy')}</h2>

        <Tooltip>
          <Tooltip.Trigger>
            <IconButton onClick={nextMonth} icon={<ChevronRightIcon />} ariaLabel="Next month" />
          </Tooltip.Trigger>
          <Tooltip.Content>Next month</Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger>
            <IconButton onClick={nextYear} icon={<DoubleChevronRightIcon />} ariaLabel="Next year" />
          </Tooltip.Trigger>
          <Tooltip.Content>Next year</Tooltip.Content>
        </Tooltip>
      </Header>
      <DayOfWeekGrid>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
        <div>S</div>
      </DayOfWeekGrid>
      <DaysGrid>
        {days.map((day, dayIdx) => {
          const isSelectable = isDateSelectable(day);
          return (
            <DayWrapper key={`${id}-${day?.toString()}`} isFirstDay={dayIdx === 0} dayNumber={day.weekday}>
              <DayButton
                key={`${id}-day-button`}
                type="button"
                disabled={!isSelectable}
                onClick={() => {
                  if (isSelectable) {
                    const newDate = day.set({
                      hour: selectedDate.hour,
                      minute: selectedDate.minute,
                      second: selectedDate.second,
                      millisecond: selectedDate.millisecond,
                    });
                    onDateClick(newDate);
                  }
                }}
                isSelected={day.hasSame(selectedDate, 'day') ?? false}
                isToday={day.hasSame(today, 'day') ?? false}
                isSameMonth={day.hasSame(currentMonth, 'month') ?? false}
              >
                <time key={`${id}-time`} dateTime={day?.toFormat('yyyy-MM-dd')}>
                  {day?.toFormat('d')}
                </time>
              </DayButton>
            </DayWrapper>
          );
        })}
      </DaysGrid>
    </Wrapper>
  );
};
