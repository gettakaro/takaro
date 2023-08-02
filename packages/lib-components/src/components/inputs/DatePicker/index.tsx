import { FC, useReducer } from 'react';
import { DateTime } from 'luxon';
import {
  AiOutlineCalendar as CalendarIcon,
  AiOutlineDown as DownIcon,
  AiOutlineArrowRight as ArrowRightIcon,
} from 'react-icons/ai';
import { Popover } from '../../../components';
import { QuickSelect } from './QuickSelect';
import { Container, QuickSelectContainer, ItemContainer } from './style';
import { DateSelector } from './DateSelector';
import { DatePickerContext, DatePickerDispatchContext, reducer } from './Context';

export interface DateRange {
  start: DateTime;
  end: DateTime;
}

export interface DatePickerProps {
  value: string;
  readOnly?: boolean;
  hasError?: boolean;
  id: string;
  hasDescription: boolean;
  onChange: (value: string) => void;
}

export const DatePicker: FC<DatePickerProps> = ({ readOnly = false, hasError = false, id }) => {
  const [state, dispatch] = useReducer(reducer, {
    showQuickSelect: false,
    showStartDate: false,
    showEndDate: false,
    start: DateTime.local().startOf('day'),
    end: DateTime.local().endOf('day'),
    friendlyRange: 'Today',
  });

  // TODO: add a useeffect that propogates the start end end dates controlled.

  return (
    <DatePickerContext.Provider value={state}>
      <DatePickerDispatchContext.Provider value={dispatch}>
        <Container
          readOnly={readOnly}
          hasError={hasError}
          isOpen={state.showQuickSelect || state.showStartDate || state.showEndDate}
        >
          <Popover
            open={state.showQuickSelect}
            onOpenChange={(open) =>
              dispatch({ type: 'toggle_quick_select_popover', payload: { toggleQuickSelect: open } })
            }
          >
            <Popover.Trigger asChild>
              <ItemContainer>
                <QuickSelectContainer
                  onClick={() =>
                    dispatch({
                      type: 'toggle_quick_select_popover',
                      payload: { toggleQuickSelect: !state.showQuickSelect },
                    })
                  }
                >
                  <CalendarIcon size={18} />
                  <DownIcon size={18} />
                </QuickSelectContainer>
              </ItemContainer>
            </Popover.Trigger>
            <Popover.Content>
              <QuickSelect id={`quick-select-${id}`} />
            </Popover.Content>
          </Popover>
          <Popover
            open={state.showStartDate}
            onOpenChange={(open) => dispatch({ type: 'toggle_start_date_popover', payload: { toggleStartDate: open } })}
          >
            <Popover.Trigger asChild>
              <ItemContainer
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
              <ArrowRightIcon size={18} style={{ marginLeft: '10px', marginRight: '10px' }} />
              <Popover
                open={state.showEndDate}
                onOpenChange={(open) => {
                  dispatch({ type: 'toggle_end_date_popover', payload: { toggleEndDate: open } });
                }}
              >
                <Popover.Trigger asChild>
                  <ItemContainer
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
        </Container>
      </DatePickerDispatchContext.Provider>
    </DatePickerContext.Provider>
  );
};
