import { FC, useEffect, useReducer, useState } from 'react';
import { DateTime } from 'luxon';
import {
  AiOutlineCalendar as CalendarIcon,
  AiOutlineDown as DownIcon,
  AiOutlineArrowRight as ArrowRightIcon,
} from 'react-icons/ai';
import { Popover } from '../../../../components';
import { QuickSelect, Tense, Unit } from './QuickSelect';
import { DateRangePickerContainer, QuickSelectContainer, ItemContainer } from './style';
import { DateSelector } from './DateSelector';
import { DateRangePickerDispatchContext, DateRangePickerContext, reducer } from './Context';
import { useTheme } from '../../../../hooks';
import { GenericInputProps } from '../../InputProps';

export type DateRange = { start: DateTime<true>; end: DateTime<true> };

export interface DateRangePickerProps {
  defaultValue?: DateRange;
  readOnly?: boolean;
  disabled?: boolean;
  id: string;
}

export type GenericDateRangePickerProps = GenericInputProps<string, HTMLInputElement> & DateRangePickerProps;
export const GenericDateRangePicker: FC<GenericDateRangePickerProps> = ({
  readOnly = false,
  disabled = false,
  id,
  onChange,
  defaultValue = {
    start: DateTime.local().startOf('day'),
    end: DateTime.local().endOf('day'),
  },
}) => {
  const [state, dispatch] = useReducer(reducer, {
    quickSelect: {
      show: false,
      tense: Tense.Last,
      step: 15,
      unit: Unit.Minutes,
    },
    showStartDate: false,
    showEndDate: false,
    start: defaultValue.start,
    end: defaultValue.end,
    friendlyRange: undefined,
    disabledOrReadOnly: disabled || readOnly,
  });

  useEffect(() => {
    if (disabled || readOnly) {
      dispatch({ type: 'toggle_disable_or_readonly', payload: { disabledOrReadOnly: true } });
    } else {
      dispatch({ type: 'toggle_disable_or_readonly', payload: { disabledOrReadOnly: false } });
    }
  }, [disabled, readOnly]);

  const theme = useTheme();
  const [hasError, setHasError] = useState<boolean>(false);
  const iconColor = disabled ? theme.colors.backgroundAccent : theme.colors.white;

  useEffect(() => {
    if (state.start > state.end) {
      setHasError(true);
    } else {
      setHasError(false);
    }

    if (onChange) {
      const event = {
        target: { value: { start: state.start.toISO(), end: state.end.toISO() }, name },
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  }, [state.start, state.end]);

  return (
    <DateRangePickerContext.Provider value={state}>
      <DateRangePickerDispatchContext.Provider value={dispatch}>
        <DateRangePickerContainer
          hasError={hasError}
          isOpen={state.quickSelect.show || state.showStartDate || state.showEndDate}
        >
          <Popover
            open={state.quickSelect.show}
            onOpenChange={(open) =>
              dispatch({ type: 'toggle_quick_select_popover', payload: { toggleQuickSelect: open } })
            }
          >
            <Popover.Trigger asChild>
              <QuickSelectContainer
                readOnly={readOnly}
                disabled={disabled}
                onClick={() =>
                  dispatch({
                    type: 'toggle_quick_select_popover',
                    payload: { toggleQuickSelect: !state.quickSelect.show },
                  })
                }
              >
                <CalendarIcon fill={iconColor} size={18} />
                <DownIcon fill={iconColor} size={18} />
              </QuickSelectContainer>
            </Popover.Trigger>
            <Popover.Content>
              <QuickSelect id={`quick-select-${id}`} />
            </Popover.Content>
          </Popover>
          <Popover
            open={state.showStartDate}
            onOpenChange={(open) => {
              dispatch({ type: 'toggle_start_date_popover', payload: { toggleStartDate: open } });
            }}
          >
            <Popover.Trigger asChild>
              <ItemContainer
                disabled={disabled}
                readOnly={readOnly}
                onClick={() => {
                  dispatch({ type: 'toggle_start_date_popover', payload: { toggleStartDate: !state.showStartDate } });
                }}
              >
                {state.friendlyStartDate ??
                  state.friendlyRange ??
                  // e.g. Aug 2, 2023 @ 00:00:00.000
                  state.start.toFormat('LLL d, yyyy @ HH:mm:ss.SSS')}
              </ItemContainer>
            </Popover.Trigger>
            <Popover.Content>
              <DateSelector isStart />
            </Popover.Content>
          </Popover>
          {!state.friendlyRange && (
            <>
              <ArrowRightIcon fill={iconColor} size={18} style={{ marginLeft: '10px', marginRight: '10px' }} />
              <Popover
                open={state.showEndDate}
                onOpenChange={(open) => {
                  dispatch({ type: 'toggle_end_date_popover', payload: { toggleEndDate: open } });
                }}
              >
                <Popover.Trigger asChild>
                  <ItemContainer
                    disabled={disabled}
                    readOnly={readOnly}
                    onClick={() => {
                      dispatch({ type: 'toggle_end_date_popover', payload: { toggleEndDate: !state.showEndDate } });
                    }}
                  >
                    {state.friendlyEndDate ?? state.end.toFormat('LLL d, yyyy @ HH:mm:ss.SSS')}
                  </ItemContainer>
                </Popover.Trigger>
                <Popover.Content>
                  <DateSelector isStart={false} />
                </Popover.Content>
              </Popover>
            </>
          )}
        </DateRangePickerContainer>
      </DateRangePickerDispatchContext.Provider>
    </DateRangePickerContext.Provider>
  );
};
