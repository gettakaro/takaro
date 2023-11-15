import { DateTime, Interval } from 'luxon';
import { FC, useCallback, useState } from 'react';
import { Header, Wrapper, DaysGrid, DayButton, DayWrapper, DayOfWeekGrid } from './style';
import { IconButton, Tooltip } from '../../../../../components';
import { AiOutlineRight as ChevronRightIcon, AiOutlineLeft as ChevronLeftIcon } from 'react-icons/ai';

interface CalendarProps {
  onDateClick: (date: DateTime) => void;
  selectedDate: DateTime;
  id: string;
}

export const Calendar: FC<CalendarProps> = ({ onDateClick, selectedDate, id }) => {
  const today = DateTime.local().startOf('day');
  const [currentMonth, setCurrentMonth] = useState<string>(selectedDate.toFormat('MMM-YYYY'));
  const firstDayCurrentMonth = DateTime.fromFormat(currentMonth, 'MMM-YYYY').startOf('month');

  // days of month
  const days = Interval.fromDateTimes(firstDayCurrentMonth, firstDayCurrentMonth.endOf('month'))
    .splitBy({ days: 1 })
    .map((day) => day.start!);

  const previousMonth = useCallback(() => {
    const firstDayPreviousMonth = firstDayCurrentMonth.minus({ months: 1 });
    setCurrentMonth(firstDayPreviousMonth.toFormat('MMM-YYYY'));
  }, [firstDayCurrentMonth]);

  const nextMonth = useCallback(() => {
    const firstDayNextMonth = firstDayCurrentMonth.plus({ months: 1 });
    setCurrentMonth(firstDayNextMonth.toFormat('MMM-YYYY'));
  }, [firstDayCurrentMonth]);

  return (
    <Wrapper>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{ flex: '1 1 auto' }}>{firstDayCurrentMonth.toFormat('MMMM yyyy')}</h2>
        <Tooltip>
          <Tooltip.Trigger>
            <IconButton onClick={previousMonth} icon={<ChevronLeftIcon />} ariaLabel="Previous month" />
          </Tooltip.Trigger>
          <Tooltip.Content>Previous month</Tooltip.Content>
        </Tooltip>

        <Tooltip>
          <Tooltip.Trigger>
            <IconButton onClick={nextMonth} icon={<ChevronRightIcon />} ariaLabel="Next month" />
          </Tooltip.Trigger>
          <Tooltip.Content>Next month</Tooltip.Content>
        </Tooltip>
      </Header>
      <DayOfWeekGrid>
        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
      </DayOfWeekGrid>
      <DaysGrid>
        {days.map((day, dayIdx) => {
          return (
            <DayWrapper key={`${id}-${day?.toString()}`} isFirstDay={dayIdx === 0} dayNumber={day.weekday}>
              <DayButton
                key={`${id}-day-button`}
                type="button"
                onClick={() => {
                  const newDate = day.set({
                    hour: selectedDate.hour,
                    minute: selectedDate.minute,
                    second: selectedDate.second,
                    millisecond: selectedDate.millisecond,
                  });
                  onDateClick(newDate);
                }}
                isSelected={day.hasSame(selectedDate, 'day') ?? false}
                isToday={day.hasSame(today, 'day') ?? false}
                isSameMonth={day.hasSame(firstDayCurrentMonth, 'month') ?? false}
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
