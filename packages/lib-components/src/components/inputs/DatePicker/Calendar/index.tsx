import { DateTime, Interval } from 'luxon';
import { FC, useCallback, useState } from 'react';
import { Header, Wrapper, DaysGrid, DayButton, DayWrapper, DayOfWeekGrid } from './style';
import { IconButton } from '../../../../components';

interface CalendarProps {
  isBegin: boolean;
}

import { AiOutlineRight as ChevronRightIcon, AiOutlineLeft as ChevronLeftIcon } from 'react-icons/ai';
import { useDatePickerContext, useDatePickerDispatchContext } from '../Context';

export const Calendar: FC<CalendarProps> = ({}) => {
  const today = DateTime.local().startOf('day');
  const [currentMonth, setCurrentMonth] = useState<string>(today.toFormat('MMM-YYYY'));
  const firstDayCurrentMonth = DateTime.fromFormat(currentMonth, 'MMM-YYYY').startOf('month');

  const dispatch = useDatePickerDispatchContext()!;
  const state = useDatePickerContext()!;

  // days of month
  const days = Interval.fromDateTimes(firstDayCurrentMonth, firstDayCurrentMonth.endOf('month'))
    .splitBy({ days: 1 })
    .map((day) => day.start);

  const previousMonth = useCallback(() => {
    const firstDayPreviousMonth = firstDayCurrentMonth.minus({ months: 1 });
    setCurrentMonth(firstDayPreviousMonth.toFormat('LLL-yyyy'));
  }, [firstDayCurrentMonth]);

  const nextMonth = useCallback(() => {
    const firstDayNextMonth = firstDayCurrentMonth.plus({ months: 1 });
    setCurrentMonth(firstDayNextMonth.toFormat('LLL-yyyy'));
  }, [firstDayCurrentMonth]);

  return (
    <Wrapper>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{ flex: '1 1 auto' }}>{firstDayCurrentMonth.toFormat('MMMM yyyy')}</h2>
        <IconButton onClick={previousMonth} icon={<ChevronLeftIcon />} ariaLabel="Previous month" />
        <IconButton onClick={nextMonth} icon={<ChevronRightIcon />} ariaLabel="Next month" />
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
        {days.map((day, dayIdx) => (
          <DayWrapper key={day?.toString()} isFirstDay={dayIdx === 0} dayNumber={day!.weekday}>
            <DayButton
              type="button"
              onClick={() => dispatch({ type: 'set_start_date', payload: { startDate: day! } })}
              isSelected={day?.hasSame(state.start, 'day') ?? false}
              isToday={day?.hasSame(today, 'day') ?? false}
              isSameMonth={day?.hasSame(firstDayCurrentMonth, 'month') ?? false}
            >
              <time dateTime={day?.toFormat('yyyy-MM-dd')}>{day?.toFormat('d')}</time>
            </DayButton>
          </DayWrapper>
        ))}
      </DaysGrid>
    </Wrapper>
  );
};
