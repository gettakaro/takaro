import {
  offset,
  useFloating,
  flip,
  autoUpdate,
  useClick,
  useRole,
  useDismiss,
  FloatingFocusManager,
  useInteractions,
  FloatingOverlay,
} from '@floating-ui/react';
import { Dispatch, FC, SetStateAction, useCallback, useEffect, useState } from 'react';
import { DateTime, Interval } from 'luxon';
import {
  AiOutlineRight as ChevronRightIcon,
  AiOutlineLeft as ChevronLeftIcon,
  AiOutlineCalendar as CalendarIcon,
} from 'react-icons/ai';
import { RefContainer, DaysGrid, DayButton, DayWrapper, DayOfWeekGrid, Wrapper, Header } from './style';
import { setAriaDescribedBy } from '../layout';
import { IconButton } from '../../../components';

export interface DatePickerProps {
  value: string;
  readOnly?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  hasError?: boolean;
  id: string;
  hasDescription: boolean;
  onChange: (value: string) => void;
}

export const DatePicker: FC<DatePickerProps> = ({
  onBlur,
  onFocus,
  id,
  readOnly = false,
  hasError = false,
  hasDescription = false,
}) => {
  const [open, setOpen] = useState<boolean>(true);
  const [pointer, setPointer] = useState<boolean>(false);
  const today = DateTime.local().startOf('day');
  const [selectedDay, setSelectedDay] = useState<DateTime>(today);

  if (!open && pointer) {
    setPointer(false);
  }

  useEffect(() => {
    setOpen(false);
  }, [selectedDay]);

  const { x, y, refs, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({
        fallbackStrategy: 'bestFit',
        fallbackPlacements: ['top', 'bottom'],
      }),
    ],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useRole(context, { role: 'listbox' }),
    useDismiss(context),
  ]);

  return (
    <div>
      <RefContainer
        isOpen={open}
        hasError={hasError}
        ref={refs.setReference}
        readOnly={readOnly}
        onBlur={onBlur}
        onFocus={onFocus}
        tabIndex={readOnly ? -1 : 0}
        aria-describedby={setAriaDescribedBy(id, hasDescription)}
        {...getReferenceProps()}
      >
        <div>{selectedDay.toISO()}</div>
        <CalendarIcon size={18} />
      </RefContainer>
      {open && !readOnly && (
        <FloatingOverlay>
          <FloatingFocusManager context={context}>
            <div
              ref={refs.setFloating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                overflow: 'auto',
              }}
              onPointerMove={() => setPointer(true)}
              onKeyDown={(event) => {
                if (event.key === 'Tab') {
                  setOpen(false);
                }
              }}
              {...getFloatingProps()}
            >
              <Calendar selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      )}
    </div>
  );
};

interface CalendarProps {
  selectedDay: DateTime;
  setSelectedDay: Dispatch<SetStateAction<DateTime>>;
}

export const Calendar: FC<CalendarProps> = ({ selectedDay, setSelectedDay }) => {
  const today = DateTime.local().startOf('day');
  const [currentMonth, setCurrentMonth] = useState(today.toFormat('MMM-YYYY'));
  const firstDayCurrentMonth = DateTime.fromFormat(currentMonth, 'MMM-YYYY').startOf('month');

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
      fjdklqmfdjklm
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
              onClick={() => setSelectedDay(day!)}
              isSelected={day?.hasSame(selectedDay, 'day') ?? false}
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
