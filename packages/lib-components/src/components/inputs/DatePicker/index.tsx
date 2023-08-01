import { FC, useReducer } from 'react';
import { DateTime } from 'luxon';
import {
  AiOutlineCalendar as CalendarIcon,
  AiOutlineDown as DownIcon,
  AiOutlineArrowRight as ArrowRightIcon,
} from 'react-icons/ai';
import { Popover } from '../../../components';
import { QuickSelect } from './QuickSelect';
import { Container, QuickSelectContainer } from './style';
import { DateSelector } from './DateSelector';
import { Action, DatePickerContext, DatePickerDispatchContext, DatePickerState } from './Context';

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

function datePickerReducer(state: DatePickerState, action: Action): DatePickerState {
  switch (action.type) {
    case 'toggle_quick_select_popover':
      return {
        ...state,
        showQuickSelect: action.payload.toggleQuickSelect,
      };
    case 'toggle_begin_date_popover':
      return {
        ...state,
        showBeginDate: action.payload.toggleBeginDate,
      };
    case 'toggle_end_date_popover':
      return {
        ...state,
        showEndDate: action.payload.toggleEndDate,
      };
    case 'set_start_date':
      return {
        ...state,
        start: action.payload.startDate,
        showBeginDate: false,
        showEndDate: false,
        showQuickSelect: false,
      };
    case 'set_end_date':
      return {
        ...state,
        end: action.payload.endDate,
        showBeginDate: false,
        showEndDate: false,
        showQuickSelect: false,
      };
  }
}

export const DatePicker: FC<DatePickerProps> = ({ readOnly = false, hasError = false, id }) => {
  const [state, dispatch] = useReducer(datePickerReducer, {
    showQuickSelect: false,
    showBeginDate: false,
    showEndDate: false,
    start: DateTime.local().startOf('day'),
    end: DateTime.local().endOf('day'),
  });

  return (
    <DatePickerContext.Provider value={state}>
      <DatePickerDispatchContext.Provider value={dispatch}>
        <Container
          readOnly={readOnly}
          hasError={hasError}
          isOpen={state.showQuickSelect || state.showBeginDate || state.showEndDate}
        >
          <Popover
            open={state.showQuickSelect}
            onOpenChange={(open) =>
              dispatch({ type: 'toggle_quick_select_popover', payload: { toggleQuickSelect: open } })
            }
          >
            <Popover.Trigger asChild>
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
            </Popover.Trigger>
            <Popover.Content>
              <QuickSelect id={`quick-select-${id}`} />
            </Popover.Content>
          </Popover>
          <Popover
            open={state.showBeginDate}
            onOpenChange={(open) => dispatch({ type: 'toggle_begin_date_popover', payload: { toggleBeginDate: open } })}
          >
            <Popover.Trigger asChild>
              <div
                onClick={() => {
                  dispatch({ type: 'toggle_begin_date_popover', payload: { toggleBeginDate: !state.showBeginDate } });
                }}
              >
                begin date
              </div>
            </Popover.Trigger>
            <Popover.Content>
              <DateSelector />
            </Popover.Content>
          </Popover>
          <ArrowRightIcon size={18} style={{ marginLeft: '10px', marginRight: '10px' }} />
          <Popover
            open={state.showEndDate}
            onOpenChange={(open) => {
              dispatch({ type: 'toggle_end_date_popover', payload: { toggleEndDate: open } });
            }}
          >
            <Popover.Trigger asChild>
              <div
                onClick={() => {
                  dispatch({ type: 'toggle_end_date_popover', payload: { toggleEndDate: !state.showEndDate } });
                }}
              >
                end date
              </div>
            </Popover.Trigger>
            <Popover.Content>
              <DateSelector />{' '}
            </Popover.Content>
          </Popover>
        </Container>
      </DatePickerDispatchContext.Provider>
    </DatePickerContext.Provider>
  );
};
